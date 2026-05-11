import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import type { PracticeSession } from "@/types/practice";

export default async function HistoryDetailPage({
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

  if (!session.results) {
    redirect(`/practice/session/${id}`);
  }

  redirect(`/practice/results/${id}`);
}
