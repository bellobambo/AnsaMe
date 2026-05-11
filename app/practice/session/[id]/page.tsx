import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import PracticeSessionForm from "@/components/PracticeSessionForm";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import type { PracticeSession } from "@/types/practice";

export default async function PracticeSessionPage({
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
      <section className="grid gap-2">
        <p className="text-sm font-bold uppercase tracking-wide text-black">
          {session.examType} practice
        </p>
        <h1 className="text-3xl font-black text-black">{session.topic}</h1>
        <p className="text-black">
          {session.subject} · {session.difficulty} · {session.questions.length} questions
        </p>
      </section>
      <PracticeSessionForm sessionId={id} questions={session.questions} />
    </div>
  );
}
