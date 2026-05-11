import type { ExamType, PracticeQuestion, QuestionOption } from "@/types/practice";

export function buildExplainAnswerPrompt(input: {
  examType: ExamType;
  subject: string;
  topic: string;
  question: PracticeQuestion;
  studentAnswer?: QuestionOption;
}) {
  return `
You are AnsaMe, an AI tutor for Nigerian students preparing for ${input.examType}.

Explain this answer in simple language.

Subject: ${input.subject}
Topic: ${input.topic}
Question: ${input.question.question}
A. ${input.question.options.A}
B. ${input.question.options.B}
C. ${input.question.options.C}
D. ${input.question.options.D}
Student answer: ${input.studentAnswer || "Not answered"}
Correct answer: ${input.question.correctAnswer}

Return JSON only:
{
  "explanation": "Why the correct answer is correct",
  "studentFeedback": "Tell the student if they were correct or what they misunderstood",
  "examTip": "One practical exam tip"
}
`.trim();
}
