import PracticeBuilder from "@/components/PracticeBuilder";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto grid w-full max-w-4xl justify-items-center gap-6">
      <section className="mt-8 grid justify-items-center gap-3 text-center sm:mt-12">
        {!user ? (
          <>
            <p className="text-sm font-bold uppercase tracking-wide text-black">
              JAMB, WAEC and NECO Standard.
            </p>
            <div className="grid gap-1 text-sm font-semibold leading-6 text-black sm:text-base">
              <p>JAMB: Joint Admissions and Matriculation Board</p>
              <p>WAEC: West African Examinations Council</p>
              <p>NECO: National Examinations Council</p>
            </div>
          </>
        ) : null}
        <h1 className="max-w-4xl text-4xl font-black leading-tight text-black sm:text-5xl">
          Practice exam-style questions and review your mistakes.
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-black">
          Choose an exam, subject, and topic. AnsaMe suggests topics with
          Gemma 4, creates a 20-question practice session, marks your answers,
          and saves your history for revision.
        </p>
      </section>
      {user ? <PracticeBuilder /> : null}
    </div>
  );
}
