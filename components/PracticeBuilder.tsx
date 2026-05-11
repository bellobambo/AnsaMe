"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  DEFAULT_QUESTION_COUNT,
  DIFFICULTIES,
  EXAM_TYPES,
  SUBJECTS,
  type Difficulty,
  type ExamType
} from "@/types/practice";

export default function PracticeBuilder() {
  const router = useRouter();
  const [examType, setExamType] = useState<ExamType>("JAMB");
  const [subject, setSubject] = useState("Biology");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [topics, setTopics] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [starting, setStarting] = useState(false);

  async function generateTopics() {
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
    const selectedTopic = customTopic.trim() || topic.trim();

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
    <section className="grid gap-5 rounded-lg border border-black bg-[#FAF3E1] p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Exam type">
          <select
            className="h-11 rounded-md border border-black px-3"
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

        <Field label="Subject">
          <select
            className="h-11 rounded-md border border-black px-3"
            value={subject}
            onChange={(event) => {
              setSubject(event.target.value);
              setTopics([]);
              setTopic("");
            }}
          >
            {SUBJECTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Difficulty">
          <select
            className="h-11 rounded-md border border-black px-3"
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

        <Field label="Custom topic">
          <input
            className="h-11 rounded-md border border-black px-3"
            placeholder="Type a topic if it is not listed"
            value={customTopic}
            onChange={(event) => setCustomTopic(event.target.value)}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-md border-2 border-black bg-[#FAF3E1] px-4 py-2 font-bold text-black disabled:opacity-50"
          type="button"
          onClick={generateTopics}
          disabled={loadingTopics}
        >
          {loadingTopics ? "Generating topics..." : "Suggest 10 topics"}
        </button>
        <button
          className="rounded-md bg-black px-4 py-2 font-bold text-[#FAF3E1] disabled:opacity-50"
          type="button"
          onClick={startPractice}
          disabled={starting}
        >
          {starting ? "Creating practice..." : `Start ${DEFAULT_QUESTION_COUNT} questions`}
        </button>
      </div>

      {topics.length > 0 ? (
        <div className="grid gap-3">
          <p className="text-sm font-semibold text-black">
            Pick a suggested topic or type your own.
          </p>
          <div className="flex flex-wrap gap-2">
            {topics.map((item) => (
              <button
                key={item}
                type="button"
                className={`rounded-full border px-3 py-2 text-sm font-semibold ${
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
    <label className="grid gap-2 text-sm font-bold text-black">
      {label}
      {children}
    </label>
  );
}
