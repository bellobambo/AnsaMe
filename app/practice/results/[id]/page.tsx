import { ObjectId } from "mongodb";
import Link from "next/link";
import { notFound } from "next/navigation";
import PracticeResultDrawerList from "@/components/PracticeResultDrawerList";
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

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-black bg-[#FAF3E1] p-6 shadow-sm">
        <p className="text-base font-bold uppercase tracking-wide text-black">
          {session.examType} result
        </p>
        <h1 className="mt-2 text-4xl font-black text-black">{session.topic}</h1>
        <p className="mt-2 text-lg font-semibold text-black">
          {session.subject} · {session.difficulty}
        </p>
        <p className="mt-4 text-5xl font-black text-black">
          {session.score ?? 0}/{session.total ?? session.questions.length}
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          className="rounded-md bg-black px-5 py-3 text-base font-bold text-[#FAF3E1]"
          href="/"
        >
          Start new practice
        </Link>
        <Link
          className="rounded-md border border-black px-5 py-3 text-base font-bold text-black"
          href="/history"
        >
          View history
        </Link>
      </div>

      <PracticeResultDrawerList
        sessionId={id}
        examType={session.examType}
        subject={session.subject}
        topic={session.topic}
        difficulty={session.difficulty}
        questions={session.questions}
        results={session.results || []}
      />
    </div>
  );
}
