import { GeistSans } from "geist/font/sans";
import "./globals.css";
import AuthButton from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "DocQuiz",
  description: "Generate quizzes from web documents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground">
        <div className="flex-1 w-full flex flex-col gap-20 items-center min-h-screen">
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
              <Button variant="ghost" className="pr-5" asChild>
                <Link href="/">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Home
                </Link>
              </Button>
              <AuthButton />
            </div>
          </nav>
          <div className="flex-1 flex flex-col max-w-2xl px-3 w-full">
            {children}
          </div>
          <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
            <p>
              Powered by{" "}
              <a
                href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                target="_blank"
                className="font-bold hover:underline"
                rel="noreferrer"
              >
                Supabase
              </a>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
