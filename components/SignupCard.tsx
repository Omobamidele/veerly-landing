"use client";

import { ArrowRight, CalendarPlus, Check, Lock } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { consentText } from "@/lib/consent";
import { careerPaths, careerStages } from "@/lib/options";
import { countryOptions, toE164 } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { useLaunch } from "./LaunchProvider";

type Errors = Record<string, string>;
type Step = "join" | "profile" | "done";
type Saved = {
  id: string;
  token: string;
  email: boolean;
  whatsapp: boolean;
  firstName: string;
  duplicate: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok && json.ok !== false, status: res.status, json };
}

function Alert({ msg }: { msg: string }) {
  return (
    <div role="alert" aria-live="assertive" className="empty:hidden">
      {msg ? (
        <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {msg}
        </p>
      ) : null}
    </div>
  );
}

export default function SignupCard(props: {
  paymentsEnabled: boolean;
  currencies: ("NGN" | "USD")[];
  whatsappChannelUrl?: string;
}) {
  const { launched } = useLaunch();
  const [mode, setMode] = useState<"auto" | "waitlist">("auto");
  const showCheckout = launched && mode === "auto";
  return (
    <div
      id="join-card"
      className="relative rounded-2xl border border-line bg-white p-6 shadow-[0_1px_2px_rgb(13_27_38/0.04),0_24px_48px_-32px_rgb(13_27_38/0.25)] sm:p-8"
    >
      {showCheckout ? (
        <CheckoutPanel {...props} onWaitlist={() => setMode("waitlist")} />
      ) : (
        <WaitlistFlow whatsappChannelUrl={props.whatsappChannelUrl} />
      )}
    </div>
  );
}

function CardHead({
  title,
  sub,
  headingRef,
  as = "h2",
}: {
  title: string;
  sub?: React.ReactNode;
  headingRef?: React.Ref<HTMLHeadingElement>;
  as?: "h2" | "h3";
}) {
  const H = as;
  return (
    <div className="flex flex-col gap-1.5">
      <H
        ref={headingRef}
        tabIndex={headingRef ? -1 : undefined}
        className={cn(
          "font-display font-bold tracking-[-0.02em] text-ink outline-none",
          as === "h2" ? "text-2xl" : "text-lg",
        )}
        data-card-title
      >
        {title}
      </H>
      {sub ? <p className="text-sm text-ink-2">{sub}</p> : null}
    </div>
  );
}

