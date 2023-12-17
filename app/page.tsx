import Header from "@/components/header";
import UrlForm from "@/components/url-form";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";
import { LinkIcon } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function Index() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col gap-16 mt-20">
        <div className="flex flex-col gap-8">
          <UrlForm />
          <Divider />
          <Presets />
        </div>
        <div className="flex flex-col">
          <h2>DocQuiz is currently in beta.</h2>
          <p className="underline decoration-dotted underline-offset-2">
            You can create up to <span className="font-medium">5</span> quiz
            sets and you cannot update or delete them.
          </p>
          {user ? <UserQuizSets user={user} /> : null}
        </div>
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
      <span className="bg-white px-4 text-sm text-neutral-500">
        Or explore presets
      </span>
    </div>
  </div>
);

type PresetQuizSet = {
  id: string;
  title: string;
  hostname: string;
};

const presetQuizSets: PresetQuizSet[] = [
  {
    id: "qs_MSMXKeY3R6suc6n7",
    title: "React useEffect",
    hostname: "react.dev",
  },
  {
    id: "qs_ege1nViN8BH26eHf",
    title: "Caching in Next.js",
    hostname: "nextjs.org",
  },
  {
    id: "qs_m7vetfbH5LnMCLbd",
    title: "Ownership in Rust",
    hostname: "doc.rust-lang.org",
  },
  {
    id: "qs_NFQxrUr9qdAhzXa9",
    title: "Accessibility of dialog (modal) pattern",
    hostname: "w3.org",
  },
];

const Presets = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {presetQuizSets.map((quizSet) => (
      <div
        key={quizSet.id}
        className="relative flex items-center space-x-3 rounded-lg border border-neutral-300 bg-white p-4 shadow-sm focus-within:ring-2 focus-within:ring-neutral-500 focus-within:ring-offset-2 hover:border-neutral-400"
      >
        <div className="min-w-0 flex-1">
          <Link href={`/qs/${quizSet.id}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            <p className="text-sm font-medium text-neutral-900">
              {quizSet.title}
            </p>
            <p className="truncate text-sm text-neutral-500">
              {quizSet.hostname}
            </p>
          </Link>
        </div>
      </div>
    ))}
  </div>
);

const UserQuizSets = async ({ user }: { user: User }) => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: quizSets, error } = await supabase
    .from("quiz_set")
    .select(`id, title, url`)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return quizSets.length > 0 ? (
    <div className="mt-12">
      <h3 className="text-xl font-semibold">
        Your Quiz Sets ({quizSets.length}/5)
      </h3>
      <ul className="divide-y divide-neutral-200">
        {quizSets.map((set) => (
          <li key={set.id} className="relative flex items-center py-4">
            <div className="min-w-0">
              <div className="flex items-start gap-x-3">
                <Link
                  href={`/qs/${set.id}`}
                  className="font-semibold leading-6 text-neutral-900"
                >
                  <span className="absolute inset-0" aria-hidden="true" />
                  {set.title}
                </Link>
              </div>
              <div className="mt-1 flex items-center gap-x-2 text-sm leading-5 text-neutral-500">
                <span className="flex items-center gap-x-1">
                  <LinkIcon className="h-3 w-3" />
                  {set.url}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  ) : null;
};
