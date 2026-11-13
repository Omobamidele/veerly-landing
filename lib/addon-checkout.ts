import {
  ADDON_MESSAGES,
  ADDON_PRODUCT,
  ADDON_SUCCESS_PAGE,
  checkAddonEligibility,
  ownedLevelText,
  ownedLevelsOf,
} from "./addon";
import { pricing, site } from "./config";
import { LEVEL_LABEL, parseLevel, parsePath, pathLabel } from "./levels";
import { initializeTransaction, newReference } from "./paystack";
import { addonChargeFor, isCurrency, toSubunit } from "./pricing";
import { findPaidByContact, markAddonPending, signupForCheckout } from "./waitlist";
import type { AddonOrder, OwnedLevel } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type AddonResult =
  | { status: 200; json: { ok: true; url: string } }
  | { status: number; json: { ok: false; code?: string; message: string; errors?: Record<string, string> } };

const fail = (
  status: number,
  message: string,
  errors?: Record<string, string>,
  code?: string,
): AddonResult => ({ status, json: { ok: false, message, errors, code } });

/**
 * Look a student up for the add-on page. Only paid students are returned, and only the levels they own,
 * so it can't be used to browse the waitlist. The caller rate-limits it.
 */
export async function lookupOwned(body: Record<string, unknown>) {
  const contact = String(body.contact ?? "").trim();
  if (!contact) return { found: false as const, error: ADDON_MESSAGES.contact };
  if (contact.includes("@") && !EMAIL_RE.test(contact.toLowerCase()))
    return { found: false as const, error: ADDON_MESSAGES.email };
  const s = await findPaidByContact(contact, String(body.whatsappCountry || "NG"));
  if (!s) return { found: false as const, error: null };
  return { found: true as const, owned: ownedLevelsOf(s) };
}

/**
 * Start a level add-on checkout (product type "level_addon").
 * Ownership comes from our paid record when we find one. If we don't, the student's own statement is used
 * and the order is marked unverified so it is checked by hand before any Notion link is sent.
 */
export async function startAddonCheckout(body: Record<string, unknown>): Promise<AddonResult> {
  const contact = String(body.contact ?? "").trim();
  if (!contact) return fail(422, ADDON_MESSAGES.contact, { contact: ADDON_MESSAGES.contact });

  const path = parsePath(body.path ?? body.careerPath);
  if (!path) return fail(422, ADDON_MESSAGES.no_path, { path: ADDON_MESSAGES.no_path });
  const level = parseLevel(body.level ?? body.addonLevel);
  if (!level) return fail(422, ADDON_MESSAGES.no_level, { level: ADDON_MESSAGES.no_level });

  const display = isCurrency(body.currency) ? body.currency : "NGN";
  const paid = await findPaidByContact(contact, String(body.whatsappCountry || "NG"));

  let owned: OwnedLevel[];
  let email: string;
  let verified: boolean;
  if (paid) {
    owned = ownedLevelsOf(paid);
    email = paid.email;
    verified = true;
  } else {
    // We can't match a payment. Take their word for the level they own, but flag the order.
    const statedLevel = parseLevel(body.ownedLevel);
    const statedPath = parsePath(body.ownedPath) ?? path;
    if (!statedLevel) return fail(422, ADDON_MESSAGES.no_owned, { ownedLevel: ADDON_MESSAGES.no_owned }, "no_owned");
    owned = [{ path: statedPath, level: statedLevel }];
    const typedEmail = (contact.includes("@") ? contact : String(body.email ?? "")).trim().toLowerCase();
    if (!EMAIL_RE.test(typedEmail))
      return fail(
        422,
        "Add an email address so we can send your receipt.",
        { email: "Add an email address so we can send your receipt." },
      );
    email = typedEmail;
    verified = false;
  }

  const eligible = checkAddonEligibility(owned, path, level);
  if (!eligible.ok)
    return fail(
      eligible.code === "already_owned" ? 409 : 422,
      eligible.message,
      { level: eligible.message },
      eligible.code,
    );

  const s = paid ?? (await signupForCheckout(email, String(body.name ?? "").trim().slice(0, 120), {}));
  const charge = addonChargeFor(display, pricing.usdEnabled);
  const amount = toSubunit(charge.amount);
  const reference = newReference(s.id).replace(/^vrly-/, "vrly-add-");
  const ownedText = ownedLevelText(owned, path);

  try {
    const tx = await initializeTransaction({
      email,
      amount,
      currency: charge.currency,
      reference,
      callbackUrl: `${site.url}${ADDON_SUCCESS_PAGE}`,
      metadata: {
        product: ADDON_PRODUCT,
        signupId: s.id,
        email,
        path,
        pathLabel: pathLabel(path),
        ownedLevel: ownedText,
        addonLevel: level,
        addonLevelLabel: LEVEL_LABEL[level],
        verified,
      },
    });
    const order: AddonOrder = {
      type: "level_addon",
      reference,
      path,
      ownedLevel: ownedText,
      addonLevel: level,
      amount,
      currency: charge.currency,
      status: "pending",
      verified,
      createdAt: new Date().toISOString(),
    };
    await markAddonPending(s.id, order);
    return { status: 200, json: { ok: true, url: tx.authorization_url } };
  } catch (err) {
    console.error("[addon-checkout]", err);
    return fail(502, "We couldn't start checkout. Please try again in a moment.");
  }
}
