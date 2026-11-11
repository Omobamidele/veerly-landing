/**
 * Career-path levels — source of truth for the landing-page picker.
 * Every path in lib/options.ts has Beginner, Intermediate and Advanced.
 * Each student gets only the workspace for the path and level they choose.
 * Same price at every path and level.
 *
 * These describe skills students can show at the end. They are not job guarantees.
 * Virtual Assistant copy is from /workspace/veerly-super/va-levels.md.
 */

import { careerPaths } from "./options";

export const LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type LevelId = (typeof LEVELS)[number];
/** @deprecated Use LevelId. Kept so existing imports keep working. */
export type VaLevel = LevelId;

export type CareerPath = (typeof careerPaths)[number];

export const LEVEL_STORAGE_KEY = "veerly.level";
export const PATH_STORAGE_KEY = "veerly.path";

export const LEVEL_LABEL: Record<LevelId, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export type PathMeta = {
  id: CareerPath;
  slug: string;
  /** Short label for cards, summaries and the welcome page. */
  label: string;
};

export const PATH_META: PathMeta[] = [
  { id: "Sales and Business Development", slug: "sales", label: "Sales and Business Development" },
  { id: "Marketing and Content", slug: "marketing", label: "Marketing and Content" },
  { id: "Customer Success and Support", slug: "customer-success", label: "Customer Success and Support" },
  { id: "Business Operations", slug: "operations", label: "Business Operations" },
  { id: "Administration and Virtual Assistance", slug: "va", label: "Virtual Assistant" },
  { id: "Project Management", slug: "project-management", label: "Project Management" },
  { id: "Data and Analytics", slug: "data", label: "Data and Analytics" },
  { id: "Software and Technology", slug: "software", label: "Software and Technology" },
  { id: "GTM and Revenue Operations", slug: "gtm", label: "GTM and Revenue Operations" },
  { id: "Design and Creative Services", slug: "design", label: "Design and Creative Services" },
];

const BY_ID = Object.fromEntries(PATH_META.map((p) => [p.id, p])) as Record<CareerPath, PathMeta>;
const BY_SLUG = Object.fromEntries(PATH_META.map((p) => [p.slug, p])) as Record<string, PathMeta>;

export type LevelCard = {
  id: LevelId;
  name: string;
  /** One-line "who it's for". */
  who: string;
  learn: string[];
  able: string[];
  cta: string;
};

type LevelCopy = Pick<LevelCard, "who" | "learn" | "able">;

function cards(copy: Record<LevelId, LevelCopy>): LevelCard[] {
  return LEVELS.map((id) => ({
    id,
    name: LEVEL_LABEL[id],
    cta: `Choose ${LEVEL_LABEL[id]}`,
    ...copy[id],
  }));
}

