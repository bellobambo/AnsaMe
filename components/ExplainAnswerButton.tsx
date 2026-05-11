"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type Explanation = {
  explanation: string;
  studentFeedback: string;
  examTip: string;
};

export default function ExplainAnswerButton({
  sessionId,
  questionId
}: {
  sessionId: string;
  questionId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<Explanation | null>(null);

  async function explain() {
    setLoading(true);

    try {
      const response = await fetch("/api/ai/explain-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, questionId })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to explain answer");
      }

      setContent(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to explain answer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <button
        className="w-fit rounded-md border-2 border-black bg-[#FAF3E1] px-3 py-2 text-sm font-bold text-black disabled:opacity-50"
        type="button"
        onClick={explain}
        disabled={loading}
      >
        {loading ? "Explaining..." : "Explain answer"}
      </button>
      {content ? (
        <div className="grid gap-2 rounded-md border border-black bg-[#FAF3E1] p-4 text-sm leading-6">
          <p>{content.explanation}</p>
          <p className="text-black">{content.studentFeedback}</p>
          <p>
            <strong>Exam tip:</strong> {content.examTip}
          </p>
        </div>
      ) : null}
    </div>
  );
}
