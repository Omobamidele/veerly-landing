import { promises as fs } from "fs";
import path from "path";
import { careerPaths, careerStages } from "./site";

export type WaitlistEntry = {
  id: string;
  name: string;
  email: string;
  country: string;
  profession: string;
  careerStage: string;
  careerPath: string;
  linkedin: string;
  createdAt: string;
  updatedAt: string;
};

export type FieldErrors = Partial<Record<keyof WaitlistEntry, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "";

export function validate(body: Record<string, unknown>) {
  const data = {
    name: clean(body.name, 120),
    email: clean(body.email, 254).toLowerCase(),
    country: clean(body.country, 80),
    profession: clean(body.profession, 160),
    careerStage: clean(body.careerStage, 80),
    careerPath: clean(body.careerPath, 80),
    linkedin: clean(body.linkedin, 300),
  };
  const errors: FieldErrors = {};
  if (data.name.length < 2) errors.name = "Please tell us your name.";
  if (!EMAIL_RE.test(data.email)) errors.email = "Please enter a valid email address.";
  if (data.careerStage && !(careerStages as readonly string[]).includes(data.careerStage))
    errors.careerStage = "Please choose a career stage from the list.";
  if (
    data.careerPath &&
    data.careerPath !== "Not sure yet" &&
    !(careerPaths as readonly string[]).includes(data.careerPath)
  )
    errors.careerPath = "Please choose a career path from the list.";
  if (data.linkedin) {
    let ok = false;
    try {
      const u = new URL(data.linkedin.startsWith("http") ? data.linkedin : `https://${data.linkedin}`);
      ok = /(^|\.)linkedin\.com$/i.test(u.hostname);
      if (ok) data.linkedin = u.toString();
    } catch {}
    if (!ok) errors.linkedin = "That doesn't look like a LinkedIn profile link.";
  }
  return { data, errors };
}

// ---------- Sinks ----------
const DATA_FILE = path.join(process.cwd(), "data", "waitlist.json");

function fileStoreEnabled() {
  const flag = process.env.WAITLIST_FILE_STORE;
  if (flag) return flag === "true";
  return !process.env.VERCEL; // Vercel's filesystem is read-only
}

async function saveToFile(entry: WaitlistEntry): Promise<"created" | "updated"> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  let list: WaitlistEntry[] = [];
  try {
    list = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
  } catch {}
  const i = list.findIndex((e) => e.email === entry.email);
  let result: "created" | "updated" = "created";
  if (i >= 0) {
    list[i] = { ...list[i], ...entry, id: list[i].id, createdAt: list[i].createdAt };
    result = "updated";
  } else list.push(entry);
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2));
  await fs.rename(tmp, DATA_FILE);
  return result;
}

/**
 * Notion database properties expected (rename here if yours differ):
 * Name (title), Email (email), Country (rich text), Profession (rich text),
 * Career stage (select), Career path (select), LinkedIn (url), Signed up (date)
 */
async function saveToNotion(entry: WaitlistEntry) {
  const text = (s: string) => ({ rich_text: s ? [{ text: { content: s } }] : [] });
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: process.env.NOTION_WAITLIST_DATABASE_ID },
      properties: {
        Name: { title: [{ text: { content: entry.name } }] },
        Email: { email: entry.email },
        Country: text(entry.country),
        Profession: text(entry.profession),
        "Career stage": entry.careerStage ? { select: { name: entry.careerStage } } : { select: null },
        "Career path": entry.careerPath ? { select: { name: entry.careerPath } } : { select: null },
        LinkedIn: { url: entry.linkedin || null },
        "Signed up": { date: { start: entry.createdAt } },
      },
    }),
  });
  if (!res.ok) throw new Error(`Notion ${res.status}: ${await res.text()}`);
}

async function saveToWebhook(entry: WaitlistEntry) {
  const res = await fetch(process.env.WAITLIST_WEBHOOK_URL as string, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "veerly.waitlist.signup", entry }),
  });
  if (!res.ok) throw new Error(`Webhook ${res.status}`);
}

export async function store(entry: WaitlistEntry) {
  const sinks: { name: string; run: () => Promise<unknown> }[] = [];
  if (fileStoreEnabled()) sinks.push({ name: "file", run: () => saveToFile(entry) });
  if (process.env.NOTION_TOKEN && process.env.NOTION_WAITLIST_DATABASE_ID)
    sinks.push({ name: "notion", run: () => saveToNotion(entry) });
  if (process.env.WAITLIST_WEBHOOK_URL) sinks.push({ name: "webhook", run: () => saveToWebhook(entry) });

  if (sinks.length === 0) throw new Error("No waitlist storage is configured.");

  const results = await Promise.allSettled(sinks.map((s) => s.run()));
  const saved = sinks.filter((_, i) => results[i].status === "fulfilled").map((s) => s.name);
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(`[waitlist] ${sinks[i].name} failed:`, r.reason);
  });
  if (saved.length === 0) throw new Error("Every waitlist sink failed.");
  const fileResult = saved.includes("file") ? (results[0] as PromiseFulfilledResult<unknown>).value : undefined;
  return { saved, duplicate: fileResult === "updated" };
}
