"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources";
import { z } from "zod";

import { createClient } from "./supabase/server";
import { newId } from "./id";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function isValidUrl(input: string) {
  try {
    const url = new URL(input);
    return true;
  } catch (_) {
    return false;
  }
}

function isSecuredUrl(input: string) {
  try {
    const url = new URL(input);
    return url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

const schema = z.object({
  quizzes: z.array(
    z.object({
      question: z.string(),
      options: z.array(
        z.object({
          index: z.number(),
          text: z.string(),
        })
      ),
      answerIndex: z.number(),
      explanation: z.string(),
    })
  ),
});

type Data = z.infer<typeof schema>;
export type Quiz = Data["quizzes"][number];

type Err =
  | "exceedsLimit"
  | "invalidUrl"
  | "unsecuredUrl"
  | "urlFetchError"
  | "openaiError";

export type CreateQuizzesResult =
  // initial state
  | {
      success: null;
      error: null;
    }
  | {
      success: false;
      error: Err;
    }
  | {
      success: true;
      data: z.infer<typeof schema>;
    };

export async function submitUrl(
  previousState: CreateQuizzesResult,
  formData: FormData
): Promise<CreateQuizzesResult> {
  // URL validation
  const url = formData.get("url") as string;
  if (url === undefined || !isValidUrl(url)) {
    return { success: false, error: "invalidUrl" };
  }
  if (!isSecuredUrl(url)) {
    return { success: false, error: "unsecuredUrl" };
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 💸 Limit the number of quizzes to 500 to avoid bankrupting
  const { count } = await supabase
    .from("quiz_set")
    .select("*", { count: "exact", head: true });
  if (count && count >= 500) {
    return { success: false, error: "exceedsLimit" };
  }

  // Step 1: Generate text from the given URL
  let html: string = "";
  try {
    const res = await fetch(url);
    html = await res.text();
  } catch (e) {
    console.log(e);
    return { success: false, error: "urlFetchError" };
  }

  const $ = cheerio.load(html);

  let textContent = "";
  $("article, section, p, h1, h2, h3").each((_, el) => {
    textContent += $(el).text();
    textContent += "\n";
  });

  const pageTitle = $("head title").text();

  // Step 2: Send the conversation and available functions to the model
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a helpful assistant to generate quizzes in JSON format. Summarize the text presented by the user and make five 4-option quizzes based on it. Please provide an additional useful explanation of the correct answer for each quiz.",
    },
    {
      role: "user",
      content: `Please make five 4-option quizzes from the following text:
"""
${textContent}
"""
`,
    },
  ];
  const tools: ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "generate_five_quizzes",
        description: "Generate five 4-option quizzes from the given text",
        parameters: {
          type: "object",
          properties: {
            quizzes: {
              type: "array",
              minItems: 5,
              maxItems: 5,
              items: {
                type: "object",
                properties: {
                  question: {
                    type: "string",
                    description: "The question text of the quiz",
                  },
                  options: {
                    type: "array",
                    minItems: 4,
                    maxItems: 4,
                    items: {
                      type: "object",
                      properties: {
                        index: {
                          type: "integer",
                          description: "The 1-based index number of the option",
                        },
                        text: {
                          type: "string",
                          description: "The text of the option",
                        },
                      },
                    },
                  },
                  answerIndex: {
                    type: "integer",
                    description:
                      "The 1-based index number of the correct option",
                  },
                  explanation: {
                    type: "string",
                    description:
                      "The useful supplemental explanation of the correct answer",
                  },
                },
              },
            },
          },
          required: ["quizzes"],
        },
      },
    },
  ];

  const quizSetId = newId("quizSet");

  try {
    // Generating OpenAI completion may throw an error
    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages,
      tools,
      tool_choice: "auto",
    });

    const responseMessage = response.choices[0].message;

    // Step 3: Generate quizzes
    const toolCalls = responseMessage.tool_calls;
    if (toolCalls === undefined || toolCalls.length === 0) {
      return { success: false, error: "openaiError" };
    }

    // JSON.parse may also throw an error
    const result = schema.safeParse(
      JSON.parse(toolCalls[0].function.arguments)
    );
    if (!result.success) {
      console.log(result.error);
      return { success: false, error: "openaiError" };
    }

    await supabase.from("quiz_set").insert({
      id: quizSetId,
      title: pageTitle,
      url,
    });
    for (const quiz of result.data.quizzes) {
      const quizId = newId("quiz");
      await supabase.from("quiz").insert({
        id: quizId,
        quizset_id: quizSetId,
        question: quiz.question,
        answer_index: quiz.answerIndex,
        explanation: quiz.explanation,
      });
      for (const option of quiz.options) {
        await supabase.from("quiz_option").insert({
          id: newId("quizOption"),
          quiz_id: quizId,
          index: option.index,
          text: option.text,
        });
      }
    }
  } catch (e) {
    console.log(e);
    return { success: false, error: "openaiError" };
  }

  // Must be called outside of try-catch
  redirect(`/qs/${quizSetId}`);
}
