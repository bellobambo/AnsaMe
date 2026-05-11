"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { Difficulty, ExamType } from "@/types/practice";

type DeepDive = {
  summary: string;
  keyPoints: string[];
  commonMistakes: string[];
  workedExample: string;
  whatToReviseNext: string[];
};

export default function TopicDeepDiveButton({
  examType,
  subject,
  topic,
  difficulty
}: {
  examType: ExamType;
  subject: string;
  topic: string;
  difficulty: Difficulty;
}) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<DeepDive | null>(null);

  async function studyTopic() {
    setLoading(true);

    try {
      const response = await fetch("/api/ai/topic-deep-dive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examType, subject, topic, difficulty })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create topic guide");
      }

      setContent(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create topic guide");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <button
        className="w-fit rounded-md border border-black px-3 py-2 text-sm font-bold text-black disabled:opacity-50"
        type="button"
        onClick={studyTopic}
        disabled={loading}
      >
        {loading ? "Loading guide..." : "Study this topic"}
      </button>
      {content ? (
        <div className="grid gap-4 rounded-md border border-black bg-[#FAF3E1] p-5 text-base leading-7">
          <p>{content.summary}</p>
          <List title="Key points" items={content.keyPoints} />
          <List title="Common mistakes" items={content.commonMistakes} />
          <p>
            <strong>Worked example:</strong> {content.workedExample}
          </p>
          <List title="Revise next" items={content.whatToReviseNext} />
        </div>
      ) : null}
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <strong>{title}</strong>
      <ul className="mt-1 list-disc pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
