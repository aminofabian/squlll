"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock,
  Coffee,
  GraduationCap,
  MapPin,
  Plus,
  Sparkles,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GradeLevel } from "@/lib/types/school-config";
import type { GraphQLStudent } from "@/types/student";
import { useGradeLevelFeeSummary } from "@/lib/hooks/useGradeLevelFeeSummary";
import { useClassTeacherAssignment } from "@/lib/hooks/useClassTeacherAssignment";
import {
  filterStudentsForClass,
  type ClassRosterStudent,
} from "../../classes/utils/filterStudentsForClass";
import {
  feesClassHref,
  studentsClassHref,
  timetableClassHref,
} from "../../classes/utils/class-page-links";
import {
  useGradeTimetable,
  type GradeTimetable,
  type GradeTimetableDay,
  type GradeTimetableEntry,
} from "../hooks/useGradeTimetable";
import { GradeStudentRoster } from "./GradeStudentRoster";

function minutes(value?: string | null): number | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatTime(value?: string | null): string {
  const total = minutes(value);
  if (total == null) return "—";
  const hour = Math.floor(total / 60);
  const min = total % 60;
  const suffix = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(min).padStart(2, "0")}${suffix}`;
}

function formatKes(value?: number | null): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function todayDayNumber(now: Date): number {
  const day = now.getDay();
  return day === 0 ? 7 : day;
}

function dayName(dayOfWeek: number): string {
  return ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][dayOfWeek] ?? "Today";
}

type Snapshot =
  | {
      kind: "lesson";
      entry: GradeTimetableEntry;
      period: GradeTimetableDay["periods"][number];
      next?: { entry: GradeTimetableEntry; period: GradeTimetableDay["periods"][number] };
    }
  | {
      kind: "free";
      period: GradeTimetableDay["periods"][number];
      next?: { entry: GradeTimetableEntry; period: GradeTimetableDay["periods"][number] };
    }
  | { kind: "break"; name: string; next?: { entry: GradeTimetableEntry; period: GradeTimetableDay["periods"][number] } }
  | { kind: "done" }
  | { kind: "no-school" };

function snapshotFor(
  timetable: GradeTimetable,
  day: GradeTimetableDay | undefined,
  now: Date,
): Snapshot {
  if (!day) return { kind: "no-school" };
  const current = now.getHours() * 60 + now.getMinutes();
  const periods = [...day.periods].sort((a, b) => a.periodNumber - b.periodNumber);
  const entryFor = (periodNumber: number) =>
    day.entries.find((entry) => entry.periodNumber === periodNumber);
  const nextLesson = (after: number) => {
    for (const period of periods) {
      if (period.periodNumber <= after) continue;
      const start = minutes(period.startTime);
      if (start == null || start <= current) continue;
      const entry = entryFor(period.periodNumber);
      if (entry) return { entry, period };
    }
    return undefined;
  };

  for (let index = 0; index < periods.length; index += 1) {
    const period = periods[index];
    const start = minutes(period.startTime);
    const end = minutes(period.endTime);
    if (start == null || end == null || current < start || current >= end) continue;
    const entry = entryFor(period.periodNumber);
    if (entry) {
      return { kind: "lesson", entry, period, next: nextLesson(period.periodNumber) };
    }
    return { kind: "free", period, next: nextLesson(period.periodNumber) };
  }

  // Between two periods: show the break or the next lesson.
  for (let index = 0; index < periods.length - 1; index += 1) {
    const period = periods[index];
    const next = periods[index + 1];
    const end = minutes(period.endTime);
    const nextStart = minutes(next.startTime);
    if (end == null || nextStart == null || current < end || current >= nextStart) continue;
    const breakItem = day.breaks.find((item) => item.afterPeriod === period.periodNumber);
    return {
      kind: breakItem ? "break" : "free",
      name: breakItem?.name ?? "Break",
      next: nextLesson(period.periodNumber),
    } as Snapshot;
  }

  const next = nextLesson(0);
  if (next) {
    return { kind: "free", period: next.period, next };
  }
  return { kind: "done" };
}

function streamLabel(timetable: GradeTimetable): string {
  return timetable.streamName?.trim() || "Whole grade";
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#1a4d42]/10 bg-white shadow-[0_1px_2px_rgba(10,31,26,0.04)] dark:border-white/10 dark:bg-[#0c1a17]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function GradeInsights({
  grade,
  levelName,
  displayName,
  selectedStreamId,
  onStreamSelect,
  students,
}: {
  grade: GradeLevel;
  levelName: string;
  displayName: string;
  selectedStreamId: string;
  onStreamSelect: (streamId: string) => void;
  students: GraphQLStudent[];
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const { timetables, loading: timetableLoading, error: timetableError, termName } =
    useGradeTimetable(grade.id);
  const { data: feeSummary, isLoading: feesLoading } = useGradeLevelFeeSummary(grade.id);
  const { data: classTeacher } = useClassTeacherAssignment(
    selectedStreamId ? null : grade.id,
    selectedStreamId || null,
  );

  const allStudents = useMemo(
    () => filterStudentsForClass(students, grade.id),
    [grade.id, students],
  );
  const scopedStudents = useMemo(
    () => filterStudentsForClass(students, grade.id, selectedStreamId || undefined),
    [grade.id, selectedStreamId, students],
  );
  const activeStudents = scopedStudents.filter((student) => {
    const raw = students.find((item) => item.id === student.id);
    return raw?.isActive !== false;
  }).length;

  const selectedStreamName = grade.streams?.find(
    (stream) => stream.id === selectedStreamId,
  )?.name;
  const visibleTimetables = selectedStreamName
    ? timetables.filter(
        (timetable) =>
          timetable.streamName?.trim().toLowerCase() ===
          selectedStreamName.trim().toLowerCase(),
      )
    : timetables;
  const day = todayDayNumber(now);
  const today = day <= 5;
  const snapshots = visibleTimetables.map((timetable) => ({
    timetable,
    snapshot: snapshotFor(
      timetable,
      timetable.days.find((item) => item.dayOfWeek === day),
      now,
    ),
  }));
  const primaryTimetable =
    visibleTimetables.find((item) => item.streamId === selectedStreamId) ??
    visibleTimetables[0];
  const primaryDay = primaryTimetable?.days.find((item) => item.dayOfWeek === day);
  const previewDay = !primaryDay && !today
    ? [...(primaryTimetable?.days ?? [])].sort((a, b) => {
        const aDelta = (a.dayOfWeek - day + 7) % 7;
        const bDelta = (b.dayOfWeek - day + 7) % 7;
        return aDelta - bDelta;
      })[0]
    : undefined;
  const scheduleDay = primaryDay ?? previewDay;
  const scheduleDayLabel = primaryDay
    ? dayName(day)
    : previewDay
      ? `Next · ${dayName(previewDay.dayOfWeek)}`
      : dayName(day);
  const scheduleEntries = useMemo(() => {
    if (!scheduleDay) return [];
    return [...scheduleDay.periods]
      .sort((a, b) => a.periodNumber - b.periodNumber)
      .map((period) => ({
        period,
        entry: scheduleDay.entries.find(
          (entry) => entry.periodNumber === period.periodNumber,
        ),
      }))
      .filter((row) => row.entry)
      .slice(0, 7);
  }, [scheduleDay]);

  const teacherNames = useMemo(() => {
    const names = new Set<string>();
    for (const timetable of visibleTimetables) {
      for (const dayItem of timetable.days) {
        for (const entry of dayItem.entries) {
          if (entry.teacherName?.trim()) names.add(entry.teacherName.trim());
        }
      }
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [visibleTimetables]);

  const teacherList = classTeacher?.teacher.fullName
    ? [classTeacher.teacher.fullName, ...teacherNames.filter((name) => name !== classTeacher.teacher.fullName)]
    : teacherNames;

  const feeBalance = feeSummary?.totalBalance ?? 0;
  const feePaid = feeSummary?.totalFeesPaid ?? 0;
  const feeOwed = feeSummary?.totalFeesOwed ?? feeBalance;
  const feePct = feeOwed > 0 ? Math.min(100, Math.round((feePaid / feeOwed) * 100)) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <QuickLink href={timetableClassHref(grade.id, selectedStreamId || null)}>
          <CalendarDays className="h-3.5 w-3.5" />
          Timetable
        </QuickLink>
        <QuickLink href={studentsClassHref(grade.id, { streamId: selectedStreamId || undefined })}>
          <Users className="h-3.5 w-3.5" />
          Students
        </QuickLink>
        <QuickLink href={studentsClassHref(grade.id, { streamId: selectedStreamId || undefined, action: "add" })}>
          <Plus className="h-3.5 w-3.5" />
          Enrol
        </QuickLink>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="relative overflow-hidden border-[#246a59]/25 bg-[#0a1f1a] text-white xl:col-span-7">
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#7eb8a8]/10 blur-2xl" />
          <div className="relative p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9dcec1]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {today ? "Live now" : "Next school day"}
                </p>
                <p className="mt-1 text-[11px] text-white/50">
                  {now.toLocaleDateString("en-KE", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })}
                  {termName ? ` · ${termName}` : ""}
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium tabular-nums text-white/60">
                {formatTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`)}
              </span>
            </div>

            {timetableLoading ? (
              <div className="mt-5 space-y-3">
                <div className="h-5 w-1/2 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-white/5" />
              </div>
            ) : timetableError ? (
              <p className="mt-5 text-[12px] text-amber-200/80">
                Timetable is unavailable right now.{" "}
                <Link href={timetableClassHref(grade.id, selectedStreamId || null)} className="underline">
                  Open timetable
                </Link>
              </p>
            ) : snapshots.length === 0 ? (
              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-[12px] text-white/55">
                  No lessons are on the timetable yet for this class.
                </p>
                <Link
                  href={timetableClassHref(grade.id, selectedStreamId || null)}
                  className="shrink-0 rounded-lg bg-white px-3 py-2 text-[11px] font-semibold text-[#0a1f1a]"
                >
                  Add lessons
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {snapshots.map(({ timetable, snapshot }) => (
                  <div
                    key={`${timetable.gradeLevelId}-${timetable.streamId ?? "all"}`}
                    className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5"
                  >
                    <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-white/10 px-1 text-[9px] font-bold uppercase tracking-wide text-[#9dcec1]">
                      {streamLabel(timetable).slice(0, 3)}
                    </span>
                    <div className="min-w-0 flex-1">
                      {snapshot.kind === "lesson" ? (
                        <>
                          <p className="truncate text-[13px] font-semibold text-white">
                            {snapshot.entry.subjectName}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-white/50">
                            {snapshot.entry.teacherName}
                            {snapshot.entry.roomName ? ` · ${snapshot.entry.roomName}` : ""}
                            {" · "}
                            {formatTime(snapshot.period.startTime)}–{formatTime(snapshot.period.endTime)}
                          </p>
                        </>
                      ) : snapshot.kind === "free" ? (
                        <>
                          <p className="truncate text-[13px] font-semibold text-white/75">
                            Free period
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-white/40">
                            {snapshot.next
                              ? `Next: ${snapshot.next.entry.subjectName} at ${formatTime(snapshot.next.period.startTime)}`
                              : "No more lessons today"}
                          </p>
                        </>
                      ) : snapshot.kind === "break" ? (
                        <>
                          <p className="truncate text-[13px] font-semibold text-white/75">
                            {snapshot.name}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-white/40">
                            {snapshot.next
                              ? `Next: ${snapshot.next.entry.subjectName} at ${formatTime(snapshot.next.period.startTime)}`
                              : "No more lessons today"}
                          </p>
                        </>
                      ) : snapshot.kind === "no-school" ? (
                        (() => {
                          const nextDay = [...timetable.days]
                            .sort((a, b) => {
                              const aDelta = (a.dayOfWeek - day + 7) % 7;
                              const bDelta = (b.dayOfWeek - day + 7) % 7;
                              return aDelta - bDelta;
                            })
                            .find((item) => item.entries.length > 0);
                          const nextEntry = nextDay
                            ? [...nextDay.entries].sort(
                                (a, b) => a.periodNumber - b.periodNumber,
                              )[0]
                            : undefined;
                          const nextPeriod = nextEntry
                            ? nextDay?.periods.find(
                                (period) =>
                                  period.periodNumber === nextEntry.periodNumber,
                              )
                            : undefined;
                          return nextEntry ? (
                            <>
                              <p className="truncate text-[13px] font-semibold text-white/75">
                                Next school day · {dayName(nextDay?.dayOfWeek ?? 1)}
                              </p>
                              <p className="mt-0.5 truncate text-[10px] text-white/40">
                                {nextEntry.subjectName} at {formatTime(nextPeriod?.startTime)}
                              </p>
                            </>
                          ) : (
                            <p className="text-[12px] text-white/45">
                              No lessons today
                            </p>
                          );
                        })()
                      ) : (
                        <p className="text-[12px] text-white/45">School day complete</p>
                      )}
                    </div>
                    {snapshot.kind === "lesson" ? (
                      <span className="shrink-0 rounded-full bg-emerald-400/15 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-emerald-200">
                        In class
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {!timetableLoading && snapshots.length > 0 ? (
              <Link
                href={timetableClassHref(grade.id, selectedStreamId || null)}
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#9dcec1] hover:text-white"
              >
                Open full timetable
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            ) : null}
          </div>
        </Card>

        <Card className="xl:col-span-5">
          <div className="flex items-center justify-between gap-2 border-b border-[#1a4d42]/8 px-4 py-3.5 dark:border-white/8">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f7f5] text-[#246a59] dark:bg-white/5 dark:text-[#9dcec1]">
                <GraduationCap className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#0a1f1a] dark:text-white">Streams</p>
                <p className="text-[10px] text-[#1a4d42]/45 dark:text-white/35">
                  {grade.streams?.length ?? 0} in this grade
                </p>
              </div>
            </div>
            {selectedStreamId ? (
              <button
                type="button"
                onClick={() => onStreamSelect("")}
                className="text-[10px] font-semibold text-[#246a59] hover:underline dark:text-[#9dcec1]"
              >
                Whole grade
              </button>
            ) : null}
          </div>
          <div className="p-3">
            <div className="grid gap-1.5">
              {(grade.streams?.length ? grade.streams : [{ id: "", name: "Whole grade" }]).map((stream) => {
                const count = stream.id
                  ? allStudents.filter((student) => student.streamId === stream.id).length
                  : allStudents.length;
                const selected = selectedStreamId === stream.id;
                return (
                  <button
                    key={stream.id || "all"}
                    type="button"
                    onClick={() => onStreamSelect(stream.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
                      selected
                        ? "border-[#246a59]/30 bg-[#e8f2ef] dark:border-[#7eb8a8]/25 dark:bg-[#246a59]/15"
                        : "border-[#1a4d42]/8 hover:border-[#246a59]/20 hover:bg-[#f8fbfa] dark:border-white/8 dark:hover:bg-white/[0.03]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase",
                        selected
                          ? "bg-[#0a1f1a] text-white"
                          : "bg-[#f3f7f5] text-[#1a4d42]/55 dark:bg-white/5 dark:text-white/45",
                      )}
                    >
                      {(stream.name || "G").slice(0, 2)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-semibold text-[#0a1f1a] dark:text-white">
                        {stream.name || "Whole grade"}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-[#1a4d42]/45 dark:text-white/35">
                        {count} student{count === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span className="text-[10px] font-medium tabular-nums text-[#1a4d42]/40 dark:text-white/30">
                      {allStudents.length > 0 ? `${Math.round((count / allStudents.length) * 100)}%` : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-[#1a4d42]/8 pt-2.5 text-[10px] text-[#1a4d42]/45 dark:border-white/8 dark:text-white/35">
              <span>{activeStudents} active</span>
              <span>{allStudents.length - activeStudents} inactive</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <div className="flex items-center justify-between gap-2 border-b border-[#1a4d42]/8 px-4 py-3.5 dark:border-white/8">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f7f5] text-[#246a59] dark:bg-white/5 dark:text-[#9dcec1]">
                <CalendarDays className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
                  Today’s lessons
                </p>
                <p className="text-[10px] text-[#1a4d42]/45 dark:text-white/35">
                  {primaryTimetable ? streamLabel(primaryTimetable) : "This class"} · {scheduleDayLabel}
                </p>
              </div>
            </div>
            <Link
              href={timetableClassHref(grade.id, selectedStreamId || null)}
              className="rounded-lg border border-[#1a4d42]/10 px-2.5 py-1.5 text-[10px] font-semibold text-[#1a4d42]/60 hover:bg-[#f8fbfa] dark:border-white/10 dark:text-white/50 dark:hover:bg-white/5"
            >
              Full week
            </Link>
          </div>
          <div className="p-3">
            {timetableLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-10 animate-pulse rounded-lg bg-[#f3f7f5] dark:bg-white/5" />
                ))}
              </div>
            ) : !scheduleDay || scheduleEntries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#1a4d42]/12 px-4 py-6 text-center dark:border-white/10">
                <p className="text-[12px] font-medium text-[#0a1f1a] dark:text-white">
                  {today ? "No lessons today" : "No school day today"}
                </p>
                <p className="mt-1 text-[11px] text-[#1a4d42]/45 dark:text-white/35">
                  The weekly timetable will show here once lessons are placed.
                </p>
              </div>
            ) : (
              <div className="relative ml-1 border-l border-[#1a4d42]/10 pl-4 dark:border-white/10">
                {scheduleEntries.map(({ period, entry }) => {
                  if (!entry) return null;
                  const isNow =
                    today &&
                    now.getHours() * 60 + now.getMinutes() >= (minutes(period.startTime) ?? 0) &&
                    now.getHours() * 60 + now.getMinutes() < (minutes(period.endTime) ?? 0);
                  return (
                    <div key={period.id} className="relative pb-3 last:pb-0">
                      <span
                        className={cn(
                          "absolute -left-[1.32rem] top-1.5 h-2 w-2 rounded-full ring-4 ring-white dark:ring-[#0c1a17]",
                          isNow ? "bg-emerald-500" : "bg-[#1a4d42]/20 dark:bg-white/20",
                        )}
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-[#0a1f1a] dark:text-white">
                            {entry.subjectName}
                            {isNow ? (
                              <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                Now
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#1a4d42]/45 dark:text-white/35">
                            {entry.teacherName}
                            {entry.roomName ? ` · ${entry.roomName}` : ""}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] font-medium tabular-nums text-[#1a4d42]/40 dark:text-white/30">
                          {formatTime(period.startTime)}–{formatTime(period.endTime)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-4 xl:col-span-5">
          <Card>
            <div className="flex items-center justify-between gap-2 border-b border-[#1a4d42]/8 px-4 py-3.5 dark:border-white/8">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f7f5] text-[#246a59] dark:bg-white/5 dark:text-[#9dcec1]">
                  <UserRound className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#0a1f1a] dark:text-white">Teachers</p>
                  <p className="text-[10px] text-[#1a4d42]/45 dark:text-white/35">
                    {teacherList.length} connected to this class
                  </p>
                </div>
              </div>
              <Link
                href="/teachers"
                className="text-[10px] font-semibold text-[#246a59] hover:underline dark:text-[#9dcec1]"
              >
                All staff
              </Link>
            </div>
            <div className="p-3">
              {teacherList.length === 0 ? (
                <p className="py-3 text-center text-[11px] text-[#1a4d42]/45 dark:text-white/35">
                  No class teacher assigned yet.
                </p>
              ) : (
                <div className="space-y-1">
                  {teacherList.slice(0, 4).map((name) => (
                    <div key={name} className="flex items-center gap-2.5 rounded-lg px-1 py-1.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8f2ef] text-[9px] font-bold text-[#246a59] dark:bg-[#246a59]/20 dark:text-[#9dcec1]">
                        {initials(name)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#0a1f1a] dark:text-white">
                        {name}
                      </span>
                      {teacherList[0] === name ? (
                        <span className="rounded-full bg-[#f3f7f5] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-[#1a4d42]/45 dark:bg-white/5 dark:text-white/35">
                          Class
                        </span>
                      ) : null}
                    </div>
                  ))}
                  {teacherList.length > 4 ? (
                    <p className="px-1 pt-1 text-[10px] text-[#1a4d42]/40 dark:text-white/30">
                      +{teacherList.length - 4} more
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-2 border-b border-[#1a4d42]/8 px-4 py-3.5 dark:border-white/8">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f7f5] text-[#246a59] dark:bg-white/5 dark:text-[#9dcec1]">
                  <Wallet className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#0a1f1a] dark:text-white">Fees</p>
                  <p className="text-[10px] text-[#1a4d42]/45 dark:text-white/35">
                    {feesLoading ? "Loading…" : `${feePct}% collected`}
                  </p>
                </div>
              </div>
              <Link
                href={feesClassHref(displayName)}
                className="rounded-lg border border-[#1a4d42]/10 px-2.5 py-1.5 text-[10px] font-semibold text-[#1a4d42]/60 hover:bg-[#f8fbfa] dark:border-white/10 dark:text-white/50 dark:hover:bg-white/5"
              >
                Open fees
              </Link>
            </div>
            <div className="p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#1a4d42]/40 dark:text-white/35">
                    Outstanding
                  </p>
                  <p className="mt-1 text-[20px] font-semibold tabular-nums tracking-[-0.03em] text-[#0a1f1a] dark:text-white">
                    {formatKes(feeBalance)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#1a4d42]/40 dark:text-white/35">
                    Paid
                  </p>
                  <p className="mt-1 text-[12px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatKes(feePaid)}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#1a4d42]/8 dark:bg-white/10">
                <div
                  className={cn("h-full rounded-full", feePct >= 75 ? "bg-emerald-500" : "bg-amber-400")}
                  style={{ width: `${Math.max(feePct, feeBalance > 0 ? 3 : 0)}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-[#1a4d42]/40 dark:text-white/30">
                <span>{scopedStudents.length} students</span>
                <span>{formatKes(feeOwed)} billed</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <GradeStudentRoster
        gradeId={grade.id}
        streamId={selectedStreamId || undefined}
        displayName={displayName}
        students={scopedStudents}
      />
    </div>
  );
}

function QuickLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#1a4d42]/12 bg-white px-2.5 text-[11px] font-semibold text-[#1a4d42]/65 transition-colors hover:border-[#246a59]/30 hover:text-[#0a1f1a] dark:border-white/10 dark:bg-[#0c1a17] dark:text-white/55 dark:hover:text-white"
    >
      {children}
    </Link>
  );
}
