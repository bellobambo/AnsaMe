import type { Difficulty, ExamType } from "@/types/practice";

export function buildTopicDeepDivePrompt(input: {
  examType: ExamType;
  subject: string;
  topic: string;
  difficulty: Difficulty;
}) {
  return `
You are AnsaMe, an AI revision tutor for Nigerian students preparing for ${input.examType}.

Create an in-depth revision guide for this topic.

Subject: ${input.subject}
Topic: ${input.topic}
Difficulty: ${input.difficulty}

Return JSON only:
{
  "summary": "Short topic summary",
  "keyPoints": ["Point 1", "Point 2"],
  "commonMistakes": ["Mistake 1", "Mistake 2"],
  "workedExample": "One clear worked example",
  "whatToReviseNext": ["Related topic 1", "Related topic 2"]
}
`.trim();
}
