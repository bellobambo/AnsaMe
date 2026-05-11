"use client";

import { useMemo, useState } from "react";
import { Drawer } from "antd";
import ExplainAnswerButton from "@/components/ExplainAnswerButton";
import TopicDeepDiveButton from "@/components/TopicDeepDiveButton";
import type {
  Difficulty,
  ExamType,
  PracticeQuestion,
  PracticeResult
} from "@/types/practice";

export default function PracticeResultDrawerList({
  sessionId,
  examType,
  subject,
  topic,
  difficulty,
  questions,
  results
}: {
  sessionId: string;
  examType: ExamType;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  questions: PracticeQuestion[];
  results: PracticeResult[];
}) {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null);
  const resultByQuestion = useMemo(
    () => new Map(results.map((result) => [result.questionId, result])),
    [results]
  );
  const activeQuestion =
    activeQuestionIndex === null ? null : questions[activeQuestionIndex];
  const activeResult = activeQuestion
    ? resultByQuestion.get(activeQuestion.id)
    : undefined;

  return (
    <section className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {questions.map((question, index) => {
          const result = resultByQuestion.get(question.id);
          const isCorrect = result?.isCorrect;

          return (
            <button
              className="grid min-h-36 gap-3 rounded-lg border border-black bg-[#FAF3E1] p-5 text-left text-black shadow-sm transition hover:-translate-y-0.5"
              key={question.id}
              type="button"
              onClick={() => setActiveQuestionIndex(index)}
            >
              <span className="flex items-center justify-between gap-3 text-base font-black">
                Question {index + 1}
                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    isCorrect
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {isCorrect ? "Correct" : "Review"}
                </span>
              </span>
              <span className="line-clamp-2 text-base font-semibold leading-7">
                {question.question}
              </span>
            </button>
          );
        })}
      </div>

      <Drawer
        title={
          activeQuestionIndex === null
            ? "Question review"
            : `Question ${activeQuestionIndex + 1} of ${questions.length}`
        }
        open={activeQuestion !== null}
        onClose={() => setActiveQuestionIndex(null)}
        rootClassName="ansame-drawer"
        width="min(920px, 100vw)"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              className="rounded-md border border-black px-5 py-3 text-base font-bold text-black disabled:opacity-40"
              type="button"
              onClick={() =>
                setActiveQuestionIndex((current) =>
                  current === null ? 0 : Math.max(current - 1, 0)
                )
              }
              disabled={!activeQuestionIndex}
            >
              Previous
            </button>
            <button
              className="rounded-md bg-black px-5 py-3 text-base font-bold text-[#FAF3E1] disabled:opacity-40"
              type="button"
              onClick={() =>
                setActiveQuestionIndex((current) =>
                  current === null
                    ? 0
                    : Math.min(current + 1, questions.length - 1)
                )
              }
              disabled={
                activeQuestionIndex === null ||
                activeQuestionIndex === questions.length - 1
              }
            >
              Next
            </button>
          </div>
        }
      >
        {activeQuestion ? (
          <div className="grid gap-6 text-black">
            <p className="text-xl font-semibold leading-9">
              {activeQuestion.question}
            </p>
            <div className="grid gap-3">
              {(["A", "B", "C", "D"] as const).map((option) => {
                const isCorrectOption = option === activeQuestion.correctAnswer;
                const isWrongStudentOption =
                  option === activeResult?.studentAnswer && !activeResult.isCorrect;

                return (
                  <p
                    className={`rounded-md border p-5 text-lg leading-8 ${
                      isCorrectOption
                        ? "border-green-700 bg-green-50 text-green-900"
                        : isWrongStudentOption
                          ? "border-red-700 bg-red-50 text-red-900"
                          : "border-black bg-[#FAF3E1] text-black"
                    }`}
                    key={option}
                  >
                    {option}. {activeQuestion.options[option]}
                  </p>
                );
              })}
            </div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <ExplainAnswerButton
                  sessionId={sessionId}
                  questionId={activeQuestion.id}
                />
              </div>
              <div className="flex justify-end">
                <TopicDeepDiveButton
                  examType={examType}
                  subject={subject}
                  topic={activeQuestion.topicTag || topic}
                  difficulty={difficulty}
                />
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>
    </section>
  );
}
