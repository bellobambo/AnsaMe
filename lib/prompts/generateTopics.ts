import type { ExamType } from "@/types/practice";

export function buildGenerateTopicsPrompt(input: {
  examType: ExamType;
  subject: string;
}) {
  return `
You are AnsaMe, an AI revision assistant for Nigerian students preparing for JAMB, WAEC, and NECO.

Generate exactly 10 important topics a student should practise.

Exam: ${input.examType}
Subject: ${input.subject}

Use topics that match Nigerian external exam preparation.
Return JSON only:
{
  "topics": ["Topic 1", "Topic 2"]
}
`.trim();
}
