"use client";

import { cn } from "@/lib/utils";
import { FEES_LAYOUT } from "../../lib/fees-ui";

const SECTIONS = [
  { id: "term-amounts", label: "Schedule", short: "Fees" },
  { id: "linked-classes", label: "Classes", short: "Classes" },
  { id: "fee-letter", label: "Letter", short: "Letter" },
] as const;

interface FeePlanDetailSectionNavProps {
  className?: string;
}

export function FeePlanDetailSectionNav({
  className,
}: FeePlanDetailSectionNavProps) {
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
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            role="tab"
            className={cn(
              "inline-flex shrink-0 items-center rounded-none border border-transparent px-3 py-1.5 text-xs font-medium text-[#1a4d42]/60 transition-colors",
              "hover:border-[#1a4d42]/12 hover:bg-white hover:text-[#0a1f1a]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/40",
            )}
          >
            <span className="hidden sm:inline">{section.label}</span>
            <span className="sm:hidden">{section.short}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
