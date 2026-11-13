/**
 * "Which level am I?" — five short questions, scored to Beginner, Intermediate or Advanced.
 *
 * Plain language on purpose: it has to make sense to someone who has never worked in tech.
 * Wording follows the selected career path when we have one, and falls back to generic wording.
 * It is a suggestion only: the student can pick any level, and can switch before the cohort starts.
 * Nothing here promises a job.
 */

import { LEVELS, pathMeta, type LevelId } from "./levels";

/** 0, 1 or 2 points per answer. */
export type Points = 0 | 1 | 2;

export type QuizOption = { points: Points; label: string };
export type QuizQuestion = {
  id: QuizQuestionId;
  title: string;
  hint?: string;
  options: QuizOption[];
};

export const QUIZ_QUESTION_IDS = ["experience", "tools", "client", "tasks", "support"] as const;
export type QuizQuestionId = (typeof QUIZ_QUESTION_IDS)[number];

/** How the level was chosen. Stored with the waitlist entry and shown in the admin CSV. */
export const LEVEL_SOURCES = ["quiz", "manual"] as const;
export type LevelSource = (typeof LEVEL_SOURCES)[number];

export function parseLevelSource(v: unknown): LevelSource | null {
  if (typeof v !== "string") return null;
  const s = v.trim().toLowerCase();
  return (LEVEL_SOURCES as readonly string[]).includes(s) ? (s as LevelSource) : null;
}

type PathWords = {
  /** Finishes "Have you ever done ..." */
  work: string;
  /** Finishes "How comfortable are you with ..." */
  tools: string;
  /** "Which of these could you do on your own, today?" — one task for each level. */
  tasks: [string, string, string];
};

const GENERIC: PathWords = {
  work: "this kind of work, even a little",
  tools: "the everyday tools people use for this work",
  tasks: [
    "Follow clear, step-by-step instructions to finish one small task",
    "Work out a task from a short brief, and fix it when something goes wrong",
    "Set up a whole way of working for other people, or train someone to do it",
  ],
};

const WORDS: Record<string, PathWords> = {
  sales: {
    work: "selling, finding customers or following up with people who might buy",
    tools: "a customer tracker or spreadsheet to keep a list of people you are selling to",
    tasks: [
      "Write a short, polite message to introduce a product to someone new",
      "Build a list of 50 possible customers and follow up with each one in a tracker",
      "Plan a full outreach campaign, check which messages work and improve them",
    ],
  },
  marketing: {
    work: "writing posts, running social media or making content for a business",
    tools: "tools like Canva, a post scheduler or a writing app",
    tasks: [
      "Write a short social media post for a small shop",
      "Plan a month of posts and check which ones did best",
      "Run a campaign with a goal and a budget, then report on the results",
    ],
  },
  "customer-success": {
    work: "helping customers, answering their questions or fixing their problems",
    tools: "a help desk, shared inbox or chat tool for answering customers",
    tasks: [
      "Answer a customer's simple question in a clear, friendly message",
      "Calm an unhappy customer and write down the problem so it can be fixed",
      "Write the help guides and rules that a whole support team follows",
    ],
  },
  operations: {
    work: "keeping a business organised, such as schedules, suppliers or step-by-step routines",
    tools: "spreadsheets and task boards to keep work on track",
    tasks: [
      "Keep a simple list of tasks and deadlines up to date",
      "Write down the steps of a routine job so someone else can follow them",
      "Find a slow or costly step in a business and redesign how it works",
    ],
  },
  va: {
    work: "helping someone stay organised, such as managing their emails, diary or to-do list",
    tools: "email, calendars and spreadsheets, like Gmail, Google Calendar and Google Sheets",
    tasks: [
      "Sort an inbox into folders and book a meeting in a shared calendar",
      "Run a client's weekly task board and write a simple guide for a routine job",
      "Set up an automatic process, like a form that fills a sheet and sends a reply, and fix it when it breaks",
    ],
  },
  "project-management": {
    work: "planning a project and keeping a group of people on track",
    tools: "task boards or planning tools, like Trello, Asana or a shared sheet",
    tasks: [
      "Break a small job into steps and give each step a date",
      "Run a small project with a few people, tracking tasks and progress",
      "Manage budgets, risks and several projects at the same time",
    ],
  },
  data: {
    work: "working with numbers or lists to answer a question or make a report",
    tools: "spreadsheets, like Excel or Google Sheets, or tools for charts and reports",
    tasks: [
      "Tidy a simple spreadsheet and add up a column of numbers",
      "Build a table that summarises some data and draw a clear chart from it",
      "Build a dashboard that updates by itself and explain what it means to a manager",
    ],
  },
  software: {
    work: "building websites or apps, or writing code",
    tools: "a code editor, a terminal or tools for building websites",
    tasks: [
      "Change the words and colours on a simple web page",
      "Build a small working web page or app from a written brief",
      "Plan how a larger app is put together, test it and fix problems others cannot",
    ],
  },
  gtm: {
    work: "setting up the tools and systems a business uses to find and keep customers",
    tools: "a customer database (a CRM, like HubSpot) or tools that connect apps together",
    tasks: [
      "Keep a list of customers and their contact details tidy",
      "Set up a CRM so new leads are saved and followed up",
      "Connect several tools so leads move through by themselves, and report on the results",
    ],
  },
  design: {
    work: "designing things like logos, posters, social media graphics or web pages",
    tools: "design tools, like Canva or Figma",
    tasks: [
      "Make a simple poster or social media graphic from a template",
      "Create a logo and a set of colours for a small brand",
      "Lead a full brand or website design for a client, from first brief to final files",
    ],
  },
};

