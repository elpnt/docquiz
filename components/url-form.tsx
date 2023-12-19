"use client";

import { useRequest } from "@/providers/request-queue";
import { SubmissionStatus, SubmitButton, UrlInput } from "./url-form-parts";

import { postUrl } from "@/utils/actions";
import { useFormState } from "react-dom";
import { useEffect } from "react";

export default function UrlForm() {
  const [state, formAction] = useFormState(postUrl, { url: "", quizSetId: "" });
  const { setQuizSetId, setPending } = useRequest();

  useEffect(() => {
    if (state.quizSetId.length > 0) {
      setQuizSetId(state.quizSetId);
      setPending(true);
    }
  }, [state.quizSetId]);

  console.log(state);

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-4">
        <div className="flex w-full items-center gap-x-2">
          <UrlInput />
          <SubmitButton />
        </div>
        <SubmissionStatus />
      </form>
      <p className="text-center text-neutral-600">
        Quizzes you create are public and can be accessed by anyone in the
        world.
      </p>
    </div>
  );
}
