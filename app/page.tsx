import Header from "@/components/header";
import { UrlForm } from "@/components/url-form";
import { createClient } from "@/utils/supabase/server";
import { ChevronRightIcon } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { format } from "date-fns";

// export const runtime = "edge";

export default async function Index() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col gap-16 mt-20">
        <UrlForm />
        <Divider />
        <RecentQuizSets />
      </main>
    </>
  );
}

const Divider = () => (
  <div className="relative">
    <div className="absolute inset-0 flex items-center" aria-hidden="true">
      <div className="w-full border-t border-neutral-300" />
    </div>
    <div className="relative flex justify-center">
      <span className="bg-white px-4 text-sm text-neutral-500">Explore</span>
    </div>
  </div>
);

const RecentQuizSets = async () => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: quizSets, error } = await supabase
    .from("quiz_set")
    .select("id, title, url, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return null;

  return (
    <ul role="list" className="divide-y divide-neutral-100">
      {quizSets.map(({ id, title, url, created_at }) => (
        <li key={id} className="relative py-3 hover:bg-neutral-50">
          <div className="px-4">
            <div className="mx-auto flex max-w-4xl justify-between gap-x-6">
              <div className="flex min-w-0 gap-x-4">
                <div className="min-w-0 flex-auto">
                  <p className="font-semibold leading-6 text-neutral-900">
                    <Link href={`/qs/${id}`}>
                      <span className="absolute inset-x-0 -top-px bottom-0" />
                      {title}
                    </Link>
                  </p>
                  <div className="mt-1 flex items-center truncate space-x-2 text-xs leading-5 text-neutral-500">
                    <p>{new URL(url).hostname}</p>
                    <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                      <circle cx={1} cy={1} r={1} />
                    </svg>
                    <p>{format(new Date(created_at), "yyyy-MM-dd")}</p>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-x-4">
                <ChevronRightIcon
                  className="h-5 w-5 flex-none text-neutral-400"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
