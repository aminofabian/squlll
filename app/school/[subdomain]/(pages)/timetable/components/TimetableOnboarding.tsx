"use client";

import { useCurrentAcademicYear } from "@/lib/hooks/useAcademicYears";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";
import { getTenantIdFromCookies } from "@/lib/utils/school-onboarding";
import { isTimetableWizardComplete } from "@/lib/utils/timetable-setup";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Coffee, BookOpen, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";

interface TimetableOnboardingProps {
  onSetupSchoolDay: () => void;
  onManageBreaks: () => void;
  onAddLessons: () => void;
  onOpenAcademicYearDrawer: () => void;
  onOpenCreateTermDrawer: () => void;
}

export function TimetableOnboarding({
  onSetupSchoolDay,
  onManageBreaks,
  onAddLessons,
  onOpenAcademicYearDrawer,
  onOpenCreateTermDrawer,
}: TimetableOnboardingProps) {
  const { academicYears, loading: academicYearsLoading } =
    useCurrentAcademicYear();
  const { selectedTerm } = useSelectedTerm();
  const { timeSlots, breaks } = useTimetableStore();

  const hasAcademicYear = academicYears.length > 0;
  const hasTerm = !!selectedTerm;
  const setupWizardDone = isTimetableWizardComplete(getTenantIdFromCookies());
  const hasSchoolDay =
    timeSlots.length > 0 || (setupWizardDone && breaks.length > 0);
  const hasBreaks = breaks.length > 0;

  if (academicYearsLoading) {
    return null;
  }

  if (hasAcademicYear && hasTerm && hasSchoolDay) {
    return null;
  }

  const steps = [
    {
      id: "year",
      done: hasAcademicYear,
      active: !hasAcademicYear,
      title: "School year",
      description: hasAcademicYear
        ? `Using ${academicYears[0]?.name}`
        : "Create the school year this timetable belongs to (e.g. 2025–2026).",
      action: !hasAcademicYear ? (
        <Button size="sm" onClick={onOpenAcademicYearDrawer} className="h-8">
          <Calendar className="h-3.5 w-3.5 mr-2" />
          Add school year
        </Button>
      ) : null,
    },
    {
      id: "term",
      done: hasTerm,
      active: hasAcademicYear && !hasTerm,
      title: "Term",
      description: hasTerm
        ? `Working in ${selectedTerm?.name}`
        : "Add Term 1, Term 2, etc. so lessons are saved in the right term.",
      action:
        hasAcademicYear && !hasTerm ? (
          <Button size="sm" onClick={onOpenCreateTermDrawer} className="h-8">
            <Calendar className="h-3.5 w-3.5 mr-2" />
            Add term
          </Button>
        ) : null,
    },
    {
      id: "day",
      done: hasSchoolDay,
      active: hasTerm && !hasSchoolDay,
      title: "Lesson times & breaks",
      description: hasSchoolDay
        ? timeSlots.length > 0
          ? `${timeSlots.length} lesson slots per day are set up`
          : "School day is set up — pick a class below to add lessons."
        : "Set when lessons start, how many periods per day, and lunch or breaks.",
      action:
        hasTerm && !hasSchoolDay ? (
          <Button size="sm" onClick={onSetupSchoolDay} className="h-8">
            <Clock className="h-3.5 w-3.5 mr-2" />
            Set up school day
          </Button>
        ) : null,
    },
    {
      id: "lessons",
      done: false,
      active: hasSchoolDay,
      title: "Add lessons",
      description: hasBreaks
        ? `${breaks.length} break${breaks.length !== 1 ? "s" : ""} on the schedule. Pick a class and fill the grid.`
        : "Optional: add breaks later. Pick a class and tap empty boxes to add lessons.",
      action: hasSchoolDay ? (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onAddLessons} className="h-8">
            <BookOpen className="h-3.5 w-3.5 mr-2" />
            Add lessons
          </Button>
          {!hasBreaks && (
            <Button
              size="sm"
              variant="outline"
              onClick={onManageBreaks}
              className="h-8"
            >
              <Coffee className="h-3.5 w-3.5 mr-2" />
              Add breaks
            </Button>
          )}
        </div>
      ) : null,
    },
  ];

  return (
    <div className={cn(tt.panel, "px-4 py-6 sm:px-6")}>
      <div className="mx-auto mb-6 max-w-xl text-center">
        <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Get your timetable ready
        </h2>
        <p className={cn(tt.caption, "mt-1")}>
          Complete these steps in order. You can change lesson times later.
        </p>
      </div>

      <ol className="mx-auto max-w-xl space-y-2.5">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              "rounded-xl border p-4 transition-colors",
              step.active
                ? "border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800/50"
                : step.done
                  ? "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                  : "border-zinc-200/80 bg-zinc-50/30 opacity-70 dark:border-zinc-800 dark:bg-zinc-900/30",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold",
                  step.done
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : step.active
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400",
                )}
              >
                {step.done ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                  {step.title}
                </h3>
                <p className={cn(tt.caption, "mt-0.5")}>{step.description}</p>
                {step.action && <div className="mt-3">{step.action}</div>}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
