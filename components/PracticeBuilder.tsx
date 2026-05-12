"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  DEFAULT_QUESTION_COUNT,
  DEPARTMENTS,
  DIFFICULTIES,
  EXAM_TYPES,
  getSubjectsForDepartment,
  type Department,
  type Difficulty,
  type ExamType
} from "@/types/practice";

export default function PracticeBuilder() {
  const router = useRouter();
  const [examType, setExamType] = useState<ExamType>("JAMB");
  const [department, setDepartment] = useState<Department | "">("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [topics, setTopics] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [useCustomTopic, setUseCustomTopic] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [starting, setStarting] = useState(false);
  const departmentSubjects = useMemo(
    () => (department ? getSubjectsForDepartment(department) : []),
    [department]
  );

  async function generateTopics() {
    if (!department || !subject) {
      toast.error("Select a class arm and subject first.");
      return;
    }

    setLoadingTopics(true);

    try {
      const response = await fetch("/api/ai/generate-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examType, subject })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate topics");
      }

      setTopics(data.topics);
      setTopic(data.topics[0] || "");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to generate topics");
    } finally {
      setLoadingTopics(false);
    }
  }

  async function startPractice() {
    const selectedTopic = useCustomTopic ? customTopic.trim() : topic.trim();

    if (!selectedTopic) {
      toast.error("Choose a suggested topic or type your own topic.");
      return;
    }

    setStarting(true);

    try {
      const response = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examType,
          subject,
          topic: selectedTopic,
          difficulty
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create practice session");
      }

      router.push(`/practice/session/${data.sessionId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create practice session");
    } finally {
      setStarting(false);
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-2xl gap-4 rounded-lg border border-black bg-[#FAF3E1] p-4 shadow-sm sm:p-5">
      <div className="grid gap-4">
        <Field label="Exam type">
          <select
            className="h-12 rounded-md border border-black px-4 text-base font-semibold"
            value={examType}
            onChange={(event) => setExamType(event.target.value as ExamType)}
          >
            {EXAM_TYPES.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Class arm">
          <select
            className="h-12 rounded-md border border-black px-4 text-base font-semibold"
            value={department}
            onChange={(event) => {
              const nextDepartment = event.target.value as Department | "";

              if (!nextDepartment) {
                setDepartment("");
                setSubject("");
                setTopics([]);
                setTopic("");
                setCustomTopic("");
                return;
              }

              const nextSubjects = getSubjectsForDepartment(nextDepartment);

              setDepartment(nextDepartment);
              setSubject(nextSubjects[0]);
              setTopics([]);
              setTopic("");
              setCustomTopic("");
            }}
          >
            <option value="">Select Class Arm</option>
            {DEPARTMENTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>

        {department ? (
          <div className="grid gap-2">
            <p className="text-base font-bold text-black">Subjects in this arm</p>
            <div className="flex flex-wrap gap-2">
              {departmentSubjects.map((item) => (
                <button
                  className={`rounded-full border px-3 py-2 text-sm font-bold ${
                    item === subject
                      ? "border-black bg-black text-[#FAF3E1]"
                      : "border-black bg-[#FAF3E1] text-black"
                  }`}
                  key={item}
                  type="button"
                  onClick={() => {
                    setSubject(item);
                    setTopics([]);
                    setTopic("");
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <Field label="Difficulty">
          <select
            className="h-12 rounded-md border border-black px-4 text-base font-semibold"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as Difficulty)}
          >
            {DIFFICULTIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-3">
        <p className="text-base font-bold text-black">Topic</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            aria-pressed={!useCustomTopic}
            className={`h-12 rounded-md border-2 border-black px-5 text-base font-bold disabled:opacity-50 ${
              !useCustomTopic
                ? "bg-black text-[#FAF3E1]"
                : "bg-[#FAF3E1] text-black"
            }`}
            type="button"
            onClick={() => {
              setUseCustomTopic(false);
              setCustomTopic("");
              void generateTopics();
            }}
            disabled={loadingTopics}
          >
            {loadingTopics ? "Generating topics..." : "Suggest 10 topics"}
          </button>
          <button
            aria-pressed={useCustomTopic}
            className={`h-12 rounded-md border-2 border-black px-5 text-base font-bold ${
              useCustomTopic
                ? "bg-black text-[#FAF3E1]"
                : "bg-[#FAF3E1] text-black"
            }`}
            type="button"
            onClick={() => {
              setUseCustomTopic(true);
              setTopic("");
            }}
          >
            Custom topic
          </button>
        </div>
        {useCustomTopic ? (
          <div className="grid gap-2">
            <input
              className="h-12 rounded-md border border-black px-4 text-base font-semibold"
              placeholder="Type a topic if it is not listed"
              value={customTopic}
              onChange={(event) => setCustomTopic(event.target.value)}
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="h-12 rounded-md bg-black px-5 text-base font-bold text-[#FAF3E1] disabled:opacity-50"
          type="button"
          onClick={startPractice}
          disabled={starting}
        >
          {starting
            ? "Creating practice..."
            : examType === "JAMB"
              ? `Start ${DEFAULT_QUESTION_COUNT} questions`
              : `Start ${DEFAULT_QUESTION_COUNT} objective + 4 theory`}
        </button>
      </div>

      {!useCustomTopic && topics.length > 0 ? (
        <div className="grid gap-3">
          <p className="text-base font-semibold text-black">
            Pick a suggested topic or type your own.
          </p>
          <div className="flex flex-wrap gap-2">
            {topics.map((item) => (
              <button
                key={item}
                type="button"
                className={`rounded-full border px-4 py-2 text-base font-semibold ${
                  item === topic
                    ? "border-black bg-black text-[#FAF3E1]"
                    : "border-black bg-[#FAF3E1] text-black"
                }`}
                onClick={() => {
                  setTopic(item);
                  setCustomTopic("");
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}

    </section>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-base font-bold text-black">
      {label}
      {children}
    </label>
  );
}
