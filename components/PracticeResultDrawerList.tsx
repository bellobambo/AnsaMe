"use client";

import { useMemo, useState } from "react";
import { Drawer } from "antd";
import ExplainAnswerButton from "@/components/ExplainAnswerButton";
import TopicDeepDiveButton from "@/components/TopicDeepDiveButton";
import type {
  Difficulty,
  ExamType,
  PracticeQuestion,
  PracticeResult,
  TheoryQuestion,
  TheoryResult
} from "@/types/practice";

export default function PracticeResultDrawerList({
  sessionId,
  examType,
  subject,
  topic,
  difficulty,
  questions,
  results,
  theoryQuestions = [],
  theoryResults = []
}: {
  sessionId: string;
  examType: ExamType;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  questions: PracticeQuestion[];
  results: PracticeResult[];
  theoryQuestions?: TheoryQuestion[];
  theoryResults?: TheoryResult[];
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
  const theoryResultByQuestion = useMemo(
    () => new Map(theoryResults.map((result) => [result.questionId, result])),
    [theoryResults]
  );

  return (
    <section className="grid gap-4">
      <div className="grid gap-2">
        <h2 className="text-2xl font-black text-black">Objective review</h2>
      </div>
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
                  key={`explain-${activeQuestion.id}`}
                  sessionId={sessionId}
                  questionId={activeQuestion.id}
                />
              </div>
              <div className="flex justify-end">
                <TopicDeepDiveButton
                  key={`deep-dive-${activeQuestion.id}-${activeQuestion.topicTag || topic}`}
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

      {theoryQuestions.length > 0 ? (
        <section className="grid gap-3">
          <div className="grid gap-1 border-t border-black pt-5">
            <h2 className="text-2xl font-black text-black">Theory review</h2>
            <p className="text-sm font-semibold text-black">
              Theory answers pass when Gemma marks them at 75% similarity or higher.
            </p>
          </div>
          <div className="grid gap-3">
            {theoryQuestions.map((question, index) => {
              const result = theoryResultByQuestion.get(question.id);

              return (
                <article
                  className="grid gap-4 rounded-lg border border-black bg-[#FAF3E1] p-5 text-black"
                  key={question.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-lg font-black">Theory {index + 1}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        result?.isCorrect
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {result?.isCorrect ? "Correct" : "Review"}
                    </span>
                  </div>
                  <p className="text-base font-semibold leading-7">{question.question}</p>
                  <div className="grid gap-2 rounded-md border border-black p-4">
                    <p className="text-sm font-black uppercase tracking-wide">
                      Your answer
                    </p>
                    <p className="text-base leading-7">
                      {result?.studentAnswer || "No typed answer submitted."}
                    </p>
                    {result?.submittedImage ? (
                      <p className="text-sm font-semibold">
                        A written-answer image was submitted and included in marking.
                      </p>
                    ) : null}
                  </div>
                  <div className="grid gap-2 rounded-md border border-black p-4">
                    <p className="text-sm font-black uppercase tracking-wide">
                      Model answer
                    </p>
                    <p className="text-base leading-7">{question.expectedAnswer}</p>
                  </div>
                  <div className="grid gap-2">
                    <p className="text-base font-black">
                      Similarity: {Math.round(result?.similarity || 0)}%
                    </p>
                    <p className="text-base leading-7">
                      {result?.feedback || "This theory answer was not marked."}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </section>
  );
}
