import { ObjectId } from "mongodb";
import Link from "next/link";
import { notFound } from "next/navigation";
import ExplainAnswerButton from "@/components/ExplainAnswerButton";
import TopicDeepDiveButton from "@/components/TopicDeepDiveButton";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import type { PracticeSession } from "@/types/practice";

export default async function PracticeResultsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  if (!ObjectId.isValid(id)) {
    notFound();
  }

  const db = await getDb();
  const session = await db
    .collection("practiceSessions")
    .findOne<PracticeSession>({ _id: new ObjectId(id), userId: user.id });

  if (!session) {
    notFound();
  }

  const resultByQuestion = new Map(
    (session.results || []).map((result) => [result.questionId, result])
  );

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-black bg-[#FAF3E1] p-5 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-black">
          {session.examType} result
        </p>
        <h1 className="mt-2 text-3xl font-black text-black">{session.topic}</h1>
        <p className="mt-2 text-black">
          {session.subject} · {session.difficulty}
        </p>
        <p className="mt-4 text-4xl font-black text-black">
          {session.score ?? 0}/{session.total ?? session.questions.length}
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          className="rounded-md bg-black px-4 py-2 font-bold text-[#FAF3E1]"
          href="/"
        >
          Start new practice
        </Link>
        <Link
          className="rounded-md border border-black px-4 py-2 font-bold text-black"
          href="/history"
        >
          View history
        </Link>
      </div>

      <section className="grid gap-4">
        {session.questions.map((question, index) => {
          const result = resultByQuestion.get(question.id);
          const isCorrect = result?.isCorrect;

          return (
            <article
              className={`grid gap-4 rounded-lg border p-5 shadow-sm ${
                isCorrect
                  ? "border-black bg-[#FAF3E1]"
                  : "border-black bg-[#FAF3E1]"
              }`}
              key={question.id}
            >
              <p className="font-semibold leading-7 text-black">
                <span className="text-black">{index + 1}.</span>{" "}
                {question.question}
              </p>
              <div className="grid gap-2 text-sm text-black sm:grid-cols-2">
                <p>
                  <strong>Your answer:</strong> {result?.studentAnswer || "Not answered"}
                </p>
                <p>
                  <strong>Correct answer:</strong> {question.correctAnswer}
                </p>
              </div>
              <div className="grid gap-1 text-sm">
                {(["A", "B", "C", "D"] as const).map((option) => (
                  <p
                    className={
                      option === question.correctAnswer
                        ? "font-bold text-black"
                        : "text-black"
                    }
                    key={option}
                  >
                    {option}. {question.options[option]}
                  </p>
                ))}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <ExplainAnswerButton sessionId={id} questionId={question.id} />
                <TopicDeepDiveButton
                  examType={session.examType}
                  subject={session.subject}
                  topic={question.topicTag || session.topic}
                  difficulty={session.difficulty}
                />
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
