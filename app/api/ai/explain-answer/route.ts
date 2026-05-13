import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { generateWithGemma } from "@/lib/gemma";
import { parseModelJson } from "@/lib/json";
import { buildExplainAnswerPrompt } from "@/lib/prompts/explainAnswer";
import type { PracticeSession } from "@/types/practice";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();

    if (typeof body.sessionId !== "string" || !ObjectId.isValid(body.sessionId)) {
      throw new Error("Valid session id is required");
    }

    if (typeof body.questionId !== "string") {
      throw new Error("Question id is required");
    }

    const db = await getDb();
    const cached = await db.collection("answerExplanations").findOne({
      userId: user.id,
      sessionId: body.sessionId,
      questionId: body.questionId
    });

    if (cached) {
      return NextResponse.json(cached.content);
    }

    const session = await db
      .collection("practiceSessions")
      .findOne<PracticeSession>({
        _id: new ObjectId(body.sessionId),
        userId: user.id
      });

    if (!session) {
      return NextResponse.json({ error: "Practice session not found" }, { status: 404 });
    }

    const question = session.questions.find((item) => item.id === body.questionId);

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const text = await generateWithGemma(
      buildExplainAnswerPrompt({
        examType: session.examType,
        subject: session.subject,
        topic: session.topic,
        question,
        studentAnswer: session.studentAnswers?.[body.questionId]
      })
    );
    const content = parseModelJson(text);

    await db.collection("answerExplanations").insertOne({
      userId: user.id,
      sessionId: body.sessionId,
      questionId: body.questionId,
      content,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json(
      {
        error: getApiErrorMessage(
          error,
          "We could not explain this answer right now. Please try again."
        )
      },
      { status: 400 }
    );
  }
}
