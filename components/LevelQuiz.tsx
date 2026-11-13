"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconRestart,
} from "@/components/icons/veerly-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  LEVEL_LABEL,
  PATH_META,
  levelCardFor,
  type CareerPath,
  type LevelId,
} from "@/lib/levels";
import {
  QUIZ_QUESTION_IDS,
  isQuizComplete,
  quizQuestions,
  scoreQuiz,
  type Points,
  type QuizAnswers,
} from "@/lib/quiz";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { addonLink, ownedOnPath, ownsLevel } from "@/lib/addon";
import { LevelChangeFee } from "./Currency";
import { useOwnedLevels } from "./OwnedLevels";
import { useLevel } from "./LevelProvider";

/** Other parts of the page (like the FAQ) open the check by sending this event. */
export const OPEN_LEVEL_QUIZ_EVENT = "veerly:open-level-quiz";

/** Shown only until a career path is chosen. */
const GENERIC_WHO: Record<LevelId, string> = {
  beginner:
    "You have never done this kind of work, or you have only helped friends or family.",
  intermediate:
    "You know the basics and want to run whole systems, not just single tasks.",
  advanced:
    "You already do this work for clients or an employer and want to specialise, lead or design how it is done.",
};

const TOTAL = QUIZ_QUESTION_IDS.length;

