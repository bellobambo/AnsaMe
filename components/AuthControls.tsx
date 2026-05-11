import type { AuthUser } from "@/lib/auth";

export default function AuthControls({ user }: { user: AuthUser | null }) {
  if (!user) {
    return (
      <a
        className="rounded-md bg-[#FAF3E1] px-4 py-2.5 text-base font-bold text-black"
        href="/api/auth/google"
      >
        Sign in with Google
      </a>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="hidden text-right sm:block">
        <p className="text-base font-bold leading-6 text-[#FAF3E1]">{user.name}</p>
        <p className="text-sm leading-5 text-[#FAF3E1]">{user.email}</p>
      </div>
      <a
        className="rounded-md border border-[#FAF3E1] bg-[#FAF3E1] px-4 py-2.5 text-base font-bold text-black hover:underline"
        href="/api/auth/logout"
      >
        Sign out
      </a>
    </div>
  );
}
