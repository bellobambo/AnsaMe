import Link from "next/link";
import type { AuthUser } from "@/lib/auth";

export default function AuthControls({ user }: { user: AuthUser | null }) {
  if (!user) {
    return (
      <Link
        className="rounded-md bg-[#FAF3E1] px-3 py-2 text-sm font-bold text-black"
        href="/api/auth/google"
      >
        Sign in with Google
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-bold leading-5 text-[#FAF3E1]">{user.name}</p>
        <p className="text-xs leading-4 text-[#FAF3E1]">{user.email}</p>
      </div>
      <Link
        className="rounded-md border border-[#FAF3E1] bg-[#FAF3E1] px-3 py-2 text-sm font-bold text-black hover:underline"
        href="/api/auth/logout"
      >
        Sign out
      </Link>
    </div>
  );
}
