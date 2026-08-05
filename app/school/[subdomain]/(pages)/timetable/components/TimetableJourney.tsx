"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Clock,
  GraduationCap,
  ListChecks,
  Share2,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";

/** Human label for a school week of N days. */
const weekDaysLabel = (days: number) =>
  days === 5
    ? "Monday–Friday"
    : days === 6
      ? "Monday–Saturday"
      : days === 7
        ? "Monday–Sunday"
        : `${days} days a week`;

type StopId =
  | "day"
  | "classes"
  | "teachers"
  | "subjects"
  | "lessons"
  | "workload"
  | "create"
  | "check"
  | "share";

interface TimetableJourneyProps {
  hasSchoolDay: boolean;
  periodCount: number;
  dayCount: number;
  classCount: number;
  teacherCount: number;
  subjectCount: number;
  weeklyLessonRows: number;
  workloadRuleCount: number;
  lessonCount: number;
  clashCount: number;
  issueCount: number;
  publishState: "unpublished" | "published" | "stale";
  onSetUpSchoolDay: () => void;
  onManageClasses: () => void;
  onManageTeachers: () => void;
  onManageSubjects: () => void;
  onSetWeeklyLessons: () => void;
  onCheckWorkload: () => void;
  onGenerate: () => void;
  onFillManually: () => void;
  onReviewIssues: () => void;
  onPublish: () => void;
  onHide?: () => void;
}