/** Virtual Assistant — from va-levels.md. */
const VA: Record<LevelId, LevelCopy> = {
  beginner: {
    who: "You've never worked as a virtual assistant, or you've only helped friends or family.",
    learn: [
      "Google Workspace basics: Gmail, Calendar, Drive, Docs and Sheets",
      "Running an inbox: labels, filters, saved replies and a daily summary",
      "Calendars and time zones, including booking links",
      "Writing clear messages and updates to clients",
      "Research and simple travel planning",
      "Your first client: boundaries, rates and your 60-second intro",
    ],
    able: [
      "Set up a professional Gmail and Google Drive and keep files tidy",
      "Sort a busy inbox with labels, filters and saved replies",
      "Book meetings across time zones without mistakes",
      "Write short, clear updates: what's done, what's next, what you need",
      "Research options and present one clear recommendation",
      "Keep client logins safe with a password manager and 2-step verification",
      "Introduce yourself in 60 seconds and show three finished portfolio projects",
    ],
  },
  intermediate: {
    who: "You've done some admin or VA work, or you're confident with Gmail, Google Calendar, Docs and Sheets.",
    learn: [
      "Client onboarding: welcome pack, intake form and safe access",
      "Writing SOPs and recording walkthrough videos",
      "Task tools: Trello, Asana and Notion",
      "Spreadsheets with dropdowns, formulas and a summary tab",
      "Zapier basics: your first automation",
      "Canva brand kits, and managing two or three clients at once",
    ],
    able: [
      "Onboard a new client with a welcome pack, intake form and safe access",
      "Write SOPs and record short walkthrough videos",
      "Run several clients' work on a Trello, Asana or Notion board",
      "Build spreadsheets with dropdowns, formulas and a summary tab",
      "Set up a simple Zapier automation and explain how it works",
      "Make on-brand graphics from a Canva brand kit",
      "Plan your week across two or three clients and report to each one",
    ],
  },
  advanced: {
    who: "You already work with clients, or you're confident with SOPs, task tools and basic automation.",
    learn: [
      "Choosing a specialism: executive, e-commerce, operations or project-management VA",
      "Multi-step automation with Zapier and Notion",
      "Client onboarding systems that run the same way every time",
      "Pricing, packages and monthly retainers",
      "Proposals, discovery calls and stopping scope creep",
      "Leading: delegation, quality checks and client reporting",
    ],
    able: [
      "Choose a specialism (executive, e-commerce, operations or project-management VA) and explain it clearly",
      "Design and run a multi-step automation with checks and alerts",
      "Build an onboarding system that sets up every new client the same way",
      "Price your work from your own numbers and write retainer packages",
      "Write a one-page proposal and lead a discovery call",
      "Delegate to a junior VA, check the quality and report to the client",
      "Protect client access with an access log and clean offboarding",
    ],
  },
};

const SALES: Record<LevelId, LevelCopy> = {
  beginner: {
    who: "You've never worked in sales, or you've only helped informally with enquiries or outreach.",
    learn: [
      "What a simple sales process looks like, from first message to a booked call",
      "Researching a company and writing a short, specific outreach note",
      "Keeping a clean pipeline in a CRM or a spreadsheet",
      "Call and meeting notes: what was said, what's next, and by when",
      "Following up without nagging, and logging every step",
    ],
    able: [
      "Research a company and write a one-paragraph outreach note that names a real detail",
      "Keep a pipeline with clear stages and next actions",
      "Run a first conversation from a simple script and write useful notes afterwards",
      "Follow up on a set schedule and record what happened",
      "Show three finished pieces of work: a research brief, an outreach sequence and a tidy pipeline",
    ],
  },
  intermediate: {
    who: "You've done some sales, business development or customer conversations, or you're confident with a CRM.",
    learn: [
      "Qualifying whether someone is a fit, and deciding when to walk away",
      "Writing a short sequence of emails, not just a single message",
      "Discovery questions, call structure and next-step emails",
      "CRM hygiene: stages, tasks, and a weekly pipeline review",
      "Handing a qualified opportunity to a closer, with a clear summary",
    ],
    able: [
      "Qualify a lead with a short set of questions and write down the fit",
      "Build and run a three-to-five step outreach sequence",
      "Lead a discovery call and send a clear recap the same day",
      "Review a pipeline each week and flag what's stuck",
      "Hand over a qualified opportunity with context a colleague can act on",
    ],
  },
  advanced: {
    who: "You already sell, run a small book of accounts, or coach others on outreach.",
    learn: [
      "Building a territory or account list, and deciding where to spend time",
      "Multi-threading: more than one contact in the same company",
      "A simple forecast: what's likely, what's at risk, and why",
      "Writing a short sales playbook others can follow",
      "Coaching a junior teammate and reviewing their pipeline",
    ],
    able: [
      "Build an account list with a clear reason each company is on it",
      "Work more than one contact in an account and keep notes in one place",
      "Write a weekly forecast that a manager can read in two minutes",
      "Draft a playbook for outreach, discovery and handover",
      "Coach a junior colleague from a recorded call and a pipeline review",
    ],
  },
};

