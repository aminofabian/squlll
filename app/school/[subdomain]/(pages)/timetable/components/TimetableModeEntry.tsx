"use client";

import { useEffect, useState } from "react";
import {
  CalendarClock,
  Sparkles,
  PenLine,
  ArrowRight,
  CheckCircle2,
  Layers3,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";

interface TimetableModeEntryProps {
  onChooseManual: () => void;
  onChooseAutomatic: () => void;
  /** Dismiss the chooser without committing to a method. */
  onSkip: () => void;
  className?: string;
  /** Optional context for the chooser copy */
  termLabel?: string | null;
  classLabel?: string | null;
  periodCount?: number;
  dayCount?: number;
}

/**
 * Default landing when structure exists and the grid is still empty.
 * One decision: fill by hand, or generate from allocations + rules.
 */
export function TimetableModeEntry({
  onChooseManual,
  onChooseAutomatic,
  onSkip,
  className,
  termLabel,
  classLabel,
  periodCount,
  dayCount,
}: TimetableModeEntryProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const structureBits = [
    termLabel ? termLabel : null,
    classLabel ? classLabel : null,
    dayCount ? `${dayCount} days` : null,
    periodCount ? `${periodCount} periods` : null,
  ].filter(Boolean) as string[];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="timetable-mode-entry-title"
      className={cn(
        "fixed inset-0 z-40 flex items-start justify-center overflow-y-auto px-4 py-12 sm:items-center sm:py-8",
        className,
      )}
    >
      {/* Atmosphere — flat wash, no soft orbs */}
      <div
        className="absolute inset-0 bg-[#0a1f1a]/50 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden
      />

      <div
        className={cn(
          "relative w-full max-w-3xl overflow-hidden border border-[#1a4d42]/15 bg-white shadow-[8px_8px_0_0_rgba(10,31,26,0.08)] transition-all duration-400 dark:border-white/10 dark:bg-[#0c1a17]",
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0",
        )}
      >
        {/* Left accent rule */}
        <div className="absolute inset-y-0 left-0 w-[3px] bg-[#246a59]" />

        <div className="px-5 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-8">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#246a59]/25 bg-[#246a59]/10 text-[#246a59]">
                <CalendarClock className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className={cn(tt.text.micro, "font-semibold uppercase tracking-[0.16em] text-[#246a59] dark:text-[#7eb8a8]")}>
                  Structure ready
                </p>
                <h2
                  id="timetable-mode-entry-title"
                  className={cn("mt-1 font-display", tt.text.display, tt.ink.strong)}
                >
                  How should we fill this timetable?
                </h2>
                <p className={cn(tt.body, "mt-1.5 max-w-lg")}>
                  Pick a path. You can always switch later — generate drafts you
                  can edit, or place every lesson by hand.
                </p>
              </div>
            </div>

            {structureBits.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:max-w-[220px] sm:justify-end">
                {structureBits.map((bit) => (
                  <span
                    key={bit}
                    className={cn(
                      tt.text.caption,
                      tt.ink.base,
                      tt.numeral,
                      "inline-flex items-center gap-1 rounded-none border border-[#1a4d42]/12 bg-[#f8fbfa] px-2.5 py-1 font-medium dark:border-white/10 dark:bg-white/[0.02]",
                    )}
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {bit}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Manual */}
            <button
              type="button"
              onClick={onChooseManual}
              className={cn(
                tt.focus,
                "group relative overflow-hidden border border-[#1a4d42]/12 bg-white p-5 text-left transition-colors hover:border-[#246a59]/40 hover:bg-[#f8fbfa] dark:border-white/10 dark:bg-[#0c1a17] dark:hover:border-[#246a59]/50 dark:hover:bg-white/[0.03]",
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center bg-[#0a1f1a] text-white">
                  <PenLine className="h-4.5 w-4.5" strokeWidth={1.75} />
                </div>
                <Layers3 className={cn(tt.ink.faint, "h-4 w-4 transition group-hover:text-[#246a59]")} />
              </div>
              <p className={cn(tt.text.title, tt.ink.strong)}>
                Build manually
              </p>
              <p className={cn(tt.caption, "mt-1.5")}>
                Place each lesson yourself. Best when you already know who
                teaches where, or you want full control cell by cell.
              </p>
              <ul className={cn(tt.text.small, tt.ink.base, "mt-4 space-y-1.5")}>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 bg-[#1a4d42]/35" />
                  Tap any empty cell to add a lesson
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 bg-[#1a4d42]/35" />
                  Clashes checked as you go
                </li>
              </ul>
              <span className={cn(tt.text.small, tt.ink.strong, "mt-5 inline-flex items-center gap-1.5 font-semibold transition group-hover:gap-2.5")}>
                Continue manually
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>

            {/* Automatic — recommended */}
            <button
              type="button"
              onClick={onChooseAutomatic}
              className={cn(
                tt.focus,
                "group relative overflow-hidden border border-[#246a59] bg-[#246a59]/[0.04] p-5 text-left transition-colors hover:bg-[#246a59]/[0.08] dark:bg-[#246a59]/10 dark:hover:bg-[#246a59]/15",
              )}
            >
              <div className={cn(tt.text.micro, "absolute right-0 top-0 bg-[#246a59] px-2.5 py-1 font-semibold uppercase tracking-[0.12em] text-white")}>
                Recommended
              </div>
              <div className="mb-4 flex items-center justify-between pr-24">
                <div className="flex h-10 w-10 items-center justify-center bg-[#246a59] text-white">
                  <Sparkles className="h-4.5 w-4.5" strokeWidth={1.75} />
                </div>
                <Wand2 className="h-4 w-4 text-[#246a59]/50 transition group-hover:text-[#246a59]" />
              </div>
              <p className={cn(tt.text.title, tt.ink.strong)}>
                Auto-fill
              </p>
              <p className={cn(tt.caption, "mt-1.5")}>
                Tell us who teaches what, set workload limits, then generate a
                balanced draft you can refine on the grid.
              </p>
              <ul className={cn(tt.text.small, tt.ink.base, "mt-4 space-y-1.5")}>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 bg-[#246a59]" />
                  Allocations → rules → generate
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 bg-[#246a59]" />
                  Review clashes & quotas after
                </li>
              </ul>
              <span className={cn(tt.text.small, "mt-5 inline-flex items-center gap-1.5 font-semibold text-[#246a59] transition group-hover:gap-2.5 dark:text-[#7eb8a8]")}>
                Set up & auto-fill
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>

          <div className={cn(tt.border.hair, "mt-5 flex items-center justify-between gap-3 border-t pt-4")}>
            <p className={cn(tt.text.caption, tt.ink.faint)}>
              Tip: you can reopen auto-fill anytime from the ⋮ menu.
            </p>
            <button
              type="button"
              onClick={onSkip}
              className={cn(tt.focus, tt.text.small, tt.ink.muted, "shrink-0 font-medium underline-offset-2 hover:text-[#0a1f1a] hover:underline dark:hover:text-white")}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