interface Stop {
  id: StopId;
  /** Short label for the progress spine. */
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  done: boolean;
  doneHint?: string;
  optional?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function TimetableJourney({
  hasSchoolDay,
  periodCount,
  dayCount,
  classCount,
  teacherCount,
  subjectCount,
  weeklyLessonRows,
  workloadRuleCount,
  lessonCount,
  clashCount,
  issueCount,
  publishState,
  onSetUpSchoolDay,
  onManageClasses,
  onManageTeachers,
  onManageSubjects,
  onSetWeeklyLessons,
  onCheckWorkload,
  onGenerate,
  onFillManually,
  onReviewIssues,
  onPublish,
  onHide,
}: TimetableJourneyProps) {
  const [skipped, setSkipped] = useState<Set<StopId>>(new Set());

  const stops: Stop[] = [
    {
      id: "day",
      label: "School day",
      title: "School day",
      description:
        "Tell us when the first lesson starts, how long a lesson runs, and when school breaks for assembly, break and lunch.",
      icon: Clock,
      done: hasSchoolDay,
      doneHint:
        periodCount > 0
          ? `${periodCount} lessons · ${weekDaysLabel(dayCount || 5)}`
          : undefined,
      actionLabel: "Set up the school day",
      onAction: onSetUpSchoolDay,
    },
    {
      id: "classes",
      label: "Classes",
      title: "Classes",
      description:
        "Check which classes need a timetable. If a grade has more than one stream, like 4A and 4B, add them so each one gets its own timetable.",
      icon: GraduationCap,
      done: classCount > 0,
      doneHint: classCount > 0 ? `${classCount} configured` : undefined,
      actionLabel: classCount > 0 ? "Check my classes" : "Add classes",
      onAction: onManageClasses,
    },
    {
      id: "teachers",
      label: "Teachers",
      title: "Teachers",
      description:
        "Tell us which subjects each teacher handles so we can avoid scheduling conflicts.",
      icon: Users,
      done: teacherCount > 0,
      doneHint: teacherCount > 0 ? `${teacherCount} on staff` : undefined,
      actionLabel: teacherCount > 0 ? "Check my teachers" : "Add teachers",
      onAction: onManageTeachers,
    },
    {
      id: "subjects",
      label: "Subjects",
      title: "Subjects",
      description:
        "The subjects each class learns. These are set up together with your classes.",
      icon: BookOpen,
      done: subjectCount > 0,
      doneHint: subjectCount > 0 ? `${subjectCount} available` : undefined,
      actionLabel: subjectCount > 0 ? "Check my subjects" : "Set up subjects",
      onAction: onManageSubjects,
    },
    {
      id: "lessons",
      label: "Weekly lessons",
      title: "Weekly lessons",
      description:
        "Specify how many lessons each subject has every week and assign a teacher. Use the suggested counts, adjust where needed, then copy them to your other classes.",
      icon: ClipboardList,
      done: weeklyLessonRows > 0,
      doneHint:
        weeklyLessonRows > 0
          ? `${weeklyLessonRows} teaching assignment${weeklyLessonRows === 1 ? "" : "s"}`
          : undefined,
      actionLabel: "Set weekly lessons",
      onAction: onSetWeeklyLessons,
    },
    {
      id: "workload",
      label: "Workload",
      title: "Teacher workload",
      description:
        "Set the most lessons a teacher should take in a day or a week, and any days or times they are not available. You can leave this and we'll use sensible limits.",
      icon: ListChecks,
      done: workloadRuleCount > 0,
      doneHint:
        workloadRuleCount > 0
          ? `${workloadRuleCount} teacher${workloadRuleCount === 1 ? "" : "s"} with limits set`
          : undefined,
      optional: true,
      actionLabel: "Check workloads",
      onAction: onCheckWorkload,
    },
    {
      id: "create",
      label: "Create",
      title: "Create the timetable",
      description:
        "We place every lesson for you — no teacher in two classes at once, and double lessons kept side by side. You can move anything afterwards.",
      icon: Sparkles,
      done: lessonCount > 0,
      doneHint:
        lessonCount > 0
          ? `${lessonCount} lesson${lessonCount === 1 ? "" : "s"} placed`
          : undefined,
      actionLabel: "Create my timetable",
      onAction: onGenerate,
      secondaryLabel: "I'll fill it in myself",
      onSecondary: onFillManually,
    },
    {
      id: "check",
      label: "Check it",
      title: "Check it over",
      description:
        "We show anything that needs your attention — a teacher booked twice, or a class short of lessons — and take you straight to it.",
      icon: AlertTriangle,
      done: lessonCount > 0 && clashCount === 0,
      doneHint:
        lessonCount > 0 && clashCount === 0
          ? issueCount > 0
            ? `Nothing clashing · ${issueCount} thing${issueCount === 1 ? "" : "s"} to look at`
            : "Nothing clashing"
          : undefined,
      actionLabel: issueCount > 0 ? `Review ${issueCount}` : undefined,
      onAction: issueCount > 0 ? onReviewIssues : undefined,
    },
    {
      id: "share",
      label: "Share",
      title: "Share with your staff",
      description:
        "Publish when you're happy and every teacher sees their own lessons. You can still make changes and publish again.",
      icon: Share2,
      done: publishState === "published",
      doneHint:
        publishState === "published" ? "Teachers can see it" : undefined,
      actionLabel:
        publishState === "stale" ? "Publish again" : "Publish for teachers",
      onAction: onPublish,
    },
  ];

  const doneCount = stops.filter((s) => s.done).length;
  const currentIndex = stops.findIndex((s) => !s.done && !skipped.has(s.id));
  const current = currentIndex >= 0 ? stops[currentIndex] : null;
  const started = lessonCount > 0;

  const skipCurrent = () => {
    if (!current) return;
    setSkipped((prev) => new Set(prev).add(current.id));
  };

  const spine = (
    <ol className="flex flex-wrap items-center gap-1.5">
      {stops.map((stop, i) => {
        const isCurrent = i === currentIndex;
        const isSkipped = skipped.has(stop.id) && !stop.done;
        return (
          <li key={stop.id} className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-none border px-2.5 py-1 text-[11px] font-medium",
                stop.done
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : isCurrent
                    ? "border-[#246a59] bg-[#246a59] text-white"
                    : isSkipped
                      ? "border-dashed border-slate-300 bg-transparent text-slate-400 dark:border-slate-600 dark:text-slate-500"
                      : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400",
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-none text-[9px] font-bold tabular-nums",
                  stop.done
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                )}
                aria-hidden
              >
                {stop.done ? <Check className="h-2.5 w-2.5" /> : i + 1}
              </span>
              {stop.label}
            </span>
            {i < stops.length - 1 ? (
              <ChevronRight
                className="h-3 w-3 shrink-0 text-slate-300 dark:text-slate-600"
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );

  // Once lessons exist, shrink to a single strip so it doesn't compete with the grid.
  if (started) {
    return (
      <section className={cn(tt.panel, "overflow-hidden")} aria-label="Timetable progress">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className={tt.eyebrow}>
              Step {Math.min(doneCount + 1, stops.length)} of {stops.length}
            </p>
            <p className="mt-1 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
              {current ? current.title : "Your timetable is published"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {current?.actionLabel && current.onAction ? (
              <Button
                size="sm"
                className={cn("h-8 gap-1.5 text-xs", tt.accentBtn)}
                onClick={current.onAction}
              >
                {current.actionLabel}
              </Button>
            ) : null}
            {onHide ? (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400"
                onClick={onHide}
              >
                Hide
              </Button>
            ) : null}
          </div>
        </div>
        <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
          {spine}
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(tt.panel, "overflow-hidden border-l-[3px] border-l-[#246a59]")}
      aria-label="Create your school timetable"
    >
      {/* Header — single compact row */}
      <div className="flex items-center justify-between gap-3 px-5 pt-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#246a59]/25 bg-[#246a59]/10 text-[#246a59]"
            aria-hidden
          >
            <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className={tt.eyebrow}>Timetable setup</p>
            <h2 className="truncate text-[14px] font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-100">
              Set up your school timetable
            </h2>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              Complete these steps to generate a timetable for your entire
              school.
            </p>
          </div>
        </div>
        {onHide ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 shrink-0 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400"
            onClick={onHide}
          >
            Hide
          </Button>
        ) : null}
      </div>

      <div className="px-5 pt-3 sm:px-6">{spine}</div>

      {/* Current step — compact row */}
      {current ? (
        <div className="mt-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/30 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-[#246a59] text-white"
              aria-hidden
            >
              <current.icon className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1 basis-56">
              <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">
                {current.title}
                <span className="ml-2 font-normal text-slate-400 dark:text-slate-500">
                  Step {currentIndex + 1} of {stops.length}
                  {current.optional ? " · optional" : ""}
                </span>
              </h3>
              <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                {current.description}
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {current.actionLabel && current.onAction ? (
                <Button
                  size="sm"
                  className={cn("h-8 gap-1.5 text-xs", tt.accentBtn)}
                  onClick={current.onAction}
                >
                  {current.actionLabel}
                </Button>
              ) : null}
              {current.secondaryLabel && current.onSecondary ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-slate-200 text-xs dark:border-slate-700"
                  onClick={current.onSecondary}
                >
                  {current.secondaryLabel}
                </Button>
              ) : null}
              {current.optional ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  onClick={skipCurrent}
                >
                  Skip for now
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-2.5 dark:border-slate-800 sm:px-6">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          {doneCount} of {stops.length} steps completed ·{" "}
          {Math.round((doneCount / stops.length) * 100)}% done
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          You can leave and come back — nothing is lost.
        </p>
      </div>

      {/* Completed steps — one wrapping row of chips */}
      {doneCount > 0 ? (
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-slate-100 px-5 py-2.5 dark:border-slate-800 sm:px-6">
          {stops
            .filter((s) => s.done && s.doneHint)
            .map((s) => (
              <li
                key={s.id}
                className="flex min-w-0 items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400"
              >
                <Check
                  className="h-3 w-3 shrink-0 text-emerald-600"
                  strokeWidth={3}
                  aria-hidden
                />
                <span className="shrink-0 font-medium text-slate-700 dark:text-slate-200">
                  {s.title}
                </span>
                <span className="truncate">· {s.doneHint}</span>
                {s.onAction ? (
                  <button
                    type="button"
                    onClick={s.onAction}
                    className="ml-1 shrink-0 text-[11px] font-medium text-[#246a59] hover:underline"
                  >
                    Change
                  </button>
                ) : null}
              </li>
            ))}
        </ul>
      ) : null}
    </section>
  );
}
