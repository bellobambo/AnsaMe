import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { markPractice } from "@/lib/practice";
import { isQuestionOption } from "@/lib/validation";
import type { PracticeQuestion, StudentAnswers } from "@/types/practice";

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

    const db = await getDb();
    const session = await db
      .collection("practiceSessions")
      .findOne<{ questions: PracticeQuestion[] }>({
        _id: new ObjectId(body.sessionId),
        userId: user.id
      });

    if (!session) {
      return NextResponse.json({ error: "Practice session not found" }, { status: 404 });
    }

    const marked = markPractice(session.questions, studentAnswers);
    const completedAt = new Date().toISOString();

    await db.collection("practiceSessions").updateOne(
      { _id: new ObjectId(body.sessionId), userId: user.id },
      {
        $set: {
          studentAnswers,
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
