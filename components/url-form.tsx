import { SubmitButton, UrlInput } from "./url-form-parts";
import { newId } from "@/utils/id";
import { getUrl } from "@/utils/url";
import { redirect } from "next/navigation";

export const runtime = "edge";

export default function UrlForm() {
  const post = async (formData: FormData) => {
    "use server";

    const url = formData.get("url") as string;
    const quizSetId = newId("quizSet");
    console.log({ url, quizSetId });

    const res = await fetch(`${getUrl()}/qs/api`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, quizSetId }),
    });
    if (res.ok) redirect(`/qs/${quizSetId}`);
  };

  return (
    <div className="space-y-8">
      <form action={post} className="flex w-full items-center gap-x-2">
        <UrlInput />
        <SubmitButton />
      </form>
      <p className="text-center text-neutral-600">
        Quizzes you create are public and can be accessed by anyone in the
        world.
      </p>
    </div>
  );
}
