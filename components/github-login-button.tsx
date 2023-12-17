"use client";

import { GithubIcon } from "lucide-react";

import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const LoginWithGitHub = () => {
  const supabase = createClient();

  const login = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${defaultUrl}/auth/callback`,
      },
    });

    if (error) {
      console.error(error);
    }
  };

  return (
    <Button size="lg" onClick={login} className="w-full">
      <GithubIcon className="h-5 w-5 mr-2" />
      Log in with GitHub
    </Button>
  );
};
