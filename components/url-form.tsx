"use client";

import { useFormState, useFormStatus } from "react-dom";

import { submitUrl } from "@/utils/actions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import type { CreateQuizzesResult } from "@/utils/actions";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

export default function UrlForm() {
  const [result, formAction] = useFormState<CreateQuizzesResult, FormData>(
    submitUrl,
    { success: null, error: null }
  );

  if (result.success === false) {
    switch (result.error) {
      case "invalidUrl":
        toast.error("Invalid URL");
        break;
      case "unsecuredUrl":
        toast.error("Unsecured URL", {
          description: "URL must be secured with HTTPS",
        });
        break;
      case "exceedsLimit":
        toast.error("Exceeds limit", {
          description:
            "You have reached the maximum number of quiz generations",
        });
        break;
      case "urlFetchError":
      case "openaiError":
        toast.error("Something went wrong", {
          description: "Please try again later",
        });
        break;
      default:
        toast.error("Something went wrong", {
          description: "Please try again later",
        });
        break;
    }
  }

  return (
    <form action={formAction} className="flex w-full items-center gap-x-2">
      <UrlInput />
      <SubmitButton />
    </form>
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
