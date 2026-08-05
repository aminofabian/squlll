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
        "rounded-none border border-[#1a4d42]/12 bg-white/60 px-3 py-2.5 backdrop-blur-sm dark:border-white/15 dark:bg-[#0c1a17]",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#1a4d42]/45">
          Class readiness
        </p>
        <span
          className={cn(
            "text-[10px] font-semibold tabular-nums",
            allDone ? "text-emerald-600" : "text-[#1a4d42]/55",
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
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-none",
                  step.done
                    ? "bg-emerald-500 text-white"
                    : "bg-[#e8f2ef]/80 text-[#1a4d42]/45 dark:bg-slate-700",
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
                    : "text-[#1a4d42]/65 dark:text-[#1a4d42]/30",
                )}
              >
                {step.label}
              </span>
            </>
          );
          const stepClass = cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-none px-2 py-1.5 text-left sm:min-w-[7rem]",
            step.done
              ? "bg-emerald-50/80 dark:bg-emerald-950/25"
              : "bg-[#f8fbfa] dark:bg-[#071411]",
            onStepClick &&
              "cursor-pointer transition-colors hover:ring-1 hover:ring-[#246a59]/20",
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
