"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { FEES_LAYOUT } from "../../lib/fees-ui";

const SECTIONS = [
  { id: "term-amounts", label: "Schedule", short: "Fees" },
  { id: "linked-classes", label: "Classes", short: "Classes" },
  { id: "fee-letter", label: "Letter", short: "Letter" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

interface FeePlanDetailSectionNavProps {
  className?: string;
}

export function FeePlanDetailSectionNav({
  className,
}: FeePlanDetailSectionNavProps) {
  const [active, setActive] = useState<SectionId>("term-amounts");

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const anchor = 180;
      let current: SectionId = "term-amounts";
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (!element) continue;
        if (element.getBoundingClientRect().top - anchor <= 0) {
          current = section.id;
        }
      }
      setActive(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <nav
      aria-label="Structure sections"
      className={cn(
        FEES_LAYOUT.page,
        "sticky z-20 border border-[#1a4d42]/12 bg-[#f8fbfa]/95 backdrop-blur-sm",
        "top-[calc(3.25rem+env(safe-area-inset-top,0px))] sm:top-[4.5rem]",
        className,
      )}
    >
      <div
        className={cn(FEES_LAYOUT.chipStrip, "gap-1 px-1 py-1.5 sm:px-1.5")}
        role="tablist"
      >
        {SECTIONS.map((section) => {
          const selected = active === section.id;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(section.id)}
              className={cn(
                "inline-flex shrink-0 items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/40",
                selected
                  ? "border-[#0a1f1a] bg-[#0a1f1a] text-white shadow-sm"
                  : "border-transparent text-[#1a4d42]/60 hover:border-[#1a4d42]/12 hover:bg-white hover:text-[#0a1f1a]",
              )}
            >
              <span className="hidden sm:inline">{section.label}</span>
              <span className="sm:hidden">{section.short}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
