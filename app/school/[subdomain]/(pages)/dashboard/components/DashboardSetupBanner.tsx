"use client";

import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardList,
  GraduationCap,
  School,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const SETUP_STEPS = [
  {
    id: "classes",
    label: "Classes",
    icon: BookOpen,
    path: "/classes",
  },
  {
    id: "students",
    label: "Students",
    icon: UserPlus,
    path: "/students?action=add",
  },
  {
    id: "teachers",
    label: "Teachers",
    icon: GraduationCap,
    path: "/teachers?action=add",
  },
  {
    id: "subjects",
    label: "Subjects",
    icon: ClipboardList,
    path: "/classes?tab=subjects",
  },
  {
    id: "school-details",
    label: "School profile",
    icon: School,
    path: "/onboarding",
  },
] as const;

const COMPLETED_STEPS = 2;

interface DashboardSetupBannerProps {
  className?: string;
}

export function DashboardSetupBanner({ className }: DashboardSetupBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || COMPLETED_STEPS >= SETUP_STEPS.length) return null;

  const nextStep = SETUP_STEPS[COMPLETED_STEPS];
  const pendingCount = SETUP_STEPS.length - COMPLETED_STEPS;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-[#246a59]/20 bg-gradient-to-r from-[#246a59]/8 to-[#246a59]/3 px-4 py-3 dark:from-[#246a59]/15 dark:to-[#246a59]/5",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 rounded-md p-1 text-slate-400 hover:bg-white/60 hover:text-slate-600 dark:hover:bg-slate-800/60"
        aria-label="Dismiss setup banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="pr-8">
        <p className="text-xs font-medium text-[#246a59]">
          Finish setting up your school · {COMPLETED_STEPS}/{SETUP_STEPS.length}{" "}
          done · {pendingCount} pending
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
          Next: {nextStep.label}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Green steps are complete. Grey steps are still pending.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {SETUP_STEPS.map((step, index) => {
          const isComplete = index < COMPLETED_STEPS;
          const isNext = index === COMPLETED_STEPS;
          const isPending = !isComplete && !isNext;

          return (
            <Link
              key={step.id}
              href={step.path}
              aria-label={`${step.label}${isComplete ? ", complete" : isNext ? ", next step" : ", pending"}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                isComplete &&
                  "border-emerald-200/80 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
                isNext &&
                  "border-[#246a59] bg-white text-[#246a59] ring-1 ring-[#246a59]/20 shadow-sm dark:bg-slate-900",
                isPending &&
                  "border-slate-200/80 bg-slate-50/80 text-slate-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-500",
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : isPending ? (
                <Circle className="h-3 w-3 shrink-0 stroke-[1.5]" />
              ) : (
                <ChevronRight className="h-3 w-3 shrink-0" />
              )}
              {step.label}
              {isPending && (
                <span className="sr-only"> (pending)</span>
              )}
            </Link>
          );
        })}
        <Link
          href={nextStep.path}
          className="ml-auto inline-flex items-center gap-0.5 text-xs font-medium text-[#246a59] hover:underline"
        >
          Continue
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
