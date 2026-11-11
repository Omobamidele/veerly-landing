"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "./Currency";
import { useLaunch } from "./LaunchProvider";
import { useLevel } from "./LevelProvider";

/** Primary call to action that follows the launch state. */
export default function LaunchCta({
  variant = "default",
  size = "default",
  short = false,
  arrow = false,
  className,
}: {
  variant?: "default" | "stage" | "stage-ghost" | "outline";
  size?: "default" | "sm" | "lg";
  short?: boolean;
  arrow?: boolean;
  className?: string;
}) {
  const { launched } = useLaunch();
  const { price } = useCurrency();
  const { level } = useLevel();
  const text = launched
    ? short
      ? "Get access"
      : `Get founding access, ${price}`
    : "Join the waitlist";
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={level ? "#join-card" : "#levels"} data-launch-cta>
        {text}
        {arrow ? <ArrowRight data-icon="inline-end" /> : null}
      </a>
    </Button>
  );
}

/** Nav CTA: white on the brand stage, brand once the nav turns light. */
export function NavCta() {
  return (
    <>
      <LaunchCta
        short
        size="sm"
        variant="stage"
        className="in-data-[on-stage=false]:hidden"
      />
      <LaunchCta short size="sm" className="in-data-[on-stage=true]:hidden" />
    </>
  );
}
