"use server";

import { newId } from "./id";
import { getUrl } from "./url";

export async function postUrl(
  previousState: { url: string; quizSetId: string },
  formData: FormData
) {
  const url = formData.get("url") as string;
  const quizSetId = newId("quizSet");

  // TODO: awaiting fetch causes 504 Gateway Timeout in production
  fetch(`${getUrl()}/api/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, quizSetId }),
  });

  return { url, quizSetId };
}
