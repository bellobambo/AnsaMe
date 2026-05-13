"use client";

import { useEffect, useState } from "react";
import { Drawer } from "antd";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getClientErrorMessage } from "@/lib/clientErrors";
import type {
  PracticeQuestion,
  QuestionOption,
  StudentAnswers,
  TheoryQuestion,
  TheoryStudentAnswers
} from "@/types/practice";

type StoredTheoryDraft = Record<string, { text?: string }>;

type PracticeDraft = {
  studentAnswers?: StudentAnswers;
  theoryStudentAnswers?: StoredTheoryDraft;
};

function getDraftKey(sessionId: string) {
  return `ansame:practice-draft:${sessionId}`;
}

function readPracticeDraft(sessionId: string): PracticeDraft {
  if (typeof window === "undefined") {
    return {};
  }

  const draftKey = getDraftKey(sessionId);
  const savedDraft = window.localStorage.getItem(draftKey);

  if (!savedDraft) {
    return {};
  }

  try {
    return JSON.parse(savedDraft) as PracticeDraft;
  } catch {
    window.localStorage.removeItem(draftKey);
    return {};
  }
}

export default function PracticeSessionForm({
  sessionId,
  createdAt,
  questions,
  theoryQuestions = []
}: {
  sessionId: string;
  createdAt: string;
  questions: PracticeQuestion[];
  theoryQuestions?: TheoryQuestion[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<StudentAnswers>(
    () => readPracticeDraft(sessionId).studentAnswers || {}
  );
  const [theoryAnswers, setTheoryAnswers] = useState<TheoryStudentAnswers>(
    () => readPracticeDraft(sessionId).theoryStudentAnswers || {}
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const draftKey = getDraftKey(sessionId);
  const answeredCount = Object.keys(answers).length;
  const theoryAnsweredCount = theoryQuestions.filter((question) => {
    const answer = theoryAnswers[question.id];

    return Boolean(answer?.text?.trim() || answer?.image);
  }).length;
  const totalQuestionCount = questions.length + theoryQuestions.length;

  useEffect(() => {
    const theoryTextDraft = Object.fromEntries(
      Object.entries(theoryAnswers)
        .filter(([, answer]) => answer.text?.trim())
        .map(([questionId, answer]) => [questionId, { text: answer.text }])
    );
    const draft: PracticeDraft = {
      studentAnswers: answers,
      theoryStudentAnswers: theoryTextDraft
    };

    window.localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [answers, draftKey, theoryAnswers]);

  async function attachTheoryImage(questionId: string, file?: File) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Upload an image file for theory answers.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Theory answer images must be 2MB or smaller.");
      return;
    }

    const data = await fileToBase64(file);

    setTheoryAnswers((current) => ({
      ...current,
      [questionId]: {
        ...current[questionId],
        image: {
          data,
          mimeType: file.type,
          name: file.name
        }
      }
    }));
  }

  async function submitPractice() {
    setSubmitting(true);

    try {
      const response = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          studentAnswers: answers,
          theoryStudentAnswers: theoryAnswers
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit practice");
      }

      window.localStorage.removeItem(draftKey);
      toast.success("Answers submitted.");
      router.push(`/practice/results/${sessionId}`);
    } catch (err) {
      toast.error(
        getClientErrorMessage(
          err,
          "We could not submit your answers right now. Please try again."
        )
      );
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
            {answeredCount + theoryAnsweredCount}/{totalQuestionCount} answered
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
        title={`Practice session · ${totalQuestionCount} questions`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        rootClassName="ansame-drawer"
        width="min(980px, 100vw)"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3 text-black">
            <span className="text-base font-semibold">
              Answered {answeredCount + theoryAnsweredCount} of {totalQuestionCount}
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
          <section className="grid gap-3">
            <h2 className="text-xl font-black text-black">Objective questions</h2>
          </section>
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
          {theoryQuestions.length > 0 ? (
            <section className="grid gap-4">
              <div className="grid gap-1 border-t border-black pt-5">
                <h2 className="text-xl font-black text-black">Theory questions</h2>
                <p className="text-sm font-semibold text-black">
                  Type your answer, upload a photo of your written answer, or do both.
                </p>
              </div>
              {theoryQuestions.map((question, index) => {
                const answer = theoryAnswers[question.id];

                return (
                  <article
                    className="grid gap-4 rounded-lg border border-black bg-[#FAF3E1] p-4"
                    key={question.id}
                  >
                    <p className="text-lg font-semibold leading-8 text-black">
                      <span className="font-black">Theory {index + 1}.</span>{" "}
                      {question.question}
                    </p>
                    <textarea
                      className="min-h-36 rounded-md border border-black bg-white px-4 py-3 text-base leading-7 text-black"
                      placeholder="Type your theory answer here"
                      value={answer?.text || ""}
                      onChange={(event) =>
                        setTheoryAnswers((current) => ({
                          ...current,
                          [question.id]: {
                            ...current[question.id],
                            text: event.target.value
                          }
                        }))
                      }
                    />
                    <label className="grid gap-2 text-sm font-bold text-black">
                      Upload written answer image
                      <input
                        className="rounded-md border border-black bg-white p-3 text-sm font-semibold"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          void attachTheoryImage(question.id, event.target.files?.[0]);
                        }}
                      />
                    </label>
                    {answer?.image ? (
                      <p className="text-sm font-semibold text-black">
                        Attached: {answer.image.name || "theory answer image"}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </section>
          ) : null}
        </div>
      </Drawer>
    </section>
  );
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");
      const [, base64 = ""] = result.split(",");

      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.readAsDataURL(file);
  });
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