const MARKETING: Record<LevelId, LevelCopy> = {
  beginner: {
    who: "You can write clearly, but you haven't run marketing or a content calendar for a business.",
    learn: [
      "What a simple brief looks like: audience, message, channel and deadline",
      "Planning a week of posts or emails on a calendar",
      "Writing a short post, a blog outline and an email in plain language",
      "Basic checks: links, spelling, image size and alt text",
      "Reading a simple analytics view: what was published and what people opened or clicked",
    ],
    able: [
      "Write a one-page brief for a piece of content",
      "Plan a week of posts on a calendar with owners and dates",
      "Draft a social post, a short email and a blog outline from the same brief",
      "Check a draft for links, spelling and image basics before it goes out",
      "Report what was published in a week and which piece got the most response",
    ],
  },
  intermediate: {
    who: "You've written or scheduled content before, or you're comfortable with a calendar, Canva and a simple analytics view.",
    learn: [
      "Turning one idea into a post, an email and a longer article",
      "An editorial calendar for a month, not just a week",
      "Brand voice: a short guide so more than one person can write in the same style",
      "Utm links, a simple campaign sheet, and reviewing what worked",
      "Working with a designer or using a brand kit so assets stay consistent",
    ],
    able: [
      "Turn one idea into three formats and schedule them",
      "Run a month-long editorial calendar and keep it up to date",
      "Write a one-page voice guide with examples of 'do' and 'don't'",
      "Tag links, record results in a sheet and recommend what to do more of",
      "Brief a designer, or build a small set of on-brand templates yourself",
    ],
  },
  advanced: {
    who: "You already run content or campaigns, or you lead the work of other writers and designers.",
    learn: [
      "A simple content strategy: who it's for, what you'll say, and where it lives",
      "Planning campaigns with a goal, a timeline and a review date",
      "Briefing freelancers, reviewing drafts and keeping quality consistent",
      "Choosing what to stop, start and continue from the last month's results",
      "Presenting a quarterly plan that a founder can approve",
    ],
    able: [
      "Write a two-page strategy that names the audience, channels and themes",
      "Plan a campaign with dates, owners, assets and a way to review it",
      "Brief and review other people's work against a voice and quality checklist",
      "Recommend what to change next month, using the numbers you have",
      "Present a quarterly plan in a short document and a ten-minute walkthrough",
    ],
  },
};

const CS: Record<LevelId, LevelCopy> = {
  beginner: {
    who: "You've helped customers informally, or you're new to support and customer success.",
    learn: [
      "How a simple support inbox works: queues, tags and response times",
      "Writing a clear, kind reply that answers the question",
      "When to escalate, and what to include so the next person can help",
      "Keeping a record of the issue, the steps tried and the outcome",
      "A short welcome or onboarding message for a new customer",
    ],
    able: [
      "Triage a shared inbox and reply in a calm, plain style",
      "Write a reply that answers the question and says what happens next",
      "Escalate with a short summary: what they asked, what you tried, what you need",
      "Log issues so someone else can pick them up",
      "Send a welcome note that tells a new customer how to get help",
    ],
  },
  intermediate: {
    who: "You've worked in support, success or account management, or you already handle a customer inbox.",
    learn: [
      "A simple health check: is this customer getting value, stuck, or at risk?",
      "Onboarding a new account: a kick-off note, a first-week checklist and a follow-up",
      "Macros, saved replies and a small help-centre article",
      "Turning a repeated question into a short guide or a product note",
      "A monthly check-in: what went well, what's blocked, what's next",
    ],
    able: [
      "Flag an at-risk account with evidence, not a guess",
      "Run a first-week onboarding checklist and close the loop",
      "Write saved replies and one help article for a repeated question",
      "Send a product or process note when the same issue keeps coming up",
      "Lead a monthly check-in and write a one-page recap",
    ],
  },
  advanced: {
    who: "You already own accounts, or you set up the way a team looks after customers.",
    learn: [
      "Designing an onboarding path that works the same way for every new account",
      "A simple success plan: goals, check-ins and who does what",
      "QBR-style reviews: a short pack a customer can follow",
      "Handing work between support, success and sales without dropping context",
      "Coaching a teammate on difficult conversations and written tone",
    ],
    able: [
      "Build an onboarding path with emails, a checklist and a handoff",
      "Write a success plan a customer and your team can both use",
      "Run a review meeting with a short pack and clear next steps",
      "Set up a handoff between teams that keeps the history in one place",
      "Coach a teammate from a real ticket or a recorded call",
    ],
  },
};

