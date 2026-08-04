"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSchoolSetupProgress } from "@/lib/hooks/useSchoolSetupProgress";

interface DashboardSetupBannerProps {
  className?: string;
}

export function DashboardSetupBanner({ className }: DashboardSetupBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { steps, completedCount, totalCount, nextStep, isComplete, isLoading } =
    useSchoolSetupProgress();

  if (dismissed || isComplete) return null;

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 border border-[#1a4d42]/12 bg-white px-3 py-2 text-[12px] text-[#1a4d42]/55 dark:border-white/10 dark:bg-[#0c1a17]",
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
    <div
      className={cn(
        "relative border border-[#1a4d42]/12 bg-white px-3 py-2.5 shadow-[3px_3px_0_0_rgba(10,31,26,0.05)] dark:border-white/10 dark:bg-[#0c1a17]",
        className,
      )}
      role="region"
      aria-label="School setup progress"
    >
      <div className="flex flex-wrap items-center gap-3 pr-7">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="text-[12px] font-semibold text-[#0a1f1a] dark:text-white">
              Finish setup
            </p>
            <span className="text-[11px] text-[#1a4d42]/50 dark:text-white/40">
              {completedCount}/{totalCount} · Next: {nextStep.label}
            </span>
          </div>
          <div className="mt-1.5 h-1 max-w-xs overflow-hidden bg-[#e8f2ef] dark:bg-white/10">
            <div
              className="h-full bg-[#246a59] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden font-display text-lg tabular-nums text-[#246a59] sm:inline">
            {progressPercent}%
          </span>
          <Link
            href={nextStep.path}
            className="inline-flex h-7 items-center gap-1 bg-[#0a1f1a] px-2.5 text-[11px] font-medium text-white transition-colors hover:bg-[#246a59]"
          >
            Continue
            <ChevronRight className="h-3 w-3" />
          </Link>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#1a4d42]/50 hover:text-[#0a1f1a]"
            aria-expanded={expanded}
          >
            Steps
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 p-1 text-[#1a4d42]/35 hover:text-[#0a1f1a]"
        aria-label="Dismiss setup banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {expanded ? (
        <ul className="mt-2 space-y-0.5 border-t border-[#1a4d42]/10 pt-2 dark:border-white/10">
          {steps.map((step) => {
            const isNext = step.id === nextStep.id;
            return (
              <li key={step.id}>
                <Link
                  href={step.path}
                  className={cn(
                    "flex items-center gap-2 px-1.5 py-1.5 text-[11px] transition-colors",
                    isNext
                      ? "bg-[#246a59]/10 font-medium text-[#246a59]"
                      : "text-[#1a4d42]/70 hover:bg-[#f3f7f5] dark:text-white/70",
                  )}
                >
                  {step.isComplete ? (
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
                  ) : (
                    <span
                      className={cn(
                        "h-3 w-3 shrink-0 border",
                        isNext
                          ? "border-[#246a59] bg-[#246a59]/20"
                          : "border-[#1a4d42]/25",
                      )}
                    />
                  )}
                  {step.label}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
