"use client";

import { useFormStatus } from "react-dom";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { Loader2Icon } from "lucide-react";

export function UrlInput() {
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

export function SubmitButton() {
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
