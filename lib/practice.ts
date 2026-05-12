import type {
  PracticeQuestion,
  PracticeResult,
  StudentAnswers,
  TheoryResult
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

export function combinePracticeMarks(
  objectiveResults: ReturnType<typeof markPractice>,
  theoryResults: TheoryResult[]
) {
  const theoryScore = theoryResults.filter((result) => result.isCorrect).length;

  return {
    score: objectiveResults.score + theoryScore,
    total: objectiveResults.total + theoryResults.length,
    results: objectiveResults.results,
    theoryResults
  };
}
