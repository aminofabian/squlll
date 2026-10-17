"use client";

import Link from "next/link";
import { Check, ChevronRight, Loader2, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSchoolSetupProgress } from "@/lib/hooks/useSchoolSetupProgress";

interface DashboardSetupBannerProps {
  className?: string;
}

export function DashboardSetupBanner({ className }: DashboardSetupBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { steps, completedCount, totalCount, nextStep, isComplete, isLoading } =
    useSchoolSetupProgress();

  if (dismissed || isComplete) return null;

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 border border-[#1a4d42]/12 bg-white px-3 py-3 text-[12px] text-[#1a4d42]/55 dark:border-white/10 dark:bg-[#0c1a17]",
          className,
        )}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Checking setup…
      </div>
    );
  }

  if (!nextStep) return null;

  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <section
      className={cn(
        "relative overflow-hidden border border-[#1a4d42]/12 bg-white shadow-[3px_3px_0_0_rgba(10,31,26,0.05)] dark:border-white/10 dark:bg-[#0c1a17]",
        className,
      )}
      role="region"
      aria-label="School setup progress"
    >
      <div aria-hidden className="absolute inset-y-0 left-0 w-1 bg-[#c8a96a]" />

      <div className="flex flex-col gap-3.5 py-3.5 pl-4 pr-8 sm:pl-5 xl:flex-row xl:items-center xl:gap-5">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="relative h-12 w-12 shrink-0">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                className="text-[#e8f2ef] dark:text-white/10"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                pathLength={100}
                strokeDasharray={`${progressPercent} ${100 - progressPercent}`}
                className="text-[#246a59] transition-all duration-700 dark:text-emerald-300"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-[11px] tabular-nums text-[#0a1f1a] dark:text-white">
              {progressPercent}%
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#246a59] dark:text-emerald-300">
              Getting started
            </p>
            <p className="mt-0.5 truncate font-display text-lg leading-tight tracking-tight text-[#0a1f1a] dark:text-white">
              Finish setting up your school
            </p>
            <p className="mt-0.5 text-[11px] text-[#1a4d42]/50 dark:text-white/40">
              {completedCount} of {totalCount} steps complete · Next:{" "}
              <span className="font-medium text-[#1a4d42]/75 dark:text-white/70">
                {nextStep.label}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-1.5 xl:justify-center">
          {steps.map((step) => {
            const isNext = step.id === nextStep.id;
            return (
              <Link
                key={step.id}
                href={step.path}
                className={cn(
                  "inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-medium transition-colors",
                  step.isComplete
                    ? "border-emerald-200/80 bg-emerald-50 text-emerald-800 hover:border-emerald-300 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : isNext
                      ? "border-[#246a59] bg-[#246a59] text-white hover:bg-[#1a4d42] dark:border-emerald-300 dark:bg-emerald-300 dark:text-[#071411]"
                      : "border-[#1a4d42]/12 bg-[#f8fbfa] text-[#1a4d42]/55 hover:border-[#246a59]/35 hover:text-[#0a1f1a] dark:border-white/10 dark:bg-[#071411] dark:text-white/50 dark:hover:text-white",
                )}
              >
                {step.isComplete ? (
                  <Check className="h-3 w-3 shrink-0" strokeWidth={2.5} />
                ) : (
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      isNext ? "bg-white dark:bg-[#071411]" : "bg-[#1a4d42]/25",
                    )}
                  />
                )}
                {step.label}
              </Link>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={nextStep.path}
            className="inline-flex h-8 items-center gap-1 bg-[#0a1f1a] px-3 text-[11px] font-medium text-white transition-colors hover:bg-[#246a59] dark:bg-emerald-300 dark:text-[#071411] dark:hover:bg-emerald-200"
          >
            Continue
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="inline-flex h-8 w-8 items-center justify-center text-[#1a4d42]/35 transition-colors hover:bg-[#f3f7f5] hover:text-[#0a1f1a] dark:text-white/30 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Dismiss setup banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
