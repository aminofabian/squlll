"use client";

import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimetableOnboardingProps {
  onSetupSchoolDay: () => void;
}

export function TimetableOnboarding({ onSetupSchoolDay }: TimetableOnboardingProps) {
  const { timeSlots, breaks, daysPerWeek, lessonPeriodsPerDay } =
    useTimetableStore();

  const hasLessonTimesReady =
    timeSlots.length > 0 ||
    (breaks.length > 0 &&
      ((lessonPeriodsPerDay ?? 0) > 0 || (daysPerWeek ?? 0) > 0));

  if (hasLessonTimesReady) {
    return null;
  }

  const steps = [
    {
      id: "day",
      done: false,
      active: true,
      badge: "Start here",
      title: "Set up lesson times and breaks",
      description: "Choose start time, lesson length, and break times.",
      action: (
        <Button size="sm" onClick={onSetupSchoolDay} className="h-9">
          <Clock className="h-3.5 w-3.5 mr-2" />
          Set up lesson times
        </Button>
      ),
    },
    {
      id: "lessons",
      done: false,
      active: false,
      badge: "Then",
      title: "Add lessons to the timetable",
      description: "Tap an empty cell to assign a subject and teacher.",
      action: null,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-5 py-5 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 max-w-xl">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Build your timetable
        </h2>
        <p className="mt-0.5 text-sm text-slate-400">
          Two steps — complete them in order.
        </p>
      </div>

      <ol className="max-w-xl space-y-0">
        {steps.map((step, index) => (
          <li key={step.id}>
            <div
              className={cn(
                "rounded-xl border p-4 transition-colors",
                step.active
                  ? "border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50"
                  : step.done
                    ? "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    : "border-slate-200/80 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-900/30",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold",
                    step.done
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : step.active
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
                  )}
                >
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                      step.active
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
                    )}
                  >
                    {step.badge}
                  </span>
                  <h3 className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {step.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {step.description}
                  </p>
                  {step.action && <div className="mt-3">{step.action}</div>}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className="flex justify-center py-2 text-slate-300 dark:text-slate-600"
                aria-hidden
              >
                <ArrowDown className="h-4 w-4" />
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
