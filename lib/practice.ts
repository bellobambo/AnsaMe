import type {
  PracticeQuestion,
  PracticeResult,
  StudentAnswers
} from "@/types/practice";

export function markPractice(
  questions: PracticeQuestion[],
  studentAnswers: StudentAnswers
) {
  const results: PracticeResult[] = questions.map((question) => {
    const studentAnswer = studentAnswers[question.id];

    return {
      questionId: question.id,
      studentAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: studentAnswer === question.correctAnswer
    };
  });

  return {
    score: results.filter((result) => result.isCorrect).length,
    total: questions.length,
    results
  };
}
