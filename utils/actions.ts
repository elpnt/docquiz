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
  const res = await fetch(`${getUrl()}/api/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, quizSetId }),
  });
  const reader = res.body?.getReader();
  if (reader) {
    pump(reader);
  }

  return { url, quizSetId };
}

const pump = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
  const { done, value } = await reader.read();
  if (done) {
    return;
  }
  const decoded = new TextDecoder().decode(value);
  console.log(decoded);
  await pump(reader);
};
