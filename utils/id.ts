import { customAlphabet } from "nanoid";
export const nanoid = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
);

const prefixes = {
  quiz: "q",
  quizSet: "s",
} as const;

export function newId(prefix: keyof typeof prefixes) {
  return [prefixes[prefix], nanoid(16)].join("_");
}