function wordsFor(path: unknown): PathWords {
  const meta = pathMeta(path);
  return (meta && WORDS[meta.slug]) || GENERIC;
}

/** The five questions, worded for the given career path (or generically). */
export function quizQuestions(path?: unknown): QuizQuestion[] {
  const w = wordsFor(path);
  return [
    {
      id: "experience",
      title: `Have you ever done ${w.work}?`,
      hint: "Be honest. There is no wrong answer, and you can change your level later.",
      options: [
        { points: 0, label: "No, never. This is all new to me." },
        { points: 1, label: "A little, for friends, family, school or just for practice." },
        { points: 2, label: "Yes, many times, in a job, in a business or on my own projects." },
      ],
    },
    {
      id: "tools",
      title: `How comfortable are you with ${w.tools}?`,
      options: [
        { points: 0, label: "I have not used them, or only for personal things on my phone." },
        { points: 1, label: "I know the basics, but I still look up how to do most things." },
        { points: 2, label: "I use them confidently and could show someone else how." },
      ],
    },
    {
      id: "client",
      title: "Has anyone ever paid you, or your employer, for this kind of work?",
      options: [
        { points: 0, label: "No, nobody has paid me for it." },
        { points: 1, label: "Once or twice, for small jobs or a short contract." },
        { points: 2, label: "Yes, I have had regular clients or a job doing it." },
      ],
    },
    {
      id: "tasks",
      title: "Which of these could you do on your own, today, without help?",
      hint: "Choose the hardest one you could really do.",
      options: [
        { points: 0, label: w.tasks[0] },
        { points: 1, label: w.tasks[1] },
        { points: 2, label: w.tasks[2] },
      ],
    },
    {
      id: "support",
      title: "How much help would you like in your first week?",
      options: [
        { points: 0, label: "A lot. Explain things in plain words and show me every step." },
        { points: 1, label: "Some. Give me a clear brief and tips, and I will work the rest out." },
        { points: 2, label: "Very little. Give me a real, tough brief and I will figure it out." },
      ],
    },
  ];
}

export type QuizAnswers = Partial<Record<QuizQuestionId, Points>>;

export type QuizResult = {
  level: LevelId;
  score: number;
  max: number;
  /** One plain sentence on why. */
  reason: string;
};

export const QUIZ_MAX = QUIZ_QUESTION_IDS.length * 2;

export function isQuizComplete(a: QuizAnswers): boolean {
  return QUIZ_QUESTION_IDS.every((id) => a[id] !== undefined);
}

const REASONS = {
  new: "You have not done this kind of work yet, so starting from the basics is the best way in.",
  beginner:
    "You have tried a little and like clear guidance, so Beginner builds your skills one step at a time.",
  intermediate:
    "You know the basics and can work things out yourself, so Intermediate helps you run whole systems, not just single tasks.",
  capped:
    "You know this work well, but Advanced is for people with paid experience who already set up how the work is done, so Intermediate fits best today.",
  advanced:
    "You already do this work for paying clients or an employer and can set things up for others, so Advanced fits you.",
} as const;

/**
 * Add up the points (0 to 10), then apply two safety rules so nobody lands too high:
 *  - never done the work before: always Beginner.
 *  - Advanced needs real paid experience and the hardest tasks, not just a high total.
 * Scores 0 to 3 are Beginner, 4 to 7 Intermediate, 8 to 10 Advanced.
 */
export function scoreQuiz(a: QuizAnswers): QuizResult {
  const get = (id: QuizQuestionId): number => a[id] ?? 0;
  const score = QUIZ_QUESTION_IDS.reduce((sum, id) => sum + get(id), 0);

  if (get("experience") === 0) {
    return { level: "beginner", score, max: QUIZ_MAX, reason: REASONS.new };
  }
  if (score <= 3) {
    return { level: "beginner", score, max: QUIZ_MAX, reason: REASONS.beginner };
  }
  if (score >= 8) {
    const earned = get("experience") === 2 && get("client") >= 1 && get("tasks") === 2;
    return earned
      ? { level: "advanced", score, max: QUIZ_MAX, reason: REASONS.advanced }
      : { level: "intermediate", score, max: QUIZ_MAX, reason: REASONS.capped };
  }
  return { level: "intermediate", score, max: QUIZ_MAX, reason: REASONS.intermediate };
}

/** Handy for tests: every level the quiz can return. */
export const QUIZ_LEVELS = LEVELS;
