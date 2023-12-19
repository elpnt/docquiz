import { cookies } from "next/headers";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources";
import { z } from "zod";
import { newId } from "@/utils/id";
import { createClient } from "@/utils/supabase/server";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function isValidUrl(input: string) {
  try {
    new URL(input);
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

export async function POST(req: Request) {
  const { url, quizSetId } = await req.json();
  console.log("received", url, quizSetId);

  if (url === undefined || !isValidUrl(url)) {
    return new Response("Invalid URL", { status: 400 });
  }
  if (!isSecuredUrl(url)) {
    return new Response("Unsecured URL", { status: 400 });
  }
  if (quizSetId === undefined) {
    return new Response("Invalid quizSetId", { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // 💸 Limit the number of quizzes to 500 to avoid bankrupting
  const { count } = await supabase
    .from("quiz_set")
    .select("*", { count: "exact", head: true });
  if (count && count >= 500) {
    return new Response("Too many quizzes", { status: 400 });
  }

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        // Step 1: Generate text from the given URL
        const res = await fetch(url);
        const html = await res.text();
        const $ = cheerio.load(html);

        let textContent = "";
        $("article, section, p, h1, h2, h3").each((_, el) => {
          textContent += $(el).text();
          textContent += "\n";
        });
        const pageTitle = $("head title").text();
        console.log("Loaded html", url);

        // TODO: tokenize and truncate the text to 4000 tokens
        // https://beta.openai.com/docs/api-reference/create-completion

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
                                description:
                                  "The 1-based index number of the option",
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

        console.log("Start OpenAI request", quizSetId);

        const start = Date.now();
        // Generating OpenAI completion may throw an error
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-1106",
          messages,
          tools,
          tool_choice: "auto",
        });
        const end = Date.now();
        console.log(
          `Finished OpenAI request: took ${(end - start) / 1000} seconds`
        );

        const responseMessage = response.choices[0].message;

        // Step 3: Generate quizzes
        const toolCalls = responseMessage.tool_calls;
        if (toolCalls === undefined || toolCalls.length === 0) {
          return new Response("Internal server error", { status: 500 });
        }

        // JSON.parse may also throw an error
        const result = schema.safeParse(
          JSON.parse(toolCalls[0].function.arguments)
        );
        if (!result.success) {
          return new Response("Internal server error", { status: 500 });
        }

        console.log("Start inserting data to DB", quizSetId);

        await supabase.from("quiz_set").insert({
          id: quizSetId,
          title: pageTitle,
          url,
        });

        // Bulk insert
        const quizInserts = [];
        const quizOptionInserts = [];
        for (const quiz of result.data.quizzes) {
          const quizId = newId("quiz");

          quizInserts.push({
            id: quizId,
            quizset_id: quizSetId,
            question: quiz.question,
            answer_index: quiz.answerIndex,
            explanation: quiz.explanation,
          });
          for (const option of quiz.options) {
            quizOptionInserts.push({
              id: newId("quizOption"),
              quiz_id: quizId,
              index: option.index,
              text: option.text,
            });
          }
        }
        await supabase.from("quiz").insert(quizInserts);
        await supabase.from("quiz_option").insert(quizOptionInserts);

        console.log("Finished inserting data to DB", quizSetId);
      } catch (e) {
        console.log(e);
      }

      controller.close();
    },
  });

  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const text = decoder.decode(chunk);
      controller.enqueue(encoder.encode(text));
    },
  });

  return new Response(readableStream.pipeThrough(transformStream), {
    headers: {
      "content-type": "text/event-stream",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
