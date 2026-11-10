"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLaunch } from "./LaunchProvider";

export default function PricingCta({
  paymentsEnabled,
}: {
  paymentsEnabled: boolean;
}) {
  const { launched, shortLabel } = useLaunch();
  return (
    <div className="flex flex-col items-start gap-3">
      <Button asChild variant="stage" size="lg" className="w-full sm:w-auto">
        <a href="#join-card">
          {launched ? "Get founding access, $7.99" : "Join the waitlist"}
          <ArrowRight data-icon="inline-end" />
        </a>
      </Button>
      <p className="text-[13px] text-white/60">
        {launched
          ? paymentsEnabled
            ? "Secure checkout by Paystack."
            : "Payments open at launch."
          : `Enrolment opens ${shortLabel}. Waitlist members hear first.`}
      </p>
    </div>
  );
}
