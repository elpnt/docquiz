import { GeistSans } from "geist/font/sans";

import "./globals.css";
import { Providers } from "@/providers";
import { Footer } from "@/components/footer";

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
        <Providers>
          <div className="flex-1 w-full flex flex-col gap-20 items-center min-h-screen">
            <div className="flex-1 flex flex-col max-w-2xl px-3 pt-32 w-full">
              {children}
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
