"use client";

import { IconArrowRight } from "@/components/icons/veerly-icons";
import { Button } from "@/components/ui/button";
import { useCurrency } from "./Currency";
import { useLaunch } from "./LaunchProvider";
import { useLevel } from "./LevelProvider";

/** Primary call to action that follows the launch state. */
export default function LaunchCta({
  variant = "yellow",
  size = "default",
  short = false,
  arrow = false,
  className,
}: {
  variant?: "default" | "yellow" | "stage" | "stage-ghost" | "outline";
  size?: "default" | "sm" | "lg";
  short?: boolean;
  arrow?: boolean;
  className?: string;
}) {
  const { launched } = useLaunch();
  const { price } = useCurrency();
  const { path, level } = useLevel();
  const text = launched
    ? short
      ? "Get access"
      : `Get founding access, ${price}`
    : "Join the waitlist";
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={path && level ? "#join-card" : "#levels"} data-launch-cta>
        {text}
        {arrow ? <IconArrowRight data-icon="inline-end" /> : null}
      </a>
    </Button>
  );
}

/** Nav CTA: yellow on every surface so it stays the highlighted action. */
export function NavCta() {
  return (
    <>
      <LaunchCta
        short
        size="sm"
        variant="yellow"
        className="in-data-[on-stage=false]:hidden"
      />
      <LaunchCta short size="sm" variant="yellow" className="in-data-[on-stage=true]:hidden" />
    </>
  );
}
