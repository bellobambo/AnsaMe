import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import type { PracticeSession } from "@/types/practice";

type StoredSession = Omit<PracticeSession, "_id"> & {
  _id: { toString(): string };
};

export default async function HistoryPage() {
  const user = await requireUser();
  const db = await getDb();
  const sessions = await db
    .collection("practiceSessions")
    .find<StoredSession>({ userId: user.id })
    .sort({ createdAt: -1 })
    .limit(30)
    .toArray();

  return (
    <div className="grid gap-6">
      <section className="grid gap-2">
        <h1 className="text-3xl font-black text-black">Practice history</h1>
        <p className="text-black">
          Review previous JAMB, WAEC, and NECO practice sessions.
        </p>
      </section>

      <section className="grid gap-3">
        {sessions.length === 0 ? (
          <div className="rounded-lg border border-black bg-[#FAF3E1] p-5 text-black">
            No practice sessions yet.
          </div>
        ) : (
          sessions.map((session) => (
            <Link
              className="flex flex-col justify-between gap-3 rounded-lg border border-black bg-[#FAF3E1] p-5 shadow-sm sm:flex-row sm:items-center"
              href={`/history/${session._id.toString()}`}
              key={session._id.toString()}
            >
              <div>
                <p className="font-black text-black">
                  {session.examType} {session.subject} · {session.topic}
                </p>
                <p className="mt-1 text-sm text-black">
                  {session.difficulty} · {session.questionCount} objective
                  {session.theoryQuestionCount
                    ? ` · ${session.theoryQuestionCount} theory`
                    : ""}
                </p>
              </div>
              <p className="font-black text-black">
                {typeof session.score === "number"
                  ? `${session.score}/${session.total}`
                  : "In progress"}
              </p>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