/* ---------------- Waitlist: step 1 → step 2 → done ---------------- */
function WaitlistFlow({ whatsappChannelUrl }: { whatsappChannelUrl?: string }) {
  const { shortLabel, launched } = useLaunch();
  const countries = useMemo(() => countryOptions(), []);
  const [step, setStep] = useState<Step>("join");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState<Saved | null>(null);
  const [dial, setDial] = useState("NG");
  const headingRef = useRef<HTMLHeadingElement>(null);

  const aria = (k: string) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${k}-error` : undefined,
  });
  const err = (k: string) =>
    errors[k] ? <FieldError id={`${k}-error`}>{errors[k]}</FieldError> : null;
  const focusHeading = () =>
    requestAnimationFrame(() => headingRef.current?.focus());

  async function submitJoin(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const v = Object.fromEntries(new FormData(form).entries()) as Record<
      string,
      string
    >;
    const e: Errors = {};
    if ((v.name || "").trim().length < 2) e.name = "Please enter your name.";
    if (!EMAIL_RE.test((v.email || "").trim()))
      e.email = "Please enter a valid email address.";
    const wantsWa = v.whatsappConsent === "on";
    if (v.whatsapp?.trim()) {
      if (!toE164(v.whatsapp, dial))
        e.whatsapp = "That number doesn't look right for the selected country.";
    } else if (wantsWa)
      e.whatsapp = "Add your WhatsApp number so we can notify you there.";
    if (v.emailConsent !== "on" && !wantsWa)
      e.consent =
        "Choose at least one way for us to tell you about the launch.";
    setErrors(e);
    if (Object.keys(e).length) {
      setMessage("");
      const first = Object.keys(e)[0];
      const target =
        first === "consent"
          ? form.querySelector<HTMLElement>("#emailConsent")
          : (form.elements.namedItem(first) as HTMLElement | null);
      target?.focus();
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const r = await post("/api/waitlist", { ...v, whatsappCountry: dial });
      if (!r.ok) {
        setErrors(r.json.errors || {});
        setMessage(r.json.message || "Something went wrong. Please try again.");
        return;
      }
      setSaved({
        id: r.json.id,
        token: r.json.token,
        email: Boolean(r.json.email),
        whatsapp: Boolean(r.json.whatsapp),
        firstName: (v.name || "").trim().split(" ")[0],
        duplicate: Boolean(r.json.duplicate),
      });
      setStep("profile");
      focusHeading();
    } catch {
      setMessage(
        "We couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitProfile(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!saved) return;
    const v = Object.fromEntries(new FormData(ev.currentTarget).entries());
    setBusy(true);
    setMessage("");
    try {
      const r = await post("/api/waitlist/profile", {
        ...v,
        id: saved.id,
        token: saved.token,
      });
      if (!r.ok) {
        setErrors(r.json.errors || {});
        setMessage(
          r.json.message || "We couldn't save that. Your spot is still saved.",
        );
        if (r.status !== 422) {
          setStep("done");
          focusHeading();
        }
        return;
      }
      setStep("done");
      focusHeading();
    } catch {
      setMessage("We couldn't reach the server. Your spot is still saved.");
    } finally {
      setBusy(false);
    }
  }

  const channels =
    saved && saved.whatsapp && saved.email
      ? "on WhatsApp and email"
      : saved?.whatsapp
        ? "on WhatsApp"
        : "by email";
  const when = launched
    ? "with your next steps"
    : `when doors open on ${shortLabel}`;

  if (step === "join") {
    return (
      <form
        onSubmit={submitJoin}
        noValidate
        className="flex flex-col gap-6"
        data-step="join"
      >
        <CardHead
          title="Join the waitlist"
          sub="Free. Takes under a minute. We'll tell you the moment founding enrolment opens."
        />
        <FieldGroup className="gap-4">
          <Field data-invalid={errors.name ? true : undefined}>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              required
              {...aria("name")}
            />
            {err("name")}
          </Field>
          <Field data-invalid={errors.email ? true : undefined}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              {...aria("email")}
            />
            {err("email")}
          </Field>
          <Field data-invalid={errors.whatsapp ? true : undefined}>
            <FieldLabel htmlFor="whatsapp">
              WhatsApp number{" "}
              <span className="font-normal text-ink-3">
                for the launch alert
              </span>
            </FieldLabel>
            <div className="flex gap-2">
              <label htmlFor="whatsappCountry" className="sr-only">
                Country code
              </label>
              <NativeSelect
                id="whatsappCountry"
                value={dial}
                onChange={(e) => setDial(e.target.value)}
                className="w-[112px] shrink-0"
              >
                {countries.map((c) => (
                  <NativeSelectOption key={c.code} value={c.code}>
                    {c.code} {c.dial}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder={dial === "NG" ? "803 123 4567" : "Phone number"}
                {...aria("whatsapp")}
              />
            </div>
            {err("whatsapp")}
          </Field>
        </FieldGroup>

        <FieldSet
          className="gap-3"
          data-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? "consent-error" : undefined}
        >
          <FieldLegend variant="label" className="mb-0 text-ink">
            How should we tell you?
          </FieldLegend>
          <Field orientation="horizontal" className="items-start gap-3">
            <Checkbox
              id="emailConsent"
              name="emailConsent"
              className="mt-0.5 size-[18px] bg-white"
            />
            <FieldLabel
              htmlFor="emailConsent"
              className="font-normal leading-snug text-ink-2"
            >
              {consentText.email}
            </FieldLabel>
          </Field>
          <Field orientation="horizontal" className="items-start gap-3">
            <Checkbox
              id="whatsappConsent"
              name="whatsappConsent"
              className="mt-0.5 size-[18px] bg-white"
            />
            <FieldLabel
              htmlFor="whatsappConsent"
              className="font-normal leading-snug text-ink-2"
            >
              {consentText.whatsapp}
            </FieldLabel>
          </Field>
          {err("consent")}
        </FieldSet>

        <div
          className="absolute -left-[9999px] h-px w-px overflow-hidden"
          aria-hidden="true"
        >
          <label htmlFor="company">Company</label>
          <input id="company" name="company" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex flex-col gap-3">
          <Button type="submit" size="lg" disabled={busy} className="w-full">
            {busy ? <Spinner data-icon="inline-start" /> : null}
            {busy ? "Saving your spot…" : "Join the waitlist"}
          </Button>
          <p className="text-center text-[13px] text-ink-3">
            No payment now. Read our{" "}
            <a href="/privacy" className="text-ink-2 underline hover:text-ink">
              privacy notice
            </a>
            .
          </p>
        </div>
        <Alert msg={message} />
      </form>
    );
  }

  const successHead = (
    <div className="flex items-start gap-3">
      <span
        className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-proof text-white"
        aria-hidden="true"
      >
        <Check className="size-4" strokeWidth={2.5} />
      </span>
      <CardHead
        headingRef={headingRef}
        title={
          saved?.duplicate
            ? "You're already on the list."
            : "You're on the list."
        }
        sub={`We'll message you ${channels} ${when}.`}
      />
    </div>
  );

  const calendar = (
    <Button asChild variant="outline" size="lg" className="w-full">
      <a href="/api/calendar/launch.ics">
        <CalendarPlus data-icon="inline-start" />
        Add the launch to your calendar
      </a>
    </Button>
  );

  if (step === "profile") {
    return (
      <form
        onSubmit={submitProfile}
        noValidate
        className="flex flex-col gap-6"
        data-step="profile"
      >
        {successHead}
        {calendar}
        <Separator />
        <CardHead
          as="h3"
          title="Personalize your plan"
          sub="Optional, about a minute. It helps us shape your plan and the first career paths."
        />
        <FieldGroup className="gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="country">Country</FieldLabel>
              <NativeSelect
                id="country"
                name="country"
                defaultValue=""
                className="w-full"
              >
                <NativeSelectOption value="">Choose</NativeSelectOption>
                {countries.map((c) => (
                  <NativeSelectOption key={c.code}>{c.name}</NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field data-invalid={errors.careerStage ? true : undefined}>
              <FieldLabel htmlFor="careerStage">Career stage</FieldLabel>
              <Select name="careerStage">
                <SelectTrigger
                  id="careerStage"
                  className="w-full"
                  {...aria("careerStage")}
                >
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    {careerStages.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="profession">
              Current profession or career interest
            </FieldLabel>
            <Input
              id="profession"
              name="profession"
              placeholder="e.g. Customer support"
            />
          </Field>
          <Field data-invalid={errors.careerPath ? true : undefined}>
            <FieldLabel htmlFor="careerPath">
              Preferred remote career path
            </FieldLabel>
            <Select name="careerPath">
              <SelectTrigger
                id="careerPath"
                className="w-full"
                {...aria("careerPath")}
              >
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  {careerPaths.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                  <SelectItem value="Not sure yet">Not sure yet</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field data-invalid={errors.linkedin ? true : undefined}>
            <FieldLabel htmlFor="linkedin">
              LinkedIn <span className="font-normal text-ink-3">optional</span>
            </FieldLabel>
            <Input
              id="linkedin"
              name="linkedin"
              type="url"
              inputMode="url"
              placeholder="linkedin.com/in/your-name"
              {...aria("linkedin")}
            />
            {err("linkedin")}
          </Field>
        </FieldGroup>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? <Spinner data-icon="inline-start" /> : null}
            {busy ? "Saving…" : "Save my answers"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => {
              setStep("done");
              focusHeading();
            }}
          >
            Skip for now
          </Button>
        </div>
        <Alert msg={message} />
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-6" role="status" data-step="done">
      {successHead}
      <p className="text-[15px] text-ink-2">
        Thanks{saved?.firstName ? `, ${saved.firstName}` : ""}. That&rsquo;s
        everything for now. Keep an eye on{" "}
        {saved?.whatsapp ? "WhatsApp" : "your inbox"} on {shortLabel}.
      </p>
      {calendar}
      {whatsappChannelUrl ? (
        <a
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand"
          href={whatsappChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Join the Veerly WhatsApp channel{" "}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </a>
      ) : null}
      <Alert msg={message} />
    </div>
  );
}

/* ---------------- Checkout (launched) ---------------- */
function CheckoutPanel({
  paymentsEnabled,
  currencies,
  onWaitlist,
}: {
  paymentsEnabled: boolean;
  currencies: ("NGN" | "USD")[];
  onWaitlist: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const amountLabel = currency === "USD" ? "$7.99" : "₦10,000";

  async function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const v = Object.fromEntries(
      new FormData(ev.currentTarget).entries(),
    ) as Record<string, string>;
    if (!EMAIL_RE.test((v.email || "").trim())) {
      setErrors({ email: "Enter the email you'd like your access sent to." });
      return;
    }
    setErrors({});
    setBusy(true);
    setMessage("");
    try {
      const r = await post("/api/checkout", { ...v, currency });
      if (r.ok && r.json.url) {
        window.location.assign(r.json.url);
        return;
      }
      setErrors(r.json.errors || {});
      setMessage(
        r.json.message || "We couldn't start checkout. Please try again.",
      );
    } catch {
      setMessage(
        "We couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-6"
      data-step="checkout"
    >
      <CardHead
        title="Get founding access"
        sub="$7.99 (≈ ₦10,000), one-time. Everything included."
      />
      {paymentsEnabled ? (
        <>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="co-name">Full name</FieldLabel>
              <Input id="co-name" name="name" autoComplete="name" />
            </Field>
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="co-email">Email</FieldLabel>
              <Input
                id="co-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "co-email-error" : undefined}
              />
              {errors.email ? (
                <FieldError id="co-email-error">{errors.email}</FieldError>
              ) : null}
            </Field>
            {currencies.length > 1 && (
              <FieldSet className="gap-2">
                <FieldLegend variant="label" className="mb-0">
                  Currency
                </FieldLegend>
                <div className="grid grid-cols-2 gap-2">
                  {currencies.map((c) => (
                    <label
                      key={c}
                      className={cn(
                        "flex h-11 cursor-pointer items-center justify-center rounded-lg border text-sm font-medium transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                        currency === c
                          ? "border-brand bg-tint text-ink"
                          : "border-input bg-white text-ink-2 hover:border-[#c5ced5]",
                      )}
                    >
                      <input
                        type="radio"
                        name="currency-choice"
                        value={c}
                        checked={currency === c}
                        onChange={() => setCurrency(c)}
                        className="sr-only"
                      />
                      {c === "NGN" ? "Pay in naira" : "Pay in USD"}
                    </label>
                  ))}
                </div>
              </FieldSet>
            )}
          </FieldGroup>
          <div className="flex flex-col gap-3">
            <Button type="submit" size="lg" disabled={busy} className="w-full">
              {busy ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Lock data-icon="inline-start" />
              )}
              {busy
                ? "Opening secure checkout…"
                : `Pay ${amountLabel} securely`}
            </Button>
            <FieldDescription className="text-center text-[13px]">
              Secure checkout by Paystack. You&rsquo;ll come back here to start
              onboarding.
            </FieldDescription>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            size="lg"
            disabled
            className="w-full"
            aria-describedby="closed-note"
          >
            <Lock data-icon="inline-start" /> Payments open at launch
          </Button>
          <p className="text-center text-[13px] text-ink-3" id="closed-note">
            Checkout isn&rsquo;t switched on yet. Join the list and we&rsquo;ll
            tell you the moment it is.
          </p>
        </div>
      )}
      <button
        type="button"
        className="self-center text-sm font-medium text-brand underline-offset-4 hover:underline"
        onClick={onWaitlist}
      >
        Not ready yet? Join the waitlist instead
      </button>
      <Alert msg={message} />
    </form>
  );
}
