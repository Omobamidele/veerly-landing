"use client";

import { IconArrowRight } from "@/components/icons/veerly-icons";
import { Button } from "@/components/ui/button";
import { useCurrency } from "./Currency";
import { useLaunch } from "./LaunchProvider";
import { useLevel } from "./LevelProvider";

export default function PricingCta({
  paymentsEnabled,
}: {
  paymentsEnabled: boolean;
}) {
  const { launched } = useLaunch();
  const { price } = useCurrency();
  const { path, level } = useLevel();
  return (
    <div className="flex flex-col items-start gap-3">
      <Button asChild variant="yellow" size="lg" className="w-full sm:w-auto">
        <a href={path && level ? "#join-card" : "#levels"}>
          {launched ? `Get founding access, ${price}` : "Join the waitlist"}
          <IconArrowRight data-icon="inline-end" />
        </a>
      </Button>
      <p className="text-[13px] text-white/60">
        {launched
          ? paymentsEnabled
            ? "Secure checkout by Paystack."
            : "Checkout opening shortly."
          : "Free to join. Waitlist members hear first."}
      </p>
    </div>
  );
}
