import type { Difficulty, ExamType, QuestionOption } from "@/types/practice";

export function isExamType(value: unknown): value is ExamType {
  return value === "JAMB" || value === "WAEC" || value === "NECO";
}

export function isDifficulty(value: unknown): value is Difficulty {
  return value === "Easy" || value === "Medium" || value === "Hard";
}

export function isQuestionOption(value: unknown): value is QuestionOption {
  return value === "A" || value === "B" || value === "C" || value === "D";
}

export function requireString(value: unknown, name: string) {
  if (typeof value !== "string" || value.trim().length < 2) {
    throw new Error(`${name} is required`);
  }

  return value.trim();
}
