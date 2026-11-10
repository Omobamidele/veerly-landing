"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The page's one authored motion grammar (see DESIGN.md → Motion).
 * Everything is visible without JS; with prefers-reduced-motion: reduce nothing animates.
 */
export default function Motion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const ease = "expo.out";
        const tl = gsap.timeline({ defaults: { ease, duration: 1.1 } });
        tl.fromTo(
          "[data-enter='line']",
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, stagger: 0.08 },
        )
          .fromTo(
            "[data-enter='fade']",
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.9 },
            0.25,
          )
          .fromTo(
            "[data-tile]",
            { autoAlpha: 0, y: 18, rotateX: -50, transformPerspective: 600 },
            { autoAlpha: 1, y: 0, rotateX: 0, stagger: 0.07, duration: 1 },
            0.35,
          );

        // Each numbered system row settles in once as it reaches the reader.
        gsap.utils.toArray<HTMLElement>("[data-row]").forEach((row) => {
          gsap.fromTo(
            row,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              ease,
              scrollTrigger: { trigger: row, start: "top 85%", once: true },
            },
          );
        });

        // The join timeline rail draws as you read it.
        gsap.fromTo(
          "[data-rail]",
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: "50% 0%",
            ease: "none",
            scrollTrigger: {
              trigger: "[data-rail-wrap]",
              start: "top 70%",
              end: "bottom 60%",
              scrub: 0.4,
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
