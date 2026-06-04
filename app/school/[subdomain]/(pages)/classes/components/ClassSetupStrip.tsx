"use client";

import { BookOpenCheck, Check, Circle, GraduationCap, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ClassSetupStep {
  id: string;
  label: string;
  done: boolean;
  hint?: string;
}

interface ClassSetupStripProps {
  steps: ClassSetupStep[];
  className?: string;
  onStepClick?: (stepId: string) => void;
}

const ICONS = {
  students: Users,
  teacher: GraduationCap,
  subjects: BookOpenCheck,
} as const;

export function ClassSetupStrip({
  steps,
  className,
  onStepClick,
}: ClassSetupStripProps) {
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length && steps.length > 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2.5 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/50",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Class readiness
        </p>
        <span
          className={cn(
            "text-[10px] font-semibold tabular-nums",
            allDone ? "text-emerald-600" : "text-slate-500",
          )}
        >
          {doneCount}/{steps.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {steps.map((step) => {
          const Icon =
            ICONS[step.id as keyof typeof ICONS] ?? Circle;
          const inner = (
            <>
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                  step.done
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200/80 text-slate-400 dark:bg-slate-700",
                )}
              >
                {step.done ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : (
                  <Icon className="h-3 w-3" />
                )}
              </span>
              <span
                className={cn(
                  "truncate text-[11px] font-medium",
                  step.done
                    ? "text-emerald-800 dark:text-emerald-200"
                    : "text-slate-600 dark:text-slate-300",
                )}
              >
                {step.label}
              </span>
            </>
          );
          const stepClass = cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left sm:min-w-[7rem]",
            step.done
              ? "bg-emerald-50/80 dark:bg-emerald-950/25"
              : "bg-slate-50/90 dark:bg-slate-800/40",
            onStepClick &&
              "cursor-pointer transition-colors hover:ring-1 hover:ring-[#0073ea]/20",
          );

          return onStepClick ? (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick(step.id)}
              className={stepClass}
              title={step.hint}
            >
              {inner}
            </button>
          ) : (
            <div key={step.id} className={stepClass} title={step.hint}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
