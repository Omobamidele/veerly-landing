"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "./Currency";
import { useLaunch } from "./LaunchProvider";

export default function PricingCta({
  paymentsEnabled,
}: {
  paymentsEnabled: boolean;
}) {
  const { launched } = useLaunch();
  const { price } = useCurrency();
  return (
    <div className="flex flex-col items-start gap-3">
      <Button asChild variant="stage" size="lg" className="w-full sm:w-auto">
        <a href="#join-card">
          {launched ? `Get founding access, ${price}` : "Join the waitlist"}
          <ArrowRight data-icon="inline-end" />
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
