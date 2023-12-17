"use client";

import { useFormState, useFormStatus } from "react-dom";

import { submitUrl } from "@/utils/actions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import type { CreateQuizzesResult } from "@/utils/actions";
import { Quiz, QuizSet } from "./quiz";

export default function UrlForm() {
  const [result, formAction] = useFormState<CreateQuizzesResult, FormData>(
    submitUrl,
    {} as any
  );

  return (
    <>
      <form action={formAction} className="flex w-full items-center gap-x-2">
        <UrlInput />
        <SubmitButton />
      </form>
      {result.success ? <QuizSet quizzes={result.data.quizzes} /> : null}
      {/* TODO show skeleton while pending */}
    </>
  );
}

function UrlInput() {
  const { pending } = useFormStatus();

  return (
    <Input
      type="text"
      name="url"
      placeholder="Enter document URL here..."
      disabled={pending}
    />
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Generating..." : "Generate"}
    </Button>
  );
}
