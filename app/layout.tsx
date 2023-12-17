import { GeistSans } from "geist/font/sans";

import "./globals.css";

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
          <div className="flex-1 flex flex-col max-w-2xl px-3 pt-32 w-full">
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
