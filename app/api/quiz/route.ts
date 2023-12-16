import * as cheerio from "cheerio";
import OpenAI from "openai";
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  const url = "https://react.dev/reference/react/useLayoutEffect";

  // Step 1: Generate text from the given URL
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  let textContent = "";
  $("article, section, p, h1, h2, h3").each((_, el) => {
    textContent += $(el).text();
    textContent += "\n";
  });

  // Step 2: Send the conversation and available functions to the model
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a helpful assistant to generate quizzes in JSON format. Summarize the text presented by the user and make five four-choice quizzes based on it. Please provide an explanation of the correct answer as a supplement to each quiz.",
    },
    {
      role: "user",
      content: `Please make five four-choice quizzes from the following text:
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
        description: "Generate five 4-choice quizzes from the given text",
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
                  },
                  choices: {
                    type: "array",
                    minItems: 4,
                    maxItems: 4,
                    items: {
                      type: "object",
                      properties: {
                        index: {
                          type: "integer",
                          description: "The number of the option",
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
                    description: "The index number of the correct option",
                  },
                  explanation: {
                    type: "string",
                    description: "The explanation of the correct answer",
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

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages,
    tools,
    tool_choice: "auto",
  });
  const responseMessage = response.choices[0].message;
  console.log(JSON.stringify(responseMessage, null, 2));

  // Step 3: Generate quizzes
  const toolCalls = responseMessage.tool_calls;
  if (toolCalls === undefined || toolCalls.length === 0) {
    return Response.json({ result: "No tool calls" });
  }
  const result = JSON.parse(toolCalls[0].function.arguments);

  return Response.json({ result });
}
