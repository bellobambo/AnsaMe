import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { generateWithGemma } from "@/lib/gemma";
import { parseModelJson } from "@/lib/json";
import { buildGenerateTopicsPrompt } from "@/lib/prompts/generateTopics";
import { isExamType, requireString } from "@/lib/validation";

function parseErrorMessage(message: string) {
  try {
    return JSON.parse(message) as unknown;
  } catch {
    return undefined;
  }
}

function errorForLog(error: unknown) {
  if (!(error instanceof Error)) {
    return { message: "Unknown error", value: error };
  }

  const parsedMessage = parseErrorMessage(error.message);

  return {
    name: error.name,
    message: error.message,
    parsedMessage
  };
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let examType: unknown;
  let subject = "";

  try {
    await requireApiUser();
    const body = await request.json();
    examType = body.examType;

    if (!isExamType(body.examType)) {
      throw new Error("Valid exam type is required");
    }

    subject = requireString(body.subject, "Subject");
    const text = await generateWithGemma(
      buildGenerateTopicsPrompt({ examType: body.examType, subject })
    );
    const data = parseModelJson<{ topics: string[] }>(text);

    return NextResponse.json({
      topics: data.topics.slice(0, 10)
    });
  } catch (error) {
    console.log("[generate-topics] failed", {
      examType,
      subject,
      durationMs: Date.now() - startedAt,
      error: errorForLog(error)
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate topics" },
      { status: 400 }
    );
  }
}
