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
export const cache = "force-dynamic";

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
  const { documentUrl } = await req.json();
  console.log("received", documentUrl);

  if (documentUrl === undefined || !isValidUrl(documentUrl)) {
    return new Response("Invalid URL", {
      status: 400,
      statusText: "Invalid URL",
    });
  }
  if (!isSecuredUrl(documentUrl)) {
    return new Response("Unsecured URL", { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const encoder = new TextEncoder();

  const quizSetId = newId("quizSet");

  // 💸 Limit the number of quizzes to 500 to avoid bankrupting
  const { count } = await supabase
    .from("quiz_set")
    .select("*", { count: "exact", head: true });
  if (count && count >= 500) {
    return new Response("Too many quizzes", { status: 400 });
  }

  const readableStream = new ReadableStream({
    async pull(controller) {
      try {
        // controller.enqueue(encoder.encode("Reading document\n"));
        // Step 1: Generate text from the given URL
        const res = await fetch(documentUrl);
        const html = await res.text();
        const $ = cheerio.load(html);

        let textContent = "";
        $("article, section, p, h1, h2, h3").each((_, el) => {
          textContent += $(el).text();
          textContent += "\n";
        });
        const pageTitle = $("head title").text();
        console.log("Loaded html", documentUrl);

        // Step 2: Send the conversation and available functions to the model
        const messages: ChatCompletionMessageParam[] = [
          {
            role: "system",
            content:
              "You are a helpful assistant to generate quizzes in JSON format. Summarize the text presented by the user and make five 4-option quizzes based on it. Please provide an additional useful explanation of the correct answer for the quiz.",
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
              name: "generate_a_quizz",
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

        // controller.enqueue(encoder.encode("Generating quiz\n"));
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
          // return new Response("Internal server error", { status: 500 });
          throw new Error("Internal server error");
        }

        // JSON.parse may also throw an error
        const result = schema.safeParse(
          JSON.parse(toolCalls[0].function.arguments)
        );
        if (!result.success) {
          // return new Response("Internal server error", { status: 500 });
          throw new Error("Internal server error");
        }

        // controller.enqueue(encoder.encode("Saving result\n"));

        console.log("Start inserting data to DB", quizSetId);

        await supabase.from("quiz_set").insert({
          id: quizSetId,
          title: pageTitle,
          url: documentUrl,
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

        controller.enqueue(
          encoder.encode(JSON.stringify({ title: pageTitle, quizSetId }))
        );
      } catch (e) {
        console.log(e);
      }

      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      "content-type": "application/json",
    },
  });
}