const OPS: Record<LevelId, LevelCopy> = {
  beginner: {
    who: "You're organised in your own work, but you haven't run operations for a team or a small business.",
    learn: [
      "Turning a messy process into a simple checklist other people can follow",
      "Spreadsheets: clean columns, dropdowns and a summary tab",
      "A weekly operations rhythm: what to check, what to send, what to flag",
      "Naming files and folders so anyone can find things",
      "Writing a short update: what's on track, what's late, what you need",
    ],
    able: [
      "Write a one-page checklist for a repeat process",
      "Build a tidy tracker with dropdowns and a summary view",
      "Run a weekly check and send a short status note",
      "Set up a shared folder with clear names and access",
      "Flag a delay early, with a suggested next step",
    ],
  },
  intermediate: {
    who: "You've kept a team organised, or you're confident with spreadsheets, SOPs and a task tool.",
    learn: [
      "Mapping a process end to end, and finding the step that always slips",
      "SOPs with screenshots or a short walkthrough video",
      "A simple automation that moves a form or a row to the next step",
      "Vendor or tools tracking: renewals, owners and access",
      "Running a standup or a weekly ops meeting with a written record",
    ],
    able: [
      "Map a process and recommend one change that would save time",
      "Write an SOP and record a short walkthrough",
      "Set up a simple automation and explain how to switch it off if it fails",
      "Keep a tool and renewal log that a founder can trust",
      "Run a weekly ops meeting and send notes the same day",
    ],
  },
  advanced: {
    who: "You already run operations for a team, or you design the systems other people work in.",
    learn: [
      "Designing a system that still works when you're not in the room",
      "Handovers, coverage and a simple risk log",
      "Choosing tools, documenting access, and cleaning up unused ones",
      "Quality checks: what 'done' looks like, and how you spot drift",
      "Reporting to a founder: a one-page monthly operations review",
    ],
    able: [
      "Design a process with owners, backups and a written 'done' standard",
      "Write a coverage plan and a short risk log",
      "Recommend a tool change with costs, migration steps and a rollback",
      "Spot when a process is drifting and bring it back to the standard",
      "Write a monthly operations review a founder can read in five minutes",
    ],
  },
};

const PM: Record<LevelId, LevelCopy> = {
  beginner: {
    who: "You've organised your own work, but you haven't run a project for a team or a client.",
    learn: [
      "A simple project brief: goal, scope, dates and who's involved",
      "A task board: to do, in progress, blocked, done",
      "Writing an agenda and notes for a short meeting",
      "A risk or blocker list, updated every week",
      "A clear status update: on track, at risk, or late — and why",
    ],
    able: [
      "Write a one-page brief a team can start from",
      "Keep a task board up to date and spot what's blocked",
      "Run a 15-minute standup with an agenda and notes",
      "Log blockers and say who needs to unblock them",
      "Send a weekly status note a sponsor can read quickly",
    ],
  },
  intermediate: {
    who: "You've coordinated a project, or you're comfortable with a board, a timeline and stakeholder updates.",
    learn: [
      "A realistic plan: milestones, dependencies and a buffer",
      "RACI or a simple 'who decides, who does, who is told'",
      "Running a kick-off and a mid-project review",
      "Change requests: what was asked, what it does to dates, and the decision",
      "A handover pack when the work is finished",
    ],
    able: [
      "Build a plan with milestones, owners and dependencies",
      "Write down who decides what, so work doesn't stall",
      "Run a kick-off and a mid-point review with decisions recorded",
      "Handle a change request without losing the original scope",
      "Hand over a finished project with files, owners and open items",
    ],
  },
  advanced: {
    who: "You already run projects or a small programme, or you coordinate other coordinators.",
    learn: [
      "Running more than one project at a time without mixing the plans",
      "A lightweight governance rhythm: decisions, risks and a steering note",
      "Retrospectives that lead to one or two real changes",
      "Briefing and reviewing other people's plans",
      "A short portfolio view for a founder or a client",
    ],
    able: [
      "Keep two or three projects in one view, each with a clear status",
      "Write a steering note that asks for a decision, not a long report",
      "Run a retrospective and turn it into a change the team will actually try",
      "Review someone else's plan and give useful, specific feedback",
      "Present a portfolio snapshot with what's on track and what needs a decision",
    ],
  },
};

