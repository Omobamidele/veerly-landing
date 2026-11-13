"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { IconCheck, IconLock } from "@/components/icons/veerly-icons";
import {
  ADDON_MESSAGES,
  buyableLevels,
  checkAddonEligibility,
  ownedOnPath,
  ownsLevel,
  preselect,
} from "@/lib/addon";
import {
  LEVELS,
  LEVEL_LABEL,
  PATH_META,
  levelCardFor,
  pathLabel as labelOfPath,
  type CareerPath,
  type LevelId,
} from "@/lib/levels";
import { addonChargeFor, formatPrice } from "@/lib/pricing";
import type { OwnedLevel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CurrencySelect, useCurrency } from "./Currency";
import { rememberOwned, useOwnedLevels } from "./OwnedLevels";

type Lookup =
  | { state: "idle" }
  | { state: "busy" }
  | { state: "found"; owned: OwnedLevel[] }
  | { state: "missing"; message: string | null };

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok && json.ok !== false, status: res.status, json };
}

const list = (levels: LevelId[]) => levels.map((l) => LEVEL_LABEL[l]).join(" and ");

export default function AddLevelFlow({
  initialPath,
  initialLevel,
  openNotice,
}: {
  /** From the deep link (?path=va&level=intermediate). */
  initialPath: CareerPath | null;
  initialLevel: LevelId | null;
  /** Shown when enrolment (and so payment) has not opened yet. */
  openNotice: string | null;
}) {
  const uid = useId();
  const { currency, levelChange, levelChangeNote, usdEnabled } = useCurrency();
  const remembered = useOwnedLevels();

  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [lookup, setLookup] = useState<Lookup>({ state: "idle" });
  const [path, setPath] = useState<CareerPath | null>(initialPath);
  const [level, setLevel] = useState<LevelId | null>(initialLevel);
  const [statedLevel, setStatedLevel] = useState<LevelId | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState<LevelId | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // What we know they own: our record if we found one, else what they said, else this browser's memory.
  const owned: OwnedLevel[] = useMemo(() => {
    if (lookup.state === "found") return lookup.owned;
    const out = [...remembered];
    if (lookup.state === "missing" && path && statedLevel && !ownsLevel(out, path, statedLevel))
      out.push({ path, level: statedLevel });
    return out;
  }, [lookup, remembered, path, statedLevel]);

  // A deep link to a level the student already owns is not selected; we say why instead.
  useEffect(() => {
    if (!level || !path) return;
    const p = preselect({ path, level }, owned);
    if (p.blocked) {
      setLevel(null);
      setBlocked(p.blocked);
    }
  }, [owned, level, path]);

  const ownedHere = ownedOnPath(owned, path);
  const open = buyableLevels(owned, path);
  const charge = addonChargeFor(currency, usdEnabled);
  const chargeText = formatPrice(charge.currency, charge.amount);
  const chargeDiffers = !(
    (currency === "NGN" && charge.currency === "NGN") ||
    (currency === "USD" && charge.currency === "USD")
  );

  async function findPayment(): Promise<Lookup> {
    const c = contact.trim();
    if (!c) {
      setErrors({ contact: ADDON_MESSAGES.contact });
      return { state: "idle" };
    }
    setLookup({ state: "busy" });
    try {
      const r = await post("/api/addon/lookup", { contact: c });
      if (r.status === 429) {
        setLookup({ state: "idle" });
        setMessage(r.json.message || "Too many tries. Please wait a minute and try again.");
        return { state: "idle" };
      }
      if (r.json.found) {
        const next: Lookup = { state: "found", owned: r.json.owned as OwnedLevel[] };
        setLookup(next);
        setErrors((e) => ({ ...e, contact: "", ownedLevel: "" }));
        rememberOwned(next.owned);
        return next;
      }
      const next: Lookup = { state: "missing", message: r.json.message ?? null };
      setLookup(next);
      if (r.json.message) setErrors((e) => ({ ...e, contact: r.json.message }));
      else setErrors((e) => ({ ...e, contact: "" }));
      return next;
    } catch {
      setLookup({ state: "idle" });
      setMessage("We couldn't reach the server. Check your connection and try again.");
      return { state: "idle" };
    }
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setMessage("");
    const e: Record<string, string> = {};
    if (!contact.trim()) e.contact = ADDON_MESSAGES.contact;
    if (!path) e.path = ADDON_MESSAGES.no_path;
    else if (!level) e.level = ADDON_MESSAGES.no_level;
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    let now: Lookup = lookup;
    if (now.state === "idle") now = await findPayment();
    if (now.state === "busy" || now.state === "idle") return;
    let known = owned;
    if (now.state === "found") known = now.owned;
    if (now.state === "missing") {
      const bad = now.message && /doesn't look right/.test(now.message);
      if (bad) return;
      if (!statedLevel) {
        setErrors({
          contact: ADDON_MESSAGES.not_found,
          ownedLevel: ADDON_MESSAGES.no_owned,
        });
        return;
      }
      if (!contact.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
        setErrors({ email: "Add an email address so we can send your receipt." });
        return;
      }
      known = [...known, { path: path!, level: statedLevel }];
    }
    const check = checkAddonEligibility(known, path, level);
    if (!check.ok) {
      setErrors({ level: check.message });
      if (check.code === "already_owned") setLevel(null);
      return;
    }
    setErrors({});
    setConfirming(true);
  }

  async function pay() {
    setConfirming(false);
    setBusy(true);
    setMessage("");
    try {
      const r = await post("/api/addon/checkout", {
        contact: contact.trim(),
        email: email.trim(),
        path,
        level,
        currency,
        ownedLevel: statedLevel || undefined,
        ownedPath: path,
      });
      if (r.ok && r.json.url) {
        window.location.assign(r.json.url);
        return;
      }
      setErrors(r.json.errors || {});
      setMessage(r.json.message || "We couldn't start checkout. Please try again.");
    } catch {
      setMessage("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const pLabel = path ? labelOfPath(path) : null;
  const lvLabel = level ? LEVEL_LABEL[level] : null;

  return (
    <form
      onSubmit={submit}
      noValidate
      data-add-level
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14"
    >
      <div className="flex min-w-0 flex-col gap-9">
        {openNotice ? (
          <p
            className="rounded-lg border border-line bg-tint px-4 py-3 text-[15px] leading-snug text-ink"
            data-addon-closed
          >
            {openNotice}
          </p>
        ) : null}

        <section className="flex flex-col gap-4" aria-labelledby={`${uid}-who`}>
          <h2 id={`${uid}-who`} className="display text-[22px] leading-tight text-ink">
            1. Who paid
          </h2>
          <Field data-invalid={errors.contact ? true : undefined}>
            <FieldLabel htmlFor={`${uid}-contact`}>
              Email or WhatsApp number you used at checkout
            </FieldLabel>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id={`${uid}-contact`}
                value={contact}
                autoComplete="email"
                inputMode="email"
                aria-invalid={errors.contact ? true : undefined}
                aria-describedby={errors.contact ? `${uid}-contact-error` : undefined}
                onChange={(e) => {
                  setContact(e.target.value);
                  if (lookup.state !== "idle") setLookup({ state: "idle" });
                }}
                className="h-11 sm:flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={lookup.state === "busy"}
                onClick={() => void findPayment()}
              >
                {lookup.state === "busy" ? <Spinner data-icon="inline-start" /> : null}
                Find my payment
              </Button>
            </div>
            {errors.contact ? (
              <FieldError id={`${uid}-contact-error`}>{errors.contact}</FieldError>
            ) : null}
          </Field>

          {lookup.state === "found" ? (
            <p
              className="flex items-start gap-2.5 text-[15px] leading-snug text-ink"
              data-lookup="found"
            >
              <IconCheck
                className="icon-first-line size-4 shrink-0 text-brand"
                strokeWidth={2.5}
                aria-hidden="true"
              />
              <span className="min-w-0">
                We found your payment. You already have{" "}
                {lookup.owned.length
                  ? lookup.owned
                      .map((o) => `${labelOfPath(o.path)} ${LEVEL_LABEL[o.level]}`)
                      .join(", ")
                  : "a paid level"}
                .
              </span>
            </p>
          ) : null}

          {lookup.state === "missing" && !errors.contact ? (
            <p className="text-[15px] leading-snug text-ink-2" data-lookup="missing">
              {ADDON_MESSAGES.not_found}
            </p>
          ) : null}

          {lookup.state === "missing" ? (
            <div className="flex flex-col gap-4 rounded-lg border border-line bg-ground p-4" data-stated-owned>
              <Field data-invalid={errors.ownedLevel ? true : undefined}>
                <FieldLabel htmlFor={`${uid}-owned`}>
                  The level you already have{pLabel ? ` for ${pLabel}` : ""}
                </FieldLabel>
                <NativeSelect
                  id={`${uid}-owned`}
                  className="w-full"
                  value={statedLevel}
                  onChange={(e) => setStatedLevel(e.target.value as LevelId | "")}
                  aria-invalid={errors.ownedLevel ? true : undefined}
                >
                  <NativeSelectOption value="">Choose the level you have</NativeSelectOption>
                  {LEVELS.map((l) => (
                    <NativeSelectOption key={l} value={l}>
                      {LEVEL_LABEL[l]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {errors.ownedLevel ? <FieldError>{errors.ownedLevel}</FieldError> : null}
              </Field>
              {!contact.includes("@") ? (
                <Field data-invalid={errors.email ? true : undefined}>
                  <FieldLabel htmlFor={`${uid}-email`}>Email for your receipt</FieldLabel>
                  <Input
                    id={`${uid}-email`}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={errors.email ? true : undefined}
                    className="h-11"
                  />
                  {errors.email ? <FieldError>{errors.email}</FieldError> : null}
                </Field>
              ) : null}
              <FieldDescription>
                We check this against our payment records before we send any link.
              </FieldDescription>
            </div>
          ) : null}
        </section>

        <section className="flex flex-col gap-4" aria-labelledby={`${uid}-pick`}>
          <h2 id={`${uid}-pick`} className="display text-[22px] leading-tight text-ink">
            2. Pick the level you want to add
          </h2>
          <Field data-invalid={errors.path ? true : undefined}>
            <FieldLabel htmlFor={`${uid}-path`}>Your career path</FieldLabel>
            <NativeSelect
              id={`${uid}-path`}
              className="w-full"
              value={path ?? ""}
              aria-invalid={errors.path ? true : undefined}
              onChange={(e) => {
                const p = (e.target.value || null) as CareerPath | null;
                setPath(p);
                setLevel(null);
                setBlocked(null);
                setErrors((x) => ({ ...x, path: "", level: "" }));
              }}
            >
              <NativeSelectOption value="">Choose a path</NativeSelectOption>
              {PATH_META.map((p) => (
                <NativeSelectOption key={p.id} value={p.id}>
                  {p.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {errors.path ? <FieldError>{errors.path}</FieldError> : null}
          </Field>

          {path && ownedHere.length ? (
            <p className="text-[15px] leading-snug text-ink-2" data-owned-here>
              You already have {list(ownedHere)} for {pLabel}.
            </p>
          ) : null}
          {blocked ? (
            <p
              role="status"
              className="rounded-lg border border-line bg-tint px-4 py-3 text-[15px] leading-snug text-ink"
              data-blocked
            >
              The link you opened is for the {LEVEL_LABEL[blocked]} level, which you already have.
              Choose a level you don&rsquo;t have yet.
            </p>
          ) : null}

          <fieldset className="flex flex-col gap-2.5" aria-describedby={errors.level ? `${uid}-level-error` : undefined}>
            <legend className="mb-2 text-sm font-medium text-ink">Level</legend>
            {LEVELS.map((l) => {
              const have = path ? ownsLevel(owned, path, l) : false;
              const card = path ? levelCardFor(path, l) : null;
              const selected = level === l;
              return (
                <label
                  key={l}
                  data-level-option={l}
                  data-owned={have ? "" : undefined}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border bg-white p-4 transition-colors",
                    have
                      ? "cursor-not-allowed border-line bg-ground text-ink-3"
                      : "cursor-pointer border-input hover:border-ink-3",
                    selected && "border-brand bg-tint ring-1 ring-brand",
                  )}
                >
                  <input
                    type="radio"
                    name="addon-level"
                    value={l}
                    checked={selected}
                    disabled={have || !path}
                    onChange={() => {
                      setLevel(l);
                      setBlocked(null);
                      setErrors((x) => ({ ...x, level: "" }));
                    }}
                    className="mt-1 size-4 shrink-0 accent-[#0075AD]"
                  />
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className={cn("font-semibold", have ? "text-ink-3" : "text-ink")}>
                        {LEVEL_LABEL[l]}
                      </span>
                      {have ? (
                        <span className="text-[13px] font-medium text-ink-2">
                          You already have this level
                        </span>
                      ) : null}
                    </span>
                    <span className="text-[14px] leading-snug text-ink-2">
                      {card ? card.who : "Choose a career path to see who this level is for."}
                    </span>
                  </span>
                </label>
              );
            })}
            {errors.level ? (
              <FieldError id={`${uid}-level-error`}>{errors.level}</FieldError>
            ) : null}
            {path && !open.length ? (
              <p className="text-[15px] text-ink-2">
                You already have every level for {pLabel}. Choose another career path to add one there.
              </p>
            ) : null}
          </fieldset>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Your order">
        <div
          ref={summaryRef}
          className="flex flex-col gap-5 rounded-xl border border-line bg-white p-5 sm:p-6"
          data-addon-summary
        >
          <div className="flex flex-col gap-1">
            <p className="text-sm text-ink-3">You&rsquo;re adding</p>
            <p className="display text-[22px] leading-tight text-ink">
              {pLabel && lvLabel ? `${lvLabel} for ${pLabel}` : "Choose a path and level"}
            </p>
          </div>
          <div className="flex flex-col gap-2 border-t border-line pt-4">
            <p className="text-sm text-ink-3">Additional fee, one-time for this level</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2" data-addon-price-row>
              <p className="tnum text-[26px] leading-tight font-semibold text-ink" data-addon-price>
                {levelChange.main}
              </p>
              <CurrencySelect
                amounts="level-fee"
                label="Show the fee in my currency"
                className="h-10 px-3 text-[13px]"
              />
            </div>
            {levelChangeNote ? (
              <p className="text-[13px] leading-snug text-ink-3" data-addon-rate-note>
                {levelChangeNote}
              </p>
            ) : null}
            {chargeDiffers ? (
              <p className="text-[13px] leading-snug text-ink-3" data-addon-charge-note>
                {charge.currency === "USD"
                  ? `You'll pay ${chargeText} at checkout. Your bank converts it to your currency.`
                  : `At checkout you'll pay ${chargeText} in naira, because dollar payments aren't switched on yet.`}
              </p>
            ) : null}
          </div>
          <Button type="submit" size="lg" disabled={busy} className="w-full">
            {busy ? <Spinner data-icon="inline-start" /> : <IconLock data-icon="inline-start" />}
            {busy ? "Opening secure checkout…" : "Continue"}
          </Button>
          <div role="alert" aria-live="assertive" className="empty:hidden">
            {message ? (
              <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive" data-addon-error>
                {message}
              </p>
            ) : null}
          </div>
          <p className="text-[13px] leading-snug text-ink-3">
            You keep the level you already have. Secure checkout by Paystack.
          </p>
        </div>
      </aside>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent data-addon-confirm>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Add {lvLabel ? `${lvLabel} level` : "this level"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You&rsquo;re adding{" "}
              <strong className="font-semibold text-ink">{lvLabel}</strong>
              {pLabel ? ` for ${pLabel}` : ""} for{" "}
              <strong className="tnum font-semibold text-ink">
                {levelChange.main}
                {levelChange.approx ? ` (about ${levelChange.approx})` : ""}
              </strong>
              . This is an additional fee, and you keep the level you already
              have.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2" data-addon-confirm-currency>
            <span className="tnum text-[20px] font-semibold text-ink">{levelChange.main}</span>
            <CurrencySelect
              amounts="level-fee"
              label="Show the fee in my currency"
              className="h-10 px-3 text-[13px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={pay}>Yes, continue to payment</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}

export function AddLevelMore() {
  return (
    <p className="text-[15px] text-ink-2">
      Not sure which level is right for you?{" "}
      <Link
        href="/#levels"
        className="font-medium text-brand underline underline-offset-4 hover:text-brand-press"
      >
        See what each level covers
      </Link>
      .
    </p>
  );
}
