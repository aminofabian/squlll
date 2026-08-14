"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
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

  return (
    <section
      className={cn(
        "overflow-hidden border-b border-[#1a4d42]/12 bg-white dark:border-white/10 dark:bg-[#0c1a17]",
        !started && "border-l-[3px] border-l-[#246a59]",
      )}
      aria-label="Timetable progress"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {current ? (
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#246a59] text-white"
              aria-hidden
            >
              <current.icon className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
          ) : (
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center bg-emerald-600 text-white"
              aria-hidden
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold tracking-[-0.01em] text-[#0a1f1a] dark:text-white">
              {current ? current.title : "Your timetable is published"}
              <span className="ml-2 font-normal text-[#1a4d42]/45 dark:text-white/40">
                {doneCount}/{stops.length}
                {current?.optional ? " · optional" : ""}
              </span>
            </p>
            {current ? (
              <p className="hidden truncate text-[11px] text-[#1a4d42]/55 sm:block dark:text-white/45">
                {current.description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {current?.actionLabel && current.onAction ? (
            <Button
              size="sm"
              className={cn("h-7 gap-1.5 text-xs", tt.accentBtn)}
              onClick={current.onAction}
            >
              {current.actionLabel}
            </Button>
          ) : null}
          {!started && current?.secondaryLabel && current.onSecondary ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 border-slate-200 text-xs dark:border-slate-700"
              onClick={current.onSecondary}
            >
              {current.secondaryLabel}
            </Button>
          ) : null}
          {current?.optional ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400"
              onClick={skipCurrent}
            >
              Skip
            </Button>
          ) : null}
          {onHide ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400"
              onClick={onHide}
            >
              Hide
            </Button>
          ) : null}
        </div>
      </div>
      <div className="border-t border-[#1a4d42]/8 px-3 py-2 dark:border-white/8 sm:px-4">
        {spine}
      </div>
    </section>
  );
}