const DATA: Record<LevelId, LevelCopy> = {
  beginner: {
    who: "You're comfortable with spreadsheets, but you haven't built reports or cleaned data for a team.",
    learn: [
      "Tidying a messy table: one header row, one fact per cell, no merged cells",
      "Useful formulas: lookups, counts, sums and simple dates",
      "Charts that answer one question, with a clear title",
      "Checking for duplicates, blanks and values that don't make sense",
      "Writing a short note that says what the numbers show, and what they don't",
    ],
    able: [
      "Clean a messy spreadsheet into a table someone else can use",
      "Build a summary tab with a few reliable formulas",
      "Make a simple chart that answers one question",
      "Find and fix duplicates, blanks and odd values",
      "Write a half-page read-out of what you found, with caveats",
    ],
  },
  intermediate: {
    who: "You've built spreadsheets or basic reports, or you're comfortable with formulas, charts and a data source.",
    learn: [
      "A simple data dictionary: what each column means and where it comes from",
      "Joining two tables carefully, and checking the row counts",
      "A dashboard with a few metrics a manager can check each week",
      "SQL or a no-code query tool for a basic select, filter and group",
      "A repeatable refresh: how the numbers get updated, and by whom",
    ],
    able: [
      "Document each field in a dataset so the next person isn't guessing",
      "Join two tables and prove the result still adds up",
      "Build a weekly dashboard with a small set of agreed metrics",
      "Write a basic query and save it where the team can rerun it",
      "Set a refresh routine and a note for when the numbers look off",
    ],
  },
  advanced: {
    who: "You already build reports or models, or you help a team trust its numbers.",
    learn: [
      "Choosing the right metric for a question, and saying when a metric is misleading",
      "A simple model or forecast with clear assumptions",
      "Quality checks and an issues log when a source changes",
      "Explaining a finding to a non-analyst, with one chart and a recommendation",
      "A short analytics plan: questions, sources, and what you'll not try to answer",
    ],
    able: [
      "Recommend a metric and explain what it will and won't tell you",
      "Build a simple forecast with the assumptions written down",
      "Catch a broken source and record what you changed",
      "Present a finding in a one-page note a founder can act on",
      "Write an analytics plan for the next month with clear limits",
    ],
  },
};

const SOFTWARE: Record<LevelId, LevelCopy> = {
  beginner: {
    who: "You've used software all day, but you haven't built, tested or supported it as your work.",
    learn: [
      "How the web basics fit together: a page, a request, and a simple database idea",
      "Writing a clear bug report: steps, expected result, actual result, and a screenshot",
      "A first small project in a beginner-friendly stack, with the steps written down",
      "Using git at a basic level: save, explain, and don't lose your work",
      "Reading a short technical brief and asking useful questions before you start",
    ],
    able: [
      "Explain, in plain words, what happens when someone opens a simple web page",
      "Write a bug report someone else can reproduce",
      "Build a small, finished practice project and show how it works",
      "Save your work with clear notes so you can go back a step",
      "Turn a loose request into a short list of questions and a first plan",
    ],
  },
  intermediate: {
    who: "You've built something small, written tests, or done IT or QA support, and you can follow a brief.",
    learn: [
      "Breaking a feature into tasks, and estimating in a way you can explain",
      "Writing a simple test, or a checklist, before you call the work done",
      "Reading someone else's code or config and leaving a useful comment",
      "A basic API: how to call it, what comes back, and how to record an error",
      "A short runbook for when something breaks",
    ],
    able: [
      "Split a feature into tasks with a realistic order",
      "Add a test or a checklist and use it before you hand work over",
      "Review a small change and leave comments a teammate can act on",
      "Call a simple API, handle an error, and write down what you saw",
      "Write a runbook that tells someone what to try first when it fails",
    ],
  },
  advanced: {
    who: "You already ship features, support a system, or help other people do that work.",
    learn: [
      "Designing a small feature with trade-offs written down",
      "A simple architecture sketch: what's in the system and how the parts talk",
      "Quality, access and a basic security checklist",
      "Planning a rollout and a rollback",
      "Mentoring a junior teammate through a small piece of work",
    ],
    able: [
      "Write a short design note with options and a recommended path",
      "Sketch how the parts of a small system fit together",
      "Go through a security and access checklist before something goes live",
      "Plan a rollout with a way to undo it if it fails",
      "Coach a junior teammate from a real task, not a lecture",
    ],
  },
};

