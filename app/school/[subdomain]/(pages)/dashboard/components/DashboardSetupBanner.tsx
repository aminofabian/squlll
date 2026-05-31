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
          "flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-[11px] text-slate-400 dark:border-slate-800 dark:bg-slate-900/40",
          className,
        )}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking setup…
      </div>
    );
  }

  if (!nextStep) return null;

  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div
      className={cn(
        "relative rounded-lg border border-[#246a59]/20 bg-[#246a59]/5 px-3 py-2.5 dark:bg-[#246a59]/10",
        className,
      )}
      role="region"
      aria-label="School setup progress"
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 rounded p-0.5 text-slate-400 hover:text-slate-600"
        aria-label="Dismiss setup banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="pr-6">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-medium text-[#246a59]">
            Setup {completedCount}/{totalCount}
          </span>
          <span className="text-slate-400">{progressPercent}%</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#246a59]/15">
          <div
            className="h-full rounded-full bg-[#246a59] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium text-slate-800 dark:text-slate-100">
            Next: {nextStep.label}
          </p>
          <Link
            href={nextStep.path}
            className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-[#246a59]"
          >
            Continue
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="mt-2 flex w-full items-center justify-center gap-1 text-[10px] font-medium text-slate-500 sm:hidden"
        aria-expanded={expanded}
      >
        {expanded ? "Hide steps" : "View all steps"}
        <ChevronDown
          className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")}
        />
      </button>

      <div
        className={cn(
          "mt-2 flex flex-wrap gap-1.5",
          !expanded && "hidden sm:flex",
        )}
      >
        {steps.map((step) => {
          const isNext = step.id === nextStep.id;
          return (
            <Link
              key={step.id}
              href={step.path}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium",
                step.isComplete &&
                  "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
                isNext &&
                  !step.isComplete &&
                  "border-[#246a59]/40 bg-white text-[#246a59] dark:bg-slate-900",
                !step.isComplete &&
                  !isNext &&
                  "border-slate-200/80 text-slate-400 dark:border-slate-700",
              )}
            >
              {step.isComplete ? (
                <CheckCircle2 className="h-3 w-3 shrink-0" />
              ) : null}
              {step.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
