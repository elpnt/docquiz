"use client";

import useSWRMutation from "swr/mutation";

import { SubmissionStatus } from "./url-form-parts";

import { Input } from "./ui/input";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";

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
  }).then((res) => res.json() as any as { title: string; quizSetId: string }); // Same as route response
}

export const UrlForm = () => {
  const { trigger, isMutating, data } = useSWRMutation(`/api/quiz`, postUrl);

  const submit = (formData: FormData) => {
    const documentUrl = formData.get("documentUrl") as string;
    toast.info("Your request has been enqueued", {
      description: "It may take 30 seconds to generate the quiz.",
    });
    trigger({ documentUrl });
  };

  return (
    <div className="space-y-8">
      <form className="space-y-4" action={submit}>
        <div className="flex w-full items-center gap-x-2">
          <Input
            type="text"
            name="documentUrl"
            placeholder="https://react.dev/reference/react/useEffect"
            disabled={isMutating}
          />
          <Button type="submit" disabled={isMutating}>
            {isMutating ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Generate
          </Button>
        </div>
        <SubmissionStatus title={data?.title} quizSetId={data?.quizSetId} />
      </form>
      <p className="text-center text-neutral-600">
        Quizzes you create are public and can be accessed by anyone in the
        world.
      </p>
    </div>
  );
};