const GTM: Record<LevelId, LevelCopy> = {
  beginner: {
    who: "You've worked near sales or marketing, or with a spreadsheet, but you haven't run revenue operations.",
    learn: [
      "What a simple funnel looks like, and what each stage is supposed to mean",
      "Keeping CRM fields consistent so reports can be trusted",
      "A weekly revenue snapshot: new, open, won, lost — and a short comment",
      "How a lead gets from a form or a list into the pipeline",
      "Writing a clear request when a tool or a field isn't working",
    ],
    able: [
      "Explain a simple funnel in plain words, with an example",
      "Clean a set of CRM records so stages and owners are consistent",
      "Build a weekly snapshot a founder can read in two minutes",
      "Map how a new lead should move from form to first conversation",
      "Write a precise request when a field, a report or an integration breaks",
    ],
  },
  intermediate: {
    who: "You've kept a CRM or a pipeline tidy, or you've built reports for a sales or marketing team.",
    learn: [
      "Lead routing: who gets what, and what happens if no one picks it up",
      "A simple attribution or source field that's good enough to learn from",
      "Lifecycle stages that sales and marketing both agree on",
      "A basic automation: form to CRM to a Slack or email alert",
      "A monthly review of conversion between stages, and one recommended change",
    ],
    able: [
      "Design a routing rule and a backup for unowned leads",
      "Add a source field and report on it without overclaiming",
      "Write down lifecycle stages both teams will actually use",
      "Set up a simple alert when a new lead arrives",
      "Recommend one process change from a monthly conversion review",
    ],
  },
  advanced: {
    who: "You already run revenue operations, or you own the CRM and the reports a sales team relies on.",
    learn: [
      "A revenue system design: objects, stages, owners and the reports that matter",
      "Forecast support: what the numbers mean, and where they are weak",
      "Tool choices, access and a change log so the system doesn't drift",
      "A GTM playbook: how marketing, sales and success hand work to each other",
      "Presenting a quarterly GTM review to a founder",
    ],
    able: [
      "Document the revenue system so a new teammate can find their way",
      "Support a forecast with a clear note on what's solid and what's assumed",
      "Manage access and record changes when a field or a workflow moves",
      "Write a handoff playbook across marketing, sales and success",
      "Present a quarterly review with a small set of recommendations",
    ],
  },
};

