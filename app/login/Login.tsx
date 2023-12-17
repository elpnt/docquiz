import { LoginWithGitHub } from "@/components/github-login-button";
import { cookies } from "next/headers";

export default function Login() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  return (
    <div className="max-w-sm mx-auto w-full grid place-items-center h-full">
      <LoginWithGitHub />
    </div>
  );
}
