"use client";

import { useEffect, useState } from "react";
import {
  OWNED_STORAGE_KEY,
  ownsLevel,
  parseStoredOwned,
} from "@/lib/addon";
import type { CareerPath, LevelId } from "@/lib/levels";
import type { OwnedLevel } from "@/lib/types";

/** Save what this student has paid for in this browser only, so the quiz can point to the add-on page. */
export function rememberOwned(add: OwnedLevel[]) {
  try {
    const next = parseStoredOwned(localStorage.getItem(OWNED_STORAGE_KEY));
    for (const o of add) if (!ownsLevel(next, o.path, o.level)) next.push(o);
    localStorage.setItem(OWNED_STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

/** Levels this browser remembers as paid for. Empty until the page has loaded. */
export function useOwnedLevels(): OwnedLevel[] {
  const [owned, setOwned] = useState<OwnedLevel[]>([]);
  useEffect(() => {
    const read = () => {
      try {
        setOwned(parseStoredOwned(localStorage.getItem(OWNED_STORAGE_KEY)));
      } catch {}
    };
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);
  return owned;
}

/** Renders nothing. Put it on a confirmed-payment page to remember the level in this browser. */
export default function RememberOwned({
  path,
  level,
}: {
  path: CareerPath | null;
  level: LevelId | null;
}) {
  useEffect(() => {
    if (path && level) rememberOwned([{ path, level }]);
  }, [path, level]);
  return null;
}
