"use client";

import { useState } from "react";
import { Drawer } from "antd";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { PracticeQuestion, QuestionOption, StudentAnswers } from "@/types/practice";

export default function PracticeSessionForm({
  sessionId,
  createdAt,
  questions
}: {
  sessionId: string;
  createdAt: string;
  questions: PracticeQuestion[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<StudentAnswers>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const answeredCount = Object.keys(answers).length;

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
      <button
        className="grid gap-4 rounded-lg border border-black bg-[#FAF3E1] p-5 text-left text-black shadow-sm transition hover:-translate-y-0.5"
        type="button"
        onClick={() => setDrawerOpen(true)}
      >
        <span className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-lg font-black">Practice session</span>
          <span className="rounded-full bg-black px-3 py-1 text-sm font-bold text-[#FAF3E1]">
            {answeredCount}/{questions.length} answered
          </span>
        </span>
        <span className="grid gap-2 text-sm font-semibold leading-6 sm:grid-cols-2">
          <span>
            <strong>Session ID:</strong> {sessionId}
          </span>
          <span>
            <strong>Timestamp:</strong> {formatTimestamp(createdAt)}
          </span>
        </span>
        <span className="w-fit rounded-md border border-black px-4 py-2 text-sm font-bold">
          Open questions
        </span>
      </button>

      <Drawer
        title={`Practice session · ${questions.length} questions`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        rootClassName="ansame-drawer"
        width="min(980px, 100vw)"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3 text-black">
            <span className="text-base font-semibold">
              Answered {answeredCount} of {questions.length}
            </span>
            <button
              className="rounded-md bg-black px-5 py-3 text-base font-bold text-[#FAF3E1] disabled:opacity-40"
              type="button"
              onClick={submitPractice}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit answers"}
            </button>
          </div>
        }
      >
        <div className="grid gap-5">
          {questions.map((question, index) => (
            <article
              className="grid gap-4 rounded-lg border border-black bg-[#FAF3E1] p-4"
              key={question.id}
            >
              <p className="text-lg font-semibold leading-8 text-black">
                <span className="font-black">Question {index + 1}.</span>{" "}
                {question.question}
              </p>
              <div className="grid gap-2">
                {(["A", "B", "C", "D"] as QuestionOption[]).map((option) => (
                  <AnswerOption
                    checked={answers[question.id] === option}
                    key={option}
                    name={question.id}
                    option={option}
                    text={question.options[option]}
                    onChange={() =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: option
                      }))
                    }
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
      </Drawer>
    </section>
  );
}

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getUTCDate()).padStart(2, "0")} ${String(
    date.getUTCHours()
  ).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")} UTC`;
}

function AnswerOption({
  checked,
  name,
  option,
  text,
  onChange
}: {
  checked: boolean;
  name: string;
  option: QuestionOption;
  text: string;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-md border p-4 text-base leading-7 ${
        checked ? "border-black bg-black text-[#FAF3E1]" : "border-black bg-[#FAF3E1] text-black"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={option}
        checked={checked}
        onChange={onChange}
      />
      <span>
        <strong>{option}.</strong> {text}
      </span>
    </label>
  );
}
