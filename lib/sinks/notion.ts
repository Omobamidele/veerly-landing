import type { Signup } from "../types";
import type { Sink } from "./index";

/**
 * Mirrors signups into a Notion database (one row per person, updated in place).
 * Expected properties: Name (title), Email (email), WhatsApp (phone), Country (text), Profession (text),
 * Career stage (select), Career path (select), LinkedIn (url), Email consent (checkbox),
 * WhatsApp consent (checkbox), Paid (checkbox), Signed up (date).
 */
const env = (k: string) => (process.env[k] || "").trim();

function props(s: Signup) {
  const text = (v?: string) => ({ rich_text: v ? [{ text: { content: v } }] : [] });
  const select = (v?: string) => ({ select: v ? { name: v } : null });
  return {
    Name: { title: [{ text: { content: s.name } }] },
    Email: { email: s.email },
    WhatsApp: { phone_number: s.whatsapp },
    Country: text(s.profile.country),
    Profession: text(s.profile.profession),
    "Career stage": select(s.profile.careerStage),
    "Career path": select(s.profile.careerPath),
    LinkedIn: { url: s.profile.linkedin || null },
    "Email consent": { checkbox: s.consent.email.granted },
    "WhatsApp consent": { checkbox: s.consent.whatsapp.granted },
    Paid: { checkbox: s.payment.status === "paid" },
    "Signed up": { date: { start: s.createdAt } },
  };
}

export const notionSink: Sink = {
  name: "notion",
  enabled: () => Boolean(env("NOTION_TOKEN") && env("NOTION_WAITLIST_DATABASE_ID")),
  async handle(_event, s) {
    const headers = {
      Authorization: `Bearer ${env("NOTION_TOKEN")}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    };
    const pageId = s.external?.notionPageId;
    const res = await fetch(pageId ? `https://api.notion.com/v1/pages/${pageId}` : "https://api.notion.com/v1/pages", {
      method: pageId ? "PATCH" : "POST",
      headers,
      body: JSON.stringify(
        pageId ? { properties: props(s) } : { parent: { database_id: env("NOTION_WAITLIST_DATABASE_ID") }, properties: props(s) },
      ),
    });
    if (!res.ok) throw new Error(`Notion ${res.status}: ${await res.text()}`);
    if (!pageId) {
      const json = await res.json();
      return { external: { notionPageId: json.id } };
    }
  },
};
