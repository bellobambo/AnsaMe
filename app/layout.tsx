import type { Metadata } from "next";
import Link from "next/link";
import AppToaster from "@/components/AppToaster";
import AuthControls from "@/components/AuthControls";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "AnsaMe",
  description: "Practice questions for JAMB, WAEC, and NECO with AI support.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-[#FAF3E1] text-foreground">
        <header className="border-b-2 border-black bg-black text-[#FAF3E1]">
          <div className="flex w-full items-center justify-between gap-4 px-5 py-4">
            <Link href="/" className="text-lg font-black text-[#FAF3E1]">
              AnsaMe
            </Link>
            <div className="flex items-center gap-5">
              <nav className="flex items-center gap-5 text-sm font-semibold text-[#FAF3E1]">
                <Link className="hover:underline" href="/">Practice</Link>
                <Link className="hover:underline" href="/history">History</Link>
              </nav>
              <AuthControls user={user} />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl bg-[#FAF3E1] px-5 py-8">{children}</main>
        <AppToaster />
      </body>
    </html>
  );
}
