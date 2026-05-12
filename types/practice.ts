export type ExamType = "JAMB" | "WAEC" | "NECO";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type Department =
  | "Arts"
  | "Science"
  | "Commercial"
  | "Technical"
  | "General"
  | "Electives";

export type QuestionOption = "A" | "B" | "C" | "D";

export type PracticeQuestion = {
  id: string;
  question: string;
  options: Record<QuestionOption, string>;
  correctAnswer: QuestionOption;
  topicTag?: string;
};

export type TheoryQuestion = {
  id: string;
  question: string;
  expectedAnswer: string;
  markingGuide: string[];
  topicTag?: string;
};

export type StudentAnswers = Record<string, QuestionOption>;

export type TheoryAnswerImage = {
  data: string;
  mimeType: string;
  name?: string;
};

export type TheoryStudentAnswer = {
  text?: string;
  image?: TheoryAnswerImage;
};

export type TheoryStudentAnswers = Record<string, TheoryStudentAnswer>;

export type PracticeResult = {
  questionId: string;
  studentAnswer?: QuestionOption;
  correctAnswer: QuestionOption;
  isCorrect: boolean;
};

export type TheoryResult = {
  questionId: string;
  studentAnswer?: string;
  submittedImage?: boolean;
  similarity: number;
  isCorrect: boolean;
  feedback: string;
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
  theoryQuestionCount?: number;
  theoryQuestions?: TheoryQuestion[];
  studentAnswers?: StudentAnswers;
  theoryStudentAnswers?: Record<string, { text?: string; submittedImage?: boolean }>;
  results?: PracticeResult[];
  theoryResults?: TheoryResult[];
  score?: number;
  total?: number;
  completedAt?: string;
  createdAt: string;
};

export const EXAM_TYPES: ExamType[] = ["JAMB", "WAEC", "NECO"];

export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export const DEPARTMENTS: Department[] = [
  "Science",
  "Arts",
  "Commercial",
  "Technical",
  "General",
  "Electives"
];

export const DEFAULT_QUESTION_COUNT = 20;

export const THEORY_QUESTION_COUNT = 4;

export const CORE_SUBJECTS = [
  "Mathematics",
  "English Language",
  "Civic Education",
  "Computer Studies"
];

export const DEPARTMENT_SUBJECTS: Record<Department, string[]> = {
  Arts: [
    "Literature in English",
    "Government",
    "History",
    "Christian Religious Studies",
    "Islamic Religious Studies",
    "Fine Art"
  ],
  Science: [
    "Biology",
    "Chemistry",
    "Physics",
    "Further Mathematics",
    "Geography"
  ],
  Commercial: [
    "Accounting",
    "Commerce",
    "Economics",
    "Marketing",
    "Office Practice"
  ],
  Technical: [
    "Technical Drawing",
    "Basic Electricity",
    "Further Mathematics"
  ],
  General: CORE_SUBJECTS,
  Electives: [
    "French",
    "Music",
    "Fine Art",
    "Geography",
    "Economics",
    "Food and Nutrition",
    "Tourism"
  ]
};

export const SUBJECTS = [
  ...CORE_SUBJECTS,
  ...DEPARTMENTS.flatMap((department) => DEPARTMENT_SUBJECTS[department])
].filter((subject, index, subjects) => subjects.indexOf(subject) === index);

export function getSubjectsForDepartment(department: Department) {
  return [...CORE_SUBJECTS, ...DEPARTMENT_SUBJECTS[department]].filter(
    (subject, index, subjects) => subjects.indexOf(subject) === index
  );
}