function PathPicker({
  id,
  path,
  onChange,
  required,
}: {
  id: string;
  path: CareerPath | null;
  onChange: (p: CareerPath) => void;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        Your career path{required ? "" : " (optional)"}
      </label>
      <NativeSelect
        id={id}
        value={path ?? ""}
        onChange={(e) => {
          const next = e.target.value as CareerPath;
          if (next) onChange(next);
        }}
        className="w-full"
      >
        <NativeSelectOption value="">
          {required ? "Choose a path" : "Not chosen yet"}
        </NativeSelectOption>
        {PATH_META.map((p) => (
          <NativeSelectOption key={p.id} value={p.id}>
            {p.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}

export default function LevelQuiz({
  trigger,
}: {
  /** The button in the levels section that opens the check. */
  trigger: React.ReactNode;
}) {
  const { path, pathLabel, setPath, setPlan } = useLevel();
  const owned = useOwnedLevels();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0); // 0..TOTAL-1 = questions, TOTAL = result
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const afterClose = useRef<"join" | "levels" | null>(null);
  const uid = useId();

  const questions = quizQuestions(path);
  const onResult = step >= TOTAL;
  const question = onResult ? null : questions[step];
  const result = scoreQuiz(answers);
  const answer = question ? answers[question.id] : undefined;
  const card = path ? levelCardFor(path, result.level) : null;

  const start = useCallback(() => {
    setAnswers({});
    setStep(0);
    afterClose.current = null;
    setOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener(OPEN_LEVEL_QUIZ_EVENT, start);
    return () => window.removeEventListener(OPEN_LEVEL_QUIZ_EVENT, start);
  }, [start]);

  // Move the screen reader and keyboard to the new question or the result.
  useEffect(() => {
    if (open && step > 0) headingRef.current?.focus();
  }, [step, open]);

  function choose() {
    if (!path) return;
    setPlan(path, result.level, "quiz");
    afterClose.current = "join";
    setOpen(false);
  }
  function pickDifferent() {
    afterClose.current = "levels";
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) start();
        else setOpen(false);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        closeLabel="Close the level check"
        data-level-quiz
        onCloseAutoFocus={(e) => {
          const goto = afterClose.current;
          if (!goto) return;
          e.preventDefault();
          afterClose.current = null;
          const target =
            goto === "join"
              ? document.getElementById("join-card")
              : document.getElementById("level-cards");
          target?.scrollIntoView({ behavior: "smooth", block: "start" });
          if (goto === "levels") {
            target
              ?.querySelector<HTMLElement>("button:not(:disabled)")
              ?.focus({ preventScroll: true });
          }
        }}
      >
        <div className="flex flex-col gap-4 border-b border-line px-5 pt-5 pb-4 sm:px-7 sm:pt-6">
          <div className="flex items-center justify-between gap-4 pr-10">
            <p className="text-[13px] font-medium text-brand" aria-live="polite">
              {onResult ? "Your result" : `Question ${step + 1} of ${TOTAL}`}
            </p>
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            {QUIZ_QUESTION_IDS.map((id, i) => (
              <span
                key={id}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i <= step ? "bg-brand" : "bg-tint-line",
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
          <DialogDescription className="sr-only">
            Five short questions that suggest Beginner, Intermediate or
            Advanced. You choose the final level.
          </DialogDescription>

          {question ? (
            <div className="flex flex-col gap-6" key={question.id}>
              <div className="flex flex-col gap-2">
                <DialogTitle asChild>
                  <h2
                    ref={headingRef}
                    tabIndex={-1}
                    id={`${uid}-q`}
                    className="font-display text-[22px] leading-snug font-extrabold tracking-[-0.02em] text-balance text-ink outline-none sm:text-[26px]"
                  >
                    {question.title}
                  </h2>
                </DialogTitle>
                {question.hint ? (
                  <p className="text-[15px] leading-relaxed text-ink-2">
                    {question.hint}
                  </p>
                ) : null}
              </div>

              {step === 0 && !path ? (
                <PathPicker
                  id={`${uid}-path`}
                  path={path}
                  onChange={setPath}
                />
              ) : null}

              <div
                role="radiogroup"
                aria-labelledby={`${uid}-q`}
                className="flex flex-col gap-2.5"
              >
                {question.options.map((o) => {
                  const checked = answer === o.points;
                  return (
                    <label
                      key={o.points}
                      className={cn(
                        "flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 text-[15px] leading-snug text-ink transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                        checked
                          ? "border-brand bg-tint"
                          : "border-line bg-white hover:border-brand/50",
                      )}
                    >
                      <input
                        type="radio"
                        name={`${uid}-${question.id}`}
                        value={o.points}
                        checked={checked}
                        onChange={() =>
                          setAnswers((a) => ({
                            ...a,
                            [question.id]: o.points as Points,
                          }))
                        }
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={cn(
                          "icon-first-line flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                          checked
                            ? "border-brand bg-brand text-white"
                            : "border-[#9fb0bb] bg-white",
                        )}
                      >
                        {checked ? (
                          <IconCheck className="size-3" strokeWidth={3.5} />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">{o.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6" data-quiz-result={result.level}>
              <div className="flex flex-col gap-3">
                <p className="text-[13px] font-medium text-ink-3">
                  We suggest
                </p>
                <DialogTitle asChild>
                  <h2
                    ref={headingRef}
                    tabIndex={-1}
                    className="font-display text-[40px] leading-none font-extrabold tracking-[-0.03em] text-ink outline-none sm:text-[48px]"
                  >
                    {LEVEL_LABEL[result.level]}
                    {pathLabel ? (
                      <span className="mt-2 block text-[17px] leading-snug font-semibold tracking-[-0.01em] text-ink-2">
                        for {pathLabel}
                      </span>
                    ) : null}
                  </h2>
                </DialogTitle>
                <p className="text-[17px] leading-relaxed text-pretty text-ink">
                  {result.reason}
                </p>
              </div>

              <div className="flex flex-col gap-3 rounded-xl bg-tint p-4 sm:p-5">
                <p className="text-[15px] leading-relaxed text-ink">
                  {card ? card.who : GENERIC_WHO[result.level]}
                </p>
                {card ? (
                  <ul className="flex flex-col">
                    {card.learn.slice(0, 3).map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 border-t border-tint-line py-2.5 text-[15px] leading-snug"
                      >
                        <IconCheck
                          className="icon-first-line size-4 shrink-0 text-brand"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        />
                        <span className="min-w-0">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {!path ? (
                <PathPicker
                  id={`${uid}-path-result`}
                  path={path}
                  onChange={setPath}
                  required
                />
              ) : null}

              {path &&
              ownedOnPath(owned, path).length > 0 &&
              !ownsLevel(owned, path, result.level) ? (
                <p
                  className="rounded-lg border border-line bg-tint px-4 py-3 text-[15px] leading-snug text-ink"
                  data-quiz-addon
                >
                  You already have{" "}
                  {ownedOnPath(owned, path)
                    .map((l) => LEVEL_LABEL[l])
                    .join(" and ")}
                  . To get {LEVEL_LABEL[result.level]} as well, it&rsquo;s an
                  additional fee of{" "}
                  <LevelChangeFee className="font-semibold" />.{" "}
                  <Link
                    href={addonLink(path, result.level)}
                    className="font-semibold text-brand underline underline-offset-4 hover:text-brand-press"
                  >
                    Get {LEVEL_LABEL[result.level]}
                  </Link>
                </p>
              ) : null}

              <p className="text-[13px] leading-relaxed text-ink-3">
                This is a suggestion, not a test. You can pick any level.
              </p>
            </div>
          )}
        </div>

        {onResult ? (
          <p
            className="border-t border-line bg-white px-5 pt-3 text-[13px] leading-snug text-ink-2 sm:px-7"
            data-level-change-note
          >
            <span className="font-semibold text-ink">Be sure:</span> an extra
            level after you pay is an additional fee of{" "}
            <LevelChangeFee className="font-semibold text-ink" />.
          </p>
        ) : null}
        <div
          className={cn(
            "flex flex-col gap-2 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7",
            onResult ? "pt-3" : "border-t border-line",
          )}
        >
          {onResult ? (
            <>
              <div className="flex flex-col gap-2 sm:order-last sm:flex-row-reverse">
                <Button
                  type="button"
                  size="lg"
                  disabled={!path}
                  onClick={choose}
                >
                  Choose this level
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={pickDifferent}
                >
                  Pick a different level
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={start}
              >
                <IconRestart data-icon="inline-start" />
                Retake the check
              </Button>
            </>
          ) : (
            <div className="flex w-full items-center gap-3">
              {step > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  <IconArrowLeft data-icon="inline-start" />
                  Back
                </Button>
              ) : null}
              <Button
                type="button"
                size="lg"
                className="flex-1 sm:ml-auto sm:flex-none"
                disabled={answer === undefined}
                onClick={() => {
                  if (step === TOTAL - 1 && !isQuizComplete(answers)) return;
                  setStep((s) => s + 1);
                }}
              >
                {step === TOTAL - 1 ? "See my level" : "Next"}
                <IconArrowRight data-icon="inline-end" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
