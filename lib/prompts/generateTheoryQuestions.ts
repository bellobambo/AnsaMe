import type { Difficulty, ExamType } from "@/types/practice";

export function buildGenerateTheoryQuestionsPrompt(input: {
  examType: Extract<ExamType, "WAEC" | "NECO">;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  questionCount: number;
}) {
  return `
You are AnsaMe, an AI theory-question generator for Nigerian students preparing for ${input.examType}.

Generate exactly ${input.questionCount} standard ${input.examType} theory questions.

Exam: ${input.examType}
Subject: ${input.subject}
Topic: ${input.topic}
Difficulty: ${input.difficulty}

Rules:
- Match ${input.examType} theory-question style and level.
- Use clear questions that require short written answers, workings, definitions, explanations, or labelled steps where appropriate.
- Keep each question focused enough for a student to answer in a few paragraphs.
- Provide a model expected answer and a marking guide with the key points needed for a correct answer.
- The marking guide should support judging whether a student's answer matches the expected answer by at least 75%.

Return JSON only:
{
  "theoryQuestions": [
    {
      "id": "t1",
      "question": "Theory question text",
      "expectedAnswer": "Model answer a strong student could give",
      "markingGuide": ["Required point 1", "Required point 2", "Required point 3"],
      "topicTag": "${input.topic}"
    }
  ]
}
`.trim();
}
