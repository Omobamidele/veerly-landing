"use client";

import { OPEN_LEVEL_QUIZ_EVENT } from "./LevelQuiz";

/** Text link that opens the "Which level am I?" check from anywhere on the page, such as the FAQ. */
export default function LevelQuizLink({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_LEVEL_QUIZ_EVENT))}
      className="rounded-sm font-medium text-brand underline underline-offset-4 outline-none hover:text-brand-press focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </button>
  );
}
