"use client";

import Link from "next/link";

export function SubmissionStatus({
  title,
  quizSetId,
}: {
  title?: string;
  quizSetId?: string;
}) {
  return !!title && !!quizSetId ? (
    <div className="relative rounded-md bg-blue-50 p-4">
      <div className="flex">
        <div className="ml-2 flex-1 flex justify-between">
          <p className="text-sm text-blue-700">
            The quiz you requested is ready:{" "}
            <span className="font-medium">{title}</span>
          </p>
          <p className="text-sm ml-6">
            <Link
              href={`/qs/${quizSetId}`}
              className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
            >
              <span className="absolute inset-0" aria-hidden />
              Solve it!
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  ) : null;
}
