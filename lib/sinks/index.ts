import type { Signup } from "../types";
import { brevoSink } from "./brevo";
import { notionSink } from "./notion";
import { webhookSink } from "./webhook";

export type SinkEvent = "signup.created" | "signup.updated" | "profile.updated" | "payment.succeeded" | "addon.paid";

/**
 * A sink mirrors store changes into another tool (email platform, Notion, Google Sheet via webhook).
 * Sinks never block a signup: the primary store is saved first, then sinks run and failures are logged.
 * A sink may return a patch (e.g. an external id) that is merged back into the record.
 */
export interface Sink {
  name: string;
  enabled(): boolean;
  handle(event: SinkEvent, s: Signup): Promise<Partial<Signup> | void>;
}

export const sinks: Sink[] = [brevoSink, notionSink, webhookSink];

export async function dispatch(event: SinkEvent, s: Signup) {
  const active = sinks.filter((k) => k.enabled());
  const results = await Promise.allSettled(active.map((k) => k.handle(event, s)));
  let patch: Partial<Signup> = {};
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(`[sink:${active[i].name}] ${event} failed:`, r.reason);
    else if (r.value) patch = { ...patch, ...r.value, external: { ...patch.external, ...r.value.external } };
  });
  if (!active.length) console.info(`[sinks] ${event} for ${s.id}: no external sinks configured (saved locally only)`);
  return { patch, ran: active.map((k) => k.name) };
}
