import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { generateWithGemma } from "@/lib/gemma";
import { parseModelJson } from "@/lib/json";
import { buildTopicDeepDivePrompt } from "@/lib/prompts/topicDeepDive";
import { isDifficulty, isExamType, requireString } from "@/lib/validation";

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
    const db = await getDb();
    const cached = await db.collection("topicDeepDives").findOne({
      userId: user.id,
      examType: body.examType,
      subject,
      topic,
      difficulty: body.difficulty
    });

    if (cached) {
      return NextResponse.json(cached.content);
    }

    const text = await generateWithGemma(
      buildTopicDeepDivePrompt({
        examType: body.examType,
        subject,
        topic,
        difficulty: body.difficulty
      })
    );
    const content = parseModelJson(text);

    await db.collection("topicDeepDives").insertOne({
      userId: user.id,
      examType: body.examType,
      subject,
      topic,
      difficulty: body.difficulty,
      content,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create topic guide" },
      { status: 400 }
    );
  }
}
