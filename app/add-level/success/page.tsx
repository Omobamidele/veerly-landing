import type { Metadata } from "next";
import Link from "next/link";
import { IconCheck, IconClock } from "@/components/icons/veerly-icons";
import RememberOwned from "@/components/OwnedLevels";
import { Footer, Nav } from "@/components/SiteChrome";
import { ADDON_PAGE, addonLink } from "@/lib/addon";
import { paymentsEnabled } from "@/lib/config";
import { LEVEL_LABEL, parseLevel, parsePath, pathLabel, type CareerPath, type LevelId } from "@/lib/levels";
import { processSuccessfulCharge } from "@/lib/payments";
import { parseMetadata, verifyTransaction } from "@/lib/paystack";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your extra level",
  robots: { index: false, follow: false },
};

type State = "paid" | "pending" | "failed" | "none";
type Resolved = { state: State; level: LevelId | null; path: CareerPath | null };

const WHATSAPP_CHAT_URL = process.env.NEXT_PUBLIC_WHATSAPP_CHAT_URL;

async function resolveState(
  reference?: string,
  preview?: string,
  previewLevel?: string,
  previewPath?: string,
): Promise<Resolved> {
  if (preview === "paid")
    return { state: "paid", level: parseLevel(previewLevel), path: parsePath(previewPath) };
  if (!reference || !paymentsEnabled()) return { state: "none", level: null, path: null };
  try {
    const tx = await verifyTransaction(reference); // never trust the redirect alone
    const meta = parseMetadata(tx.metadata);
    const level = parseLevel(meta.addonLevel);
    const path = parsePath(meta.path ?? meta.careerPath);
    if (meta.product !== "level_addon") return { state: "none", level: null, path: null };
    if (tx.status === "success") {
      const r = await processSuccessfulCharge(tx); // idempotent with the webhook
      return { state: r.ok ? "paid" : "failed", level, path };
    }
    return {
      state:
        tx.status === "abandoned" || tx.status === "ongoing" || tx.status === "pending"
          ? "pending"
          : "failed",
      level,
      path,
    };
  } catch (err) {
    console.error("[add-level success] verify failed", err);
    return { state: "pending", level: null, path: null };
  }
}

export default async function AddLevelSuccess({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const { state, level, path } = await resolveState(sp.reference || sp.trxref, sp.preview, sp.level, sp.path);
  const levelName = level ? LEVEL_LABEL[level] : null;
  const pLabel = pathLabel(path);

  return (
    <>
      <Nav />
      <main className="page" id="main">
        <div className="wrap welcome" data-addon-success={state}>
          {state === "paid" ? (
            <>
              <RememberOwned path={path} level={level} />
              <p className="status-pill ok">
                <IconCheck size={14} strokeWidth={2.5} aria-hidden="true" /> Payment confirmed
              </p>
              <h1>
                {levelName ? `Your ${levelName} workspace is on its way.` : "Your extra workspace is on its way."}
              </h1>
              <p className="lede">
                Thank you.{" "}
                {levelName && pLabel
                  ? `You've added the ${levelName} level for ${pLabel}. `
                  : ""}
                You keep the level you already have.
              </p>
              <ol className="next-steps">
                <li>
                  <span className="num">1</span>
                  <div>
                    <h2>We send you the Notion link</h2>
                    <p>
                      We&rsquo;ll send the link for{" "}
                      {levelName ? `the ${levelName} workspace` : "this workspace"} on
                      WhatsApp or by email, whichever you gave us. We check each one
                      by hand, so it can take a little while. Look in your spam folder
                      if it doesn&rsquo;t show up.
                    </p>
                    {WHATSAPP_CHAT_URL ? (
                      <a
                        className="btn btn-secondary"
                        href={WHATSAPP_CHAT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Message us on WhatsApp
                      </a>
                    ) : null}
                  </div>
                </li>
                <li>
                  <span className="num">2</span>
                  <div>
                    <h2>Duplicate it into your own Notion</h2>
                    <p>
                      Open the link, choose Duplicate, and edit your own copy as you
                      like. Work in your copy, not the original.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="num">3</span>
                  <div>
                    <h2>Keep it to yourself</h2>
                    <p>
                      This level is a personal licence for you only, the same as your
                      first one. Please don&rsquo;t share it or its link with anyone
                      else.
                    </p>
                  </div>
                </li>
              </ol>
              <p className="muted" style={{ marginTop: 28 }}>
                Want another level too?{" "}
                <Link href={ADDON_PAGE}>Get another level</Link>.
              </p>
            </>
          ) : state === "pending" ? (
            <>
              <p className="status-pill">
                <IconClock size={14} aria-hidden="true" /> Confirming payment
              </p>
              <h1>We&rsquo;re confirming your payment.</h1>
              <p className="lede">
                This usually takes a few seconds. Refresh this page, or check your
                email for confirmation.
              </p>
            </>
          ) : state === "failed" ? (
            <>
              <h1>Your payment didn&rsquo;t go through.</h1>
              <p className="lede">
                No money was taken for this attempt. You can{" "}
                <Link href={addonLink(path, level)}>try again</Link>.
              </p>
            </>
          ) : (
            <>
              <h1>Get another level.</h1>
              <p className="lede">
                This page confirms extra-level payments. If you&rsquo;ve just paid,
                open the link from your Paystack receipt, or{" "}
                <Link href={ADDON_PAGE}>go to the Get another level page</Link>.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
