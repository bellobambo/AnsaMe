import PracticeBuilder from "@/components/PracticeBuilder";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="grid gap-6">
      <section className="grid gap-3">
        <p className="text-sm font-bold uppercase tracking-wide text-black">
          JAMB. WAEC. NECO.
        </p>
        <h1 className="max-w-4xl text-4xl font-black leading-tight text-black sm:text-5xl">
          Practice exam-style questions and review your mistakes.
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-black">
          Choose an exam, subject, and topic. AnsaMe suggests topics with
          Gemma 4, creates a 20-question practice session, marks your answers,
          and saves your history for revision.
        </p>
      </section>
      {user ? (
        <PracticeBuilder />
      ) : (
        <section className="grid gap-3 rounded-lg border border-black bg-[#FAF3E1] p-5 shadow-sm">
          <h2 className="text-xl font-black text-black">Sign in to start</h2>
          <p className="max-w-2xl leading-7 text-black">
            Use Google sign-in so your practice sessions, answers, results, and
            AI study history stay attached to your own student profile.
          </p>
          <a
            className="w-fit rounded-md bg-black px-4 py-2 font-bold text-[#FAF3E1]"
            href="/api/auth/google"
          >
            Sign in with Google
          </a>
        </section>
      )}
    </div>
  );
}
