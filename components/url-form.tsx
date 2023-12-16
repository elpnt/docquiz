"use client";

import { useFormState, useFormStatus } from "react-dom";

import { Loader2 } from "lucide-react";

import { submitUrl } from "@/utils/actions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import type { CreateQuizzesResult } from "@/utils/actions";
import { Quiz } from "./quiz";

export default function UrlForm() {
  const [result, formAction] = useFormState<CreateQuizzesResult, FormData>(
    submitUrl,
    {} as any
  );

  return (
    <>
      <form action={formAction} className="flex w-full items-center gap-x-2">
        <Input type="text" name="url" placeholder="Enter URL here..." />
        <SubmitButton />
      </form>
      {result.success ? (
        <div className="space-y-24">
          {result.data.quizzes.map((quiz, idx) => (
            <Quiz {...quiz} quizNumber={idx + 1} key={quiz.question} />
          ))}
        </div>
      ) : null}
      {/* TODO show skeleton while pending */}
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Generate"}
    </Button>
  );
}
