import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { generateWithGemma } from "@/lib/gemma";
import { parseModelJson } from "@/lib/json";
import { buildGenerateQuestionsPrompt } from "@/lib/prompts/generateQuestions";
import { buildGenerateTheoryQuestionsPrompt } from "@/lib/prompts/generateTheoryQuestions";
import { isDifficulty, isExamType, requireString } from "@/lib/validation";
import {
  DEFAULT_QUESTION_COUNT,
  THEORY_QUESTION_COUNT,
  type PracticeQuestion,
  type TheoryQuestion
} from "@/types/practice";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();

    if (!isExamType(body.examType)) {
      throw new Error("Valid exam type is required");
    }

    if (!isDifficulty(body.difficulty)) {
      throw new Error("Valid difficulty is required");
    }

    const subject = requireString(body.subject, "Subject");
    const topic = requireString(body.topic, "Topic");
    const questionCount = DEFAULT_QUESTION_COUNT;
    const text = await generateWithGemma(
      buildGenerateQuestionsPrompt({
        examType: body.examType,
        subject,
        topic,
        difficulty: body.difficulty,
        questionCount
      })
    );
    const data = parseModelJson<{ questions: PracticeQuestion[] }>(text);
    const questions = data.questions.slice(0, questionCount);

    if (questions.length !== questionCount) {
      throw new Error("AI did not return exactly 20 questions");
    }

    let theoryQuestions: TheoryQuestion[] = [];

    if (body.examType === "WAEC" || body.examType === "NECO") {
      const theoryText = await generateWithGemma(
        buildGenerateTheoryQuestionsPrompt({
          examType: body.examType,
          subject,
          topic,
          difficulty: body.difficulty,
          questionCount: THEORY_QUESTION_COUNT
        })
      );
      const theoryData = parseModelJson<{ theoryQuestions: TheoryQuestion[] }>(
        theoryText
      );

      theoryQuestions = theoryData.theoryQuestions.slice(0, THEORY_QUESTION_COUNT);

      if (theoryQuestions.length !== THEORY_QUESTION_COUNT) {
        throw new Error("AI did not return exactly 4 theory questions");
      }
    }

    const db = await getDb();
    const createdAt = new Date().toISOString();
    const result = await db.collection("practiceSessions").insertOne({
      userId: user.id,
      examType: body.examType,
      subject,
      topic,
      difficulty: body.difficulty,
      questionCount,
      questions,
      theoryQuestionCount: theoryQuestions.length,
      theoryQuestions,
      createdAt
    });

    return NextResponse.json({
      sessionId: result.insertedId.toString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate questions" },
      { status: 400 }
    );
  }
}
