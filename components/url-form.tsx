"use client";

import { useFormState, useFormStatus } from "react-dom";

import { submitUrl } from "@/utils/actions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import type { CreateQuizzesResult } from "@/utils/actions";
import { Loader2Icon } from "lucide-react";

export default function UrlForm() {
  const [result, formAction] = useFormState<CreateQuizzesResult, FormData>(
    submitUrl,
    {} as any
  );

  return (
    <form action={formAction} className="flex w-full items-center gap-x-2">
      <UrlInput />
      <SubmitButton />
    </form>
  );
}

function UrlInput() {
  const { pending, data } = useFormStatus();
  console.log(data);

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
      {pending ? (
        <>
          <Loader2Icon className="h-5 w-5 mr-1.5 animate-spin" />
          Generating
        </>
      ) : (
        "Generate"
      )}
    </Button>
  );
}