const DESIGN: Record<LevelId, LevelCopy> = {
  beginner: {
    who: "You like making things look clear, but you haven't done design work for a client or a team.",
    learn: [
      "A simple brief: who it's for, what it has to do, and any must-use brand elements",
      "Layout basics: type, spacing, alignment and contrast",
      "Working in Figma or a similar tool: frames, components and exporting",
      "Using a brand kit or a small type-and-colour set consistently",
      "Presenting two options and saying why you made each choice",
    ],
    able: [
      "Write or follow a one-page brief before you start designing",
      "Lay out a simple page or a post that is easy to read",
      "Build a tidy Figma file someone else can open and export from",
      "Stay consistent with a small set of type, colour and spacing rules",
      "Present two options with a short, plain explanation of the difference",
    ],
  },
  intermediate: {
    who: "You've designed posts, pages or simple product screens, or you're confident in Figma and a brand kit.",
    learn: [
      "A small design system: type, colour, buttons, spacing and when to use each",
      "Wireframes first, then visual design",
      "Working with a writer or a developer, and writing a handoff note",
      "Feedback: what to take, what to question, and how to show the change",
      "A short case write-up: the problem, the choices, the result",
    ],
    able: [
      "Set up a small design system and use it on more than one piece of work",
      "Start with a wireframe so the layout is agreed before the polish",
      "Hand a file to a developer or a writer with notes they can follow",
      "Respond to feedback with a revised option and a short reason",
      "Write a one-page case on a piece of work you've finished",
    ],
  },
  advanced: {
    who: "You already design for clients or a product, or you review other people's design work.",
    learn: [
      "Framing a design problem and choosing a scope you can finish",
      "Leading a critique or a review without making it personal",
      "A fuller system: components, states and a short usage guide",
      "Working with stakeholders who are not designers, and getting a decision",
      "A portfolio of a few strong case studies, each with a clear story",
    ],
    able: [
      "Write a problem statement and a scope a stakeholder can approve",
      "Run a critique that leaves the work better, with notes the team can use",
      "Build or extend a component set with states and usage notes",
      "Lead a review meeting and leave with a decision, not a vague 'looks good'",
      "Put together a small set of case studies that show how you think, not only how things look",
    ],
  },
};

export const LEVELS_BY_PATH: Record<CareerPath, LevelCard[]> = {
  "Sales and Business Development": cards(SALES),
  "Marketing and Content": cards(MARKETING),
  "Customer Success and Support": cards(CS),
  "Business Operations": cards(OPS),
  "Administration and Virtual Assistance": cards(VA),
  "Project Management": cards(PM),
  "Data and Analytics": cards(DATA),
  "Software and Technology": cards(SOFTWARE),
  "GTM and Revenue Operations": cards(GTM),
  "Design and Creative Services": cards(DESIGN),
};

/** @deprecated VA-only cards; prefer levelCardsFor(path). */
export const LEVEL_CARDS = LEVELS_BY_PATH["Administration and Virtual Assistance"];
export const VA_PATH_LABEL = "Virtual Assistant";
export const VA_CAREER_PATH: CareerPath = "Administration and Virtual Assistance";

export function isLevel(v: unknown): v is LevelId {
  return typeof v === "string" && (LEVELS as readonly string[]).includes(v);
}

export function parseLevel(v: unknown): LevelId | null {
  if (typeof v !== "string") return null;
  const s = v.trim().toLowerCase();
  return isLevel(s) ? s : null;
}

export function levelLabel(v: unknown): string | null {
  const level = parseLevel(v);
  return level ? LEVEL_LABEL[level] : null;
}

export function isCareerPath(v: unknown): v is CareerPath {
  return typeof v === "string" && (careerPaths as readonly string[]).includes(v);
}

/** Accepts the official path name, a slug (va, gtm, …) or the short label. */
export function parsePath(v: unknown): CareerPath | null {
  if (typeof v !== "string") return null;
  const raw = v.trim();
  if (!raw) return null;
  if (isCareerPath(raw)) return raw;
  const lower = raw.toLowerCase();
  const bySlug = BY_SLUG[lower];
  if (bySlug) return bySlug.id;
  const byLabel = PATH_META.find((p) => p.label.toLowerCase() === lower);
  return byLabel?.id ?? null;
}

export function pathMeta(v: unknown): PathMeta | null {
  const path = parsePath(v);
  return path ? BY_ID[path] : null;
}

export function pathLabel(v: unknown): string | null {
  return pathMeta(v)?.label ?? null;
}

export function levelCardsFor(v: unknown): LevelCard[] | null {
  const path = parsePath(v);
  return path ? LEVELS_BY_PATH[path] : null;
}

export function levelCardFor(path: unknown, level: unknown): LevelCard | null {
  const cardsForPath = levelCardsFor(path);
  const id = parseLevel(level);
  if (!cardsForPath || !id) return null;
  return cardsForPath.find((c) => c.id === id) ?? null;
}

export function planSummary(path: unknown, level: unknown): string | null {
  const p = pathMeta(path);
  const l = levelLabel(level);
  if (!p || !l) return null;
  return `${p.label} · ${l}`;
}
