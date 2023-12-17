import { LoginWithGitHub } from "@/components/github-login-button";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Login() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    redirect("/");
  }

  return (
    <div className="max-w-sm mx-auto w-full pt-48">
      <LoginWithGitHub />
    </div>
  );
}
