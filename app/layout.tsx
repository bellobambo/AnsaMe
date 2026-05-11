import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import AppToaster from "@/components/AppToaster";
import AuthControls from "@/components/AuthControls";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

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
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#FAF3E1] text-foreground">
        <header className="border-b-2 border-black bg-black text-[#FAF3E1]">
          <div className="flex w-full items-center justify-between gap-5 px-6 py-5">
            <Link href="/" className="text-xl font-black text-[#FAF3E1] sm:text-2xl">
              AnsaMe
            </Link>
            <div className="flex items-center gap-6">
              {user ? (
                <nav className="flex items-center gap-6 text-base font-semibold text-[#FAF3E1] sm:text-lg">
                  <Link className="hover:underline" href="/history">History</Link>
                </nav>
              ) : null}
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
