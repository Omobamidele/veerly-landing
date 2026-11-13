"use client";

import { useRef, useState } from "react";
import { careerPaths, careerStages } from "@/lib/site";

type Errors = Record<string, string>;
type Status = "idle" | "submitting" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clientValidate(f: FormData): Errors {
  const e: Errors = {};
  const name = String(f.get("name") || "").trim();
  const email = String(f.get("email") || "").trim();
  const linkedin = String(f.get("linkedin") || "").trim();
  if (name.length < 2) e.name = "Please tell us your name.";
  if (!email) e.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(email)) e.email = "Please enter a valid email address.";
  if (linkedin && !/linkedin\.com/i.test(linkedin)) e.linkedin = "That doesn't look like a LinkedIn profile link.";
  return e;
}

export default function WaitlistForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [duplicate, setDuplicate] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const fd = new FormData(form);
    const errs = clientValidate(fd);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setStatus("error");
      setMessage("Please check the highlighted fields.");
      const first = Object.keys(errs)[0];
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setErrors(json.errors || {});
        setStatus("error");
        setMessage(json.message || "Something went wrong. Please try again.");
        return;
      }
      setFirstName(String(fd.get("name") || "").trim().split(" ")[0]);
      setDuplicate(Boolean(json.duplicate));
      setStatus("success");
      requestAnimationFrame(() => statusRef.current?.focus());
    } catch {
      setStatus("error");
      setMessage("We couldn't reach the server. Check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="form-success" ref={statusRef} tabIndex={-1} role="status" aria-live="polite">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/dot.svg" alt="" width={96} height={96} className="success-dot" />
        <h3>{duplicate ? "You're already on the list" : `You're on the list${firstName ? `, ${firstName}` : ""}.`}</h3>
        <p>
          {duplicate
            ? "We've updated your details. You'll hear from us when founding enrolment opens."
            : "Thanks for joining the Veerly waitlist. We'll email you when founding enrolment opens and share the cohort details first."}
        </p>
        <p className="success-meta">
          <span className="verified-dot" aria-hidden="true" /> Saved. Planned first cohort: January 2027.
        </p>
      </div>
    );
  }

  const err = (k: string) =>
    errors[k] ? (
      <p className="field-error" id={`${k}-error`}>
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: string, hint?: string) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": [errors[k] ? `${k}-error` : "", hint || ""].filter(Boolean).join(" ") || undefined,
  });

  return (
    <form ref={formRef} className="waitlist-form" onSubmit={onSubmit} noValidate aria-describedby="form-note">
      <div className="field">
        <label htmlFor="name">
          Name <span className="req">(required)</span>
        </label>
        <input id="name" name="name" type="text" autoComplete="name" required {...aria("name")} />
        {err("name")}
      </div>
      <div className="field">
        <label htmlFor="email">
          Email <span className="req">(required)</span>
        </label>
        <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required {...aria("email")} />
        {err("email")}
      </div>
      <div className="field">
        <label htmlFor="country">Country</label>
        <input id="country" name="country" type="text" autoComplete="country-name" {...aria("country")} />
        {err("country")}
      </div>
      <div className="field">
        <label htmlFor="profession">Current profession or career interest</label>
        <input id="profession" name="profession" type="text" placeholder="e.g. Customer support" {...aria("profession")} />
        {err("profession")}
      </div>
      <div className="field">
        <label htmlFor="careerStage">Current career stage</label>
        <select id="careerStage" name="careerStage" defaultValue="" {...aria("careerStage")}>
          <option value="">Choose one</option>
          {careerStages.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {err("careerStage")}
      </div>
      <div className="field">
        <label htmlFor="careerPath">Preferred remote career path</label>
        <select id="careerPath" name="careerPath" defaultValue="" {...aria("careerPath")}>
          <option value="">Choose one</option>
          {careerPaths.map((p) => (
            <option key={p}>{p}</option>
          ))}
          <option>Not sure yet</option>
        </select>
        {err("careerPath")}
      </div>
      <div className="field field-wide">
        <label htmlFor="linkedin">
          LinkedIn profile <span className="opt">(optional)</span>
        </label>
        <input id="linkedin" name="linkedin" type="url" inputMode="url" placeholder="linkedin.com/in/your-name" {...aria("linkedin")} />
        {err("linkedin")}
      </div>
      <div className="hp" aria-hidden="true">
        <label htmlFor="company_website">Leave this empty</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form-foot field-wide">
        <button className="btn btn-primary btn-lg" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Saving your spot…" : "Join the waitlist"}
        </button>
        <p id="form-note" className="form-note">
          No payment now. We'll only use your details to contact you about Veerly.
        </p>
      </div>
      <div className="form-status field-wide" role="alert" aria-live="assertive">
        {status === "error" && message ? <p className="form-error">{message}</p> : null}
      </div>
    </form>
  );
}
