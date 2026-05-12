import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { buildImagePart, generateWithGemmaParts } from "@/lib/gemma";
import { parseModelJson } from "@/lib/json";
import { combinePracticeMarks, markPractice } from "@/lib/practice";
import { buildMarkTheoryAnswerPrompt } from "@/lib/prompts/markTheoryAnswer";
import { isQuestionOption } from "@/lib/validation";
import type {
  PracticeSession,
  StudentAnswers,
  TheoryResult,
  TheoryStudentAnswer,
  TheoryStudentAnswers
} from "@/types/practice";

const MAX_THEORY_IMAGE_BYTES = 2 * 1024 * 1024;

function parseTheoryImage(value: unknown) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const image = value as Record<string, unknown>;

  if (typeof image.data !== "string" || typeof image.mimeType !== "string") {
    return undefined;
  }

  if (!image.mimeType.startsWith("image/")) {
    return undefined;
  }

  const byteLength = Math.ceil((image.data.length * 3) / 4);

  if (byteLength > MAX_THEORY_IMAGE_BYTES) {
    throw new Error("Theory answer images must be 2MB or smaller");
  }

  return {
    data: image.data,
    mimeType: image.mimeType,
    name: typeof image.name === "string" ? image.name : undefined
  };
}

function parseTheoryAnswers(value: unknown) {
  const theoryAnswers: TheoryStudentAnswers = {};

  if (!value || typeof value !== "object") {
    return theoryAnswers;
  }

  for (const [questionId, answer] of Object.entries(value)) {
    if (!answer || typeof answer !== "object") {
      continue;
    }

    const input = answer as Record<string, unknown>;
    const parsed: TheoryStudentAnswer = {};

    if (typeof input.text === "string" && input.text.trim()) {
      parsed.text = input.text.trim();
    }

    const image = parseTheoryImage(input.image);

    if (image) {
      parsed.image = image;
    }

    if (parsed.text || parsed.image) {
      theoryAnswers[questionId] = parsed;
    }
  }

  return theoryAnswers;
}

async function markTheoryAnswers(
  session: PracticeSession,
  theoryStudentAnswers: TheoryStudentAnswers
) {
  if (
    (session.examType !== "WAEC" && session.examType !== "NECO") ||
    !session.theoryQuestions?.length
  ) {
    return [];
  }

  const theoryResults: TheoryResult[] = [];

  for (const question of session.theoryQuestions) {
    const answer = theoryStudentAnswers[question.id];

    if (!answer?.text && !answer?.image) {
      theoryResults.push({
        questionId: question.id,
        similarity: 0,
        isCorrect: false,
        feedback: "No theory answer was submitted."
      });
      continue;
    }

    const prompt = buildMarkTheoryAnswerPrompt({
      examType: session.examType,
      subject: session.subject,
      topic: session.topic,
      difficulty: session.difficulty,
      question,
      studentAnswer: answer.text,
      hasImage: Boolean(answer.image)
    });
    const parts = answer.image
      ? [prompt, buildImagePart(answer.image.data, answer.image.mimeType)]
      : [{ text: prompt }];
    const text = await generateWithGemmaParts(parts);
    const marked = parseModelJson<{
      similarity: number;
      isCorrect: boolean;
      feedback: string;
    }>(text);
    const similarity = Math.max(0, Math.min(100, Number(marked.similarity) || 0));

    theoryResults.push({
      questionId: question.id,
      studentAnswer: answer.text,
      submittedImage: Boolean(answer.image),
      similarity,
      isCorrect: similarity >= 75 && Boolean(marked.isCorrect),
      feedback:
        typeof marked.feedback === "string" && marked.feedback.trim()
          ? marked.feedback.trim()
          : "Marked against the expected answer and marking guide."
    });
  }

  return theoryResults;
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();

    if (typeof body.sessionId !== "string" || !ObjectId.isValid(body.sessionId)) {
      throw new Error("Valid session id is required");
    }

    if (!body.studentAnswers || typeof body.studentAnswers !== "object") {
      throw new Error("Student answers are required");
    }

    const studentAnswers: StudentAnswers = {};

    for (const [questionId, answer] of Object.entries(body.studentAnswers)) {
      if (isQuestionOption(answer)) {
        studentAnswers[questionId] = answer;
      }
    }

    const theoryStudentAnswers = parseTheoryAnswers(body.theoryStudentAnswers);
    const db = await getDb();
    const session = await db
      .collection("practiceSessions")
      .findOne<PracticeSession>({
        _id: new ObjectId(body.sessionId),
        userId: user.id
      });

    if (!session) {
      return NextResponse.json({ error: "Practice session not found" }, { status: 404 });
    }

    const objectiveMarked = markPractice(session.questions, studentAnswers);
    const theoryResults = await markTheoryAnswers(session, theoryStudentAnswers);
    const marked = combinePracticeMarks(objectiveMarked, theoryResults);
    const completedAt = new Date().toISOString();
    const storedTheoryAnswers = Object.fromEntries(
      Object.entries(theoryStudentAnswers).map(([questionId, answer]) => [
        questionId,
        {
          text: answer.text,
          submittedImage: Boolean(answer.image)
        }
      ])
    );

    await db.collection("practiceSessions").updateOne(
      { _id: new ObjectId(body.sessionId), userId: user.id },
      {
        $set: {
          studentAnswers,
          theoryStudentAnswers: storedTheoryAnswers,
          ...marked,
          completedAt
        }
      }
    );

    return NextResponse.json({
      sessionId: body.sessionId,
      ...marked,
      completedAt
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit practice" },
      { status: 400 }
    );
  }
}
