import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Official Veerly mark + wordmark, set large enough to read as bold.
 * The brand kit draws the letters in a heavy geometric cut (Bricolage ExtraBold).
 * Recoloured to ink / white + yellow flag — never violet.
 */
export default function Logo({
  tone = "light",
  className,
}: {
  tone?: "stage" | "light";
  className?: string;
}) {
  return (
    <Image
      src={
        tone === "stage"
          ? "/brand/veerly-logo-white.svg"
          : "/brand/veerly-logo.svg"
      }
      alt="Veerly"
      width={200}
      height={40}
      priority
      className={cn("h-9 w-auto sm:h-10", className)}
    />
  );
}
