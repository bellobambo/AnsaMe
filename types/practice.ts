export type ExamType = "JAMB" | "WAEC" | "NECO";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type QuestionOption = "A" | "B" | "C" | "D";

export type PracticeQuestion = {
  id: string;
  question: string;
  options: Record<QuestionOption, string>;
  correctAnswer: QuestionOption;
  topicTag?: string;
};

export type StudentAnswers = Record<string, QuestionOption>;

export type PracticeResult = {
  questionId: string;
  studentAnswer?: QuestionOption;
  correctAnswer: QuestionOption;
  isCorrect: boolean;
};

export type PracticeSession = {
  _id?: string;
  userId: string;
  examType: ExamType;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  questionCount: number;
  questions: PracticeQuestion[];
  studentAnswers?: StudentAnswers;
  results?: PracticeResult[];
  score?: number;
  total?: number;
  completedAt?: string;
  createdAt: string;
};

export const EXAM_TYPES: ExamType[] = ["JAMB", "WAEC", "NECO"];

export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export const DEFAULT_QUESTION_COUNT = 20;

export const SUBJECTS = [
  "Mathematics",
  "English Language",
  "Biology",
  "Chemistry",
  "Physics",
  "Government",
  "Economics",
  "Literature in English",
  "Commerce",
  "Accounting",
  "Geography",
  "Civic Education",
  "Christian Religious Studies",
  "Islamic Religious Studies"
];
