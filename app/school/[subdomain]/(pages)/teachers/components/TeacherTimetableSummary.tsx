"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DAY_SHORT_NAMES, jsDayToDayOfWeek } from "@/lib/timetable";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import {
  useAdminTeacherTimetable,
  type TeacherTimetableEntry,
} from "@/lib/hooks/useAdminTeacherTimetable";
import { teachersPanel } from "./teachers-ui";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  Clock,
  GraduationCap,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface TeacherTimetableSummaryProps {
  teacherId: string;
  teacherName: string;
}

function formatTime(time: string): string {
  if (!time) return "";
  return time.length >= 5 ? time.slice(0, 5) : time;
}

function formatLessonTime(entry: TeacherTimetableEntry): string {
  return `${formatTime(entry.startTime)} – ${formatTime(entry.endTime)}`;
}

function getClassLabel(entry: TeacherTimetableEntry): string {
  return entry.streamName
    ? `${entry.gradeLevelName} · ${entry.streamName}`
    : entry.gradeLevelName;
}

function flattenEntries(
  schedule: ReturnType<typeof useAdminTeacherTimetable>["data"],
): TeacherTimetableEntry[] {
  if (!schedule?.schedule) return [];
  return schedule.schedule.flatMap((day) => day.entries ?? []);
}

function findNextLesson(entries: TeacherTimetableEntry[]): TeacherTimetableEntry | null {
  if (entries.length === 0) return null;

  const now = new Date();
  const todayDow = jsDayToDayOfWeek(now.getDay());
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const toMinutes = (time: string) => {
    const [h, m] = formatTime(time).split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };

  const sorted = [...entries].sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    return a.periodNumber - b.periodNumber;
  });

  for (const entry of sorted) {
    if (todayDow != null && entry.dayOfWeek === todayDow) {
      if (toMinutes(entry.endTime) > nowMinutes) return entry;
      continue;
    }
    if (todayDow != null && entry.dayOfWeek > todayDow) return entry;
  }

  return sorted[0] ?? null;
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
      <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-slate-800 dark:text-slate-100">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  );
}

function LessonRow({ entry }: { entry: TeacherTimetableEntry }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200/80 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="min-w-[4.5rem] shrink-0 text-[11px] font-medium tabular-nums text-slate-500">
        {formatLessonTime(entry)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
          {entry.subjectName}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">{getClassLabel(entry)}</p>
        {entry.roomName ? (
          <p className="mt-0.5 text-[11px] text-slate-400">{entry.roomName}</p>
        ) : null}
      </div>
      {entry.isDoublePeriod ? (
        <Badge
          variant="outline"
          className="shrink-0 border-violet-200 bg-violet-50 text-[10px] text-violet-700"
        >
          Double
        </Badge>
      ) : null}
    </div>
  );
}

function TimetableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  );
}

export function TeacherTimetableSummary({
  teacherId,
  teacherName,
}: TeacherTimetableSummaryProps) {
  const {
    selectedTerm,
    setSelectedTerm,
    availableTerms,
    termsLoading,
  } = useSelectedTerm();
  const { data, loading, error, termName, refetch } =
    useAdminTeacherTimetable(teacherId);

  const entries = useMemo(() => flattenEntries(data), [data]);
  const nextLesson = useMemo(() => findNextLesson(entries), [entries]);

  const uniqueGrades = useMemo(
    () => new Set(entries.map((e) => e.gradeLevelName)).size,
    [entries],
  );
  const uniqueSubjects = useMemo(
    () => new Set(entries.map((e) => e.subjectName)).size,
    [entries],
  );

  const todayDow = jsDayToDayOfWeek(new Date().getDay());
  const todayEntries = useMemo(
    () =>
      todayDow != null
        ? entries
            .filter((e) => e.dayOfWeek === todayDow)
            .sort((a, b) => a.periodNumber - b.periodNumber)
        : [],
    [entries, todayDow],
  );

  const weekDays = useMemo(() => {
    const days = data?.schedule ?? [];
    return [...days].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }, [data?.schedule]);

  return (
    <div className={`${teachersPanel} overflow-hidden`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Teaching schedule
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            {termName
              ? `${teacherName}'s timetable for ${termName}`
              : `Weekly lessons for ${teacherName}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {availableTerms.length > 1 && (
            <Select
              value={selectedTerm?.id ?? ""}
              onValueChange={(id) => {
                const term = availableTerms.find((t) => t.id === id);
                if (term) setSelectedTerm(term);
              }}
              disabled={termsLoading}
            >
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {availableTerms.map((term) => (
                  <SelectItem key={term.id} value={term.id} className="text-xs">
                    {term.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => void refetch()}
            disabled={loading}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        {loading && !data ? (
          <TimetableSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Could not load schedule
              </p>
              <p className="mt-1 text-xs text-slate-500">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : !data || entries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <CalendarDays className="h-8 w-8 text-slate-300" />
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                No lessons scheduled
              </p>
              <p className="mt-1 max-w-sm text-xs text-slate-400">
                {teacherName} has no timetable entries for {termName ?? "this term"} yet.
                Assign lessons from the timetable page.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href="/timetable">
                Open timetable
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {data.timetablePublishedAt ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                Timetable published for teachers
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Timetable not yet published — teachers cannot see this schedule
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard
                icon={BookOpen}
                label="Lessons / week"
                value={data.totalClasses}
                hint={`${uniqueSubjects} subject${uniqueSubjects !== 1 ? "s" : ""}`}
              />
              <StatCard
                icon={GraduationCap}
                label="Grades"
                value={uniqueGrades}
                hint="Classes taught"
              />
              <StatCard
                icon={CalendarDays}
                label="Teaching days"
                value={weekDays.filter((d) => d.entries.length > 0).length}
                hint="Days with lessons"
              />
            </div>

            {nextLesson && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  <Clock className="h-3 w-3" />
                  Next lesson
                </p>
                <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {nextLesson.subjectName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                      {getClassLabel(nextLesson)} ·{" "}
                      {DAY_SHORT_NAMES[nextLesson.dayOfWeek] ?? nextLesson.dayName} ·{" "}
                      {formatLessonTime(nextLesson)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {todayEntries.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Today&apos;s lessons
                </h4>
                <div className="space-y-2">
                  {todayEntries.map((entry) => (
                    <LessonRow key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Full week
                </h4>
                <Link
                  href="/timetable"
                  className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  Edit timetable →
                </Link>
              </div>
              <div className="space-y-4">
                {weekDays.map((day) =>
                  day.entries.length > 0 ? (
                    <div key={day.dayOfWeek}>
                      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        {day.dayName || DAY_SHORT_NAMES[day.dayOfWeek] || `Day ${day.dayOfWeek}`}
                      </p>
                      <div className="space-y-1.5">
                        {day.entries.map((entry) => (
                          <LessonRow key={entry.id} entry={entry} />
                        ))}
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
