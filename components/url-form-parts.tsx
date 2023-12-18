"use client";

import { useFormStatus } from "react-dom";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

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
  const hanldeClick = () => {
    toast.info("Your request is enqueued.");
  };

  return (
    <Button type="submit" onClick={hanldeClick}>
      Generate
    </Button>
  );
}
