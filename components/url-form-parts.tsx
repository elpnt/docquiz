"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRequest } from "@/providers/request-queue";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";

export function UrlInput() {
  const { pending } = useRequest();

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
  const { pending } = useRequest();
  const hanldeClick = () => {
    toast.info("Your request is enqueued.", {
      description: "It will take 30 seconds to generate the quiz.",
    });
  };

  return (
    <Button type="submit" onClick={hanldeClick} disabled={pending}>
      {pending ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
      Generate
    </Button>
  );
}

export function SubmissionStatus() {
  const { quizSetId, setPending } = useRequest();
  const [title, setTitle] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const changes = supabase
      .channel("new-quiz-set")
      .on(
        "postgres_changes",
        {
          schema: "public",
          event: "INSERT",
        },
        (payload) => {
          if (payload.new.id === quizSetId) {
            setTitle(payload.new.title);
            setPending(false);
          }
        }
      )
      .subscribe();

    return () => {
      changes.unsubscribe();
    };
  }, [quizSetId]);

  return title !== null ? (
    <div className="rounded-md bg-blue-50 p-4">
      <div className="flex">
        <div className="ml-2 flex-1 md:flex md:justify-between">
          <p className="text-sm text-blue-700">
            The quiz you requested is ready:{" "}
            <span className="font-medium">{title}</span>
          </p>
          <p className="mt-3 text-sm md:ml-6 md:mt-0">
            <Link
              href={`/qs/${quizSetId}`}
              className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
            >
              Solve it!
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  ) : null;
}
