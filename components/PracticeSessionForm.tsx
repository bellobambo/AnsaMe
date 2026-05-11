"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { PracticeQuestion, QuestionOption, StudentAnswers } from "@/types/practice";

export default function PracticeSessionForm({
  sessionId,
  questions
}: {
  sessionId: string;
  questions: PracticeQuestion[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<StudentAnswers>({});
  const [submitting, setSubmitting] = useState(false);

  async function submitPractice() {
    setSubmitting(true);

    try {
      const response = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, studentAnswers: answers })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit practice");
      }

      router.push(`/practice/results/${sessionId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to submit practice");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="grid gap-5">
      {questions.map((question, index) => (
        <article
          className="grid gap-4 rounded-lg border border-black bg-[#FAF3E1] p-5 shadow-sm"
          key={question.id}
        >
          <p className="text-base font-semibold leading-7 text-black">
            <span className="text-black">{index + 1}.</span> {question.question}
          </p>
          <div className="grid gap-2">
            {(["A", "B", "C", "D"] as QuestionOption[]).map((option) => (
              <label
                  className="flex cursor-pointer gap-3 rounded-md border border-black p-3 text-black has-checked:border-black has-checked:bg-[#FAF3E1]"
                key={option}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={() =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: option
                    }))
                  }
                />
                <span>
                  <strong>{option}.</strong> {question.options[option]}
                </span>
              </label>
            ))}
          </div>
        </article>
      ))}

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-lg border border-black bg-[#FAF3E1] p-4 shadow-lg">
        <button
          className="rounded-md bg-black px-5 py-3 font-bold text-[#FAF3E1] disabled:opacity-50"
          type="button"
          onClick={submitPractice}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit answers"}
        </button>
        <span className="text-sm font-semibold text-black">
          Answered {Object.keys(answers).length} of {questions.length}
        </span>
      </div>
    </section>
  );
}
