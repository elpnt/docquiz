"use client";

import { useCallback, useState } from "react";
import useSWRMutation from "swr/mutation";

import { SubmissionStatus, SubmitButton } from "./url-form-parts";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

async function postUrl(
  apiUrl: string,
  { arg }: { arg: { documentUrl: string } }
) {
  return fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });
}

export const UrlForm = () => {
  const [documentUrl, setDocumentUrl] = useState("");
  const { trigger, isMutating } = useSWRMutation("/api/quiz", postUrl);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await trigger({ documentUrl });
      toast.info("Your request has been enqueued", {
        description: "It may take 30 seconds to generate the quiz.",
      });
    },
    []
  );

  return (
    <div className="space-y-8">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex w-full items-center gap-x-2">
          <Input
            type="text"
            placeholder="https://react.dev/reference/react/useEffect"
            disabled={isMutating}
            value={documentUrl}
            onChange={(e) => setDocumentUrl(e.target.value)}
          />
          <Button type="submit" disabled={isMutating}>
            {isMutating ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Generate
          </Button>
        </div>
        <SubmissionStatus />
      </form>
      <p className="text-center text-neutral-600">
        Quizzes you create are public and can be accessed by anyone in the
        world.
      </p>
    </div>
  );
};
