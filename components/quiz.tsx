"use client";

import { useId, useState } from "react";
import { useFormState } from "react-dom";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Check, Frown, Smile, X } from "lucide-react";

import type { Quiz as TQuiz } from "@/app/qs/api/route";
import { cn } from "@/utils/cn";
import { Button } from "./ui/button";

type QuizOptionProps = TQuiz["options"][number] & {
  answerIndex: number;
  submitted: boolean;
  userChoiceIndex: number;
};

const QuizOption = ({
  index,
  text,
  answerIndex,
  submitted,
  userChoiceIndex,
}: QuizOptionProps) => {
  const id = useId();
  const isCorrect = userChoiceIndex === answerIndex;
  const isChosen = index === userChoiceIndex;

  return (
    <RadioGroup.Item
      id={id}
      value={index.toString()}
      disabled={submitted}
      className={cn(
        "relative w-full block cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none sm:flex sm:justify-between  border-neutral-300 disabled:cursor-default",
        !submitted
          ? "data-[state=checked]:border-neutral-700 data-[state=checked]:ring-1 data-[state=checked]:ring-neutral-700 data-[state=checked]:bg-neutral-100"
          : isCorrect
          ? isChosen
            ? "border-green-500 ring-green-500 bg-green-50 ring-1"
            : null
          : isChosen
          ? "data-[state=checked]:border-red-500 data-[state=checked]:ring-red-500 data-[state=checked]:bg-red-50 ring-1"
          : index === answerIndex
          ? "border-green-500 ring-green-500 bg-green-50 ring-1"
          : null
      )}
    >
      <p className="text-left">
        <span className="font-medium font-mono text-neutral-500 mr-1">
          {index}.
        </span>
        <span className="text-neutral-900">{text}</span>
      </p>
      {submitted && isCorrect && index === userChoiceIndex ? (
        <Check
          className="absolute h-6 w-6 top-2 right-2 text-green-600"
          strokeWidth={3}
        />
      ) : null}
      {submitted && !isCorrect && index === userChoiceIndex ? (
        <X
          className="absolute h-6 w-6 top-2 right-2 text-red-600"
          strokeWidth={3}
        />
      ) : null}
    </RadioGroup.Item>
  );
};

type QuizExplanationProps = Omit<TQuiz, "question" | "options"> & {
  userChoiceIndex: number;
};

const QuizExplanation = ({
  answerIndex,
  explanation,
  userChoiceIndex,
}: QuizExplanationProps) => {
  return (
    <div className="flex flex-col">
      {userChoiceIndex === answerIndex ? (
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex flex-row text-lg items-center gap-x-1.5">
            <Smile className="h-6 w-6 text-green-600" strokeWidth={2} />
            <span className="font-medium tracking-wide text-green-700">
              Correct!
            </span>
          </div>
          <p className="mt-2 text-green-700">
            Answer is <span className="font-medium">{answerIndex}</span>.{" "}
            {explanation}
          </p>
        </div>
      ) : (
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex flex-row text-lg items-center gap-x-1.5 text-red-700">
            <Frown className="h-6 w-6 text-red-600" strokeWidth={2} />
            <span className="font-medium tracking-wide">Incorrect...</span>
          </div>
          <p className="mt-2 text-red-700">
            Answer is <span className="font-medium">{answerIndex}</span>.{" "}
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export const Quiz = ({
  quizNumber,
  question,
  options,
  answerIndex,
  explanation,
  onCorrect,
  onSubmit,
}: TQuiz & {
  quizNumber: number;
  onSubmit: () => void;
  onCorrect: () => void;
}) => {
  const id = useId();

  const [submitted, setSubmitted] = useState(false);
  const [userChoiceIndex, formAction] = useFormState(
    (state: any, formData: FormData) => {
      const userChoiceString = formData.get(question) as string;
      if (parseInt(userChoiceString) === answerIndex) {
        onCorrect();
      }
      onSubmit();
      setSubmitted(true);
      return parseInt(userChoiceString);
    },
    1
  );

  // sort options by index
  options.sort((a, b) => a.index - b.index);

  return (
    <form className="flex flex-col gap-y-4" action={formAction}>
      <label className="font-medium text-xl" htmlFor={id}>
        Q{quizNumber}. {question}
      </label>
      <RadioGroup.Root
        name={`${question}`}
        id={id}
        defaultValue="1"
        className="space-y-2"
      >
        {options.map((option) => (
          <QuizOption
            key={option.index}
            {...option}
            answerIndex={answerIndex}
            submitted={submitted}
            userChoiceIndex={userChoiceIndex}
          />
        ))}
      </RadioGroup.Root>

      {submitted ? (
        <QuizExplanation
          {...{ question, answerIndex, explanation, userChoiceIndex }}
        />
      ) : (
        <Button type="submit" size="lg">
          Submit
        </Button>
      )}
    </form>
  );
};

export const QuizSet = ({ quizzes }: { quizzes: TQuiz[] }) => {
  const [numCorrect, setNumCorrect] = useState(0);
  const [numSubmitted, setNumSubmitted] = useState(0);

  return (
    <div>
      <div className="space-y-48 pb-32">
        {quizzes.map((quiz, idx) => (
          <Quiz
            {...quiz}
            quizNumber={idx + 1}
            key={quiz.question}
            onSubmit={() => setNumSubmitted((n) => n + 1)}
            onCorrect={() => setNumCorrect((n) => n + 1)}
          />
        ))}
      </div>
      {numSubmitted === 5 ? (
        <div className="text-2xl font-bold text-center pb-24">
          Score: {numCorrect}/5
        </div>
      ) : null}
    </div>
  );
};
