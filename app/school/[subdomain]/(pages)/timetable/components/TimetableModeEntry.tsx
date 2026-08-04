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
        className="absolute inset-0 bg-slate-950/50 transition-opacity duration-300"
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#246a59]">
                  Structure ready
                </p>
                <h2
                  id="timetable-mode-entry-title"
                  className="mt-1 font-display text-[1.35rem] tracking-tight text-[#0a1f1a] dark:text-white sm:text-[1.5rem]"
                >
                  How should we fill this timetable?
                </h2>
                <p className={cn(tt.caption, "mt-1.5 max-w-lg text-[13px]")}>
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
                    className="inline-flex items-center gap-1 rounded-none border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
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
              className="group relative overflow-hidden border border-slate-200 bg-white p-5 text-left transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500 dark:hover:bg-slate-950"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center bg-[#0a1f1a] text-white">
                  <PenLine className="h-4.5 w-4.5" strokeWidth={1.75} />
                </div>
                <Layers3 className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
              </div>
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-50">
                Build manually
              </p>
              <p className={cn(tt.caption, "mt-1.5 text-[12.5px]")}>
                Place each lesson yourself. Best when you already know who
                teaches where, or you want full control cell by cell.
              </p>
              <ul className="mt-4 space-y-1.5 text-[12px] text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 bg-slate-400" />
                  Tap any empty cell to add a lesson
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 bg-slate-400" />
                  Clashes checked as you go
                </li>
              </ul>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-900 transition group-hover:gap-2.5 dark:text-slate-100">
                Continue manually
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>

            {/* Automatic — recommended */}
            <button
              type="button"
              onClick={onChooseAutomatic}
              className="group relative overflow-hidden border border-[#246a59] bg-[#246a59]/[0.04] p-5 text-left transition-colors hover:bg-[#246a59]/[0.08] dark:bg-[#246a59]/10 dark:hover:bg-[#246a59]/15"
            >
              <div className="absolute right-0 top-0 bg-[#246a59] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                Recommended
              </div>
              <div className="mb-4 flex items-center justify-between pr-24">
                <div className="flex h-10 w-10 items-center justify-center bg-[#246a59] text-white">
                  <Sparkles className="h-4.5 w-4.5" strokeWidth={1.75} />
                </div>
                <Wand2 className="h-4 w-4 text-[#246a59]/50 transition group-hover:text-[#246a59]" />
              </div>
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-50">
                Auto-generate
              </p>
              <p className={cn(tt.caption, "mt-1.5 text-[12.5px]")}>
                Tell us who teaches what, set workload limits, then generate a
                balanced draft you can refine on the grid.
              </p>
              <ul className="mt-4 space-y-1.5 text-[12px] text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 bg-[#246a59]" />
                  Allocations → rules → generate
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 bg-[#246a59]" />
                  Review clashes & quotas after
                </li>
              </ul>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#246a59] transition group-hover:gap-2.5">
                Set up & generate
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-[11px] text-slate-400">
              Tip: you can reopen auto-generate anytime from the ⋮ menu.
            </p>
            <button
              type="button"
              onClick={onChooseManual}
              className="shrink-0 text-[12px] font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline dark:hover:text-slate-200"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
