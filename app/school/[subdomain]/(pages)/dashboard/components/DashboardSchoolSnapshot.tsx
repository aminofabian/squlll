"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarRange,
  CircleDollarSign,
  Layers,
  LayoutGrid,
  TrendingUp,
  Users,
} from "lucide-react";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import { useCurrentAcademicYear } from "@/lib/hooks/useAcademicYears";
import { useActiveTerm } from "@/lib/hooks/useActiveTerm";
import { useStudentsSummary } from "@/lib/hooks/useStudentsSummary";
import { useTenantLiveStats } from "@/lib/realtime/useTenantLiveStats";
import { formatCurrency } from "@/lib/parent/parentFees";
import { cn } from "@/lib/utils";

interface StudentLike {
  grade?: {
    gradeLevel?: { id?: string; name?: string };
  } | string;
}

interface DashboardSchoolSnapshotProps {
  config: SchoolConfiguration | null;
  students: StudentLike[];
  studentCount: number;
  streamCount?: number;
}

interface LevelEnrollment {
  levelId: string;
  levelName: string;
  count: number;
  percent: number;
}

const workspaceLinks = [
  {
    href: "/fees",
    label: "Fees & balances",
    description: "Collections and arrears",
    icon: CircleDollarSign,
    accent: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    href: "/classes",
    label: "Classes",
    description: "Grades, streams, rosters",
    icon: LayoutGrid,
    accent: "text-[#0073ea] bg-[#0073ea]/10",
  },
  {
    href: "/timetable",
    label: "Timetable",
    description: "Schedules and periods",
    icon: CalendarRange,
    accent: "text-violet-600 bg-violet-50 dark:bg-violet-950/40",
  },
  {
    href: "/students",
    label: "Students",
    description: "Profiles and admissions",
    icon: Users,
    accent: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
  },
] as const;

export function DashboardSchoolSnapshot({
  config,
  students,
  studentCount,
  streamCount = 0,
}: DashboardSchoolSnapshotProps) {
  const { getActiveAcademicYear } = useCurrentAcademicYear();
  const { activeTerm, loading: termLoading } = useActiveTerm();
  const { students: feeRows, isLoading: feesLoading } = useStudentsSummary();
  const { stats: liveStats } = useTenantLiveStats();

  const activeYear = getActiveAcademicYear();

  const finance = useMemo(() => {
    let collected = 0;
    let outstanding = 0;
    let withBalance = 0;

    for (const row of feeRows) {
      const paid = row.feeSummary?.totalPaid ?? 0;
      const balance = Math.max(0, row.feeSummary?.balance ?? 0);
      collected += paid;
      outstanding += balance;
      if (balance > 0) withBalance += 1;
    }

    const gross = collected + outstanding;
    const collectionRate = gross > 0 ? Math.round((collected / gross) * 100) : 0;

    return { collected, outstanding, withBalance, collectionRate };
  }, [feeRows]);

  const gradeIdToLevelName = useMemo(() => {
    const map = new Map<string, string>();
    for (const level of config?.selectedLevels ?? []) {
      for (const grade of level.gradeLevels ?? []) {
        map.set(grade.id, level.name);
      }
    }
    return map;
  }, [config?.selectedLevels]);

  const enrollmentByLevel = useMemo((): LevelEnrollment[] => {
    const counts = new Map<string, { name: string; count: number }>();

    for (const student of students) {
      if (typeof student.grade === "string" || !student.grade?.gradeLevel?.id) {
        continue;
      }
      const gradeId = student.grade.gradeLevel.id;
      const levelName = gradeIdToLevelName.get(gradeId) ?? "Other";
      const key = levelName;
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { name: levelName, count: 1 });
      }
    }

    const total = studentCount || 1;
    return [...counts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item, index) => ({
        levelId: `level-${index}`,
        levelName: item.name,
        count: item.count,
        percent: Math.round((item.count / total) * 100),
      }));
  }, [students, gradeIdToLevelName, studentCount]);

  const maxEnrollment = enrollmentByLevel[0]?.count ?? 1;

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 to-white p-3 dark:border-slate-700 dark:from-slate-800/30 dark:to-slate-900/40">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Academic year
              </p>
              {termLoading ? (
                <div className="mt-2 h-5 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              ) : (
                <>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {activeYear?.name ?? "Not set up"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {activeTerm
                      ? `Current term · ${activeTerm.name}`
                      : activeYear
                        ? "Pick a current term in settings"
                        : "Create an academic year to get started"}
                  </p>
                </>
              )}
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0073ea]/10 text-[#0073ea]">
              <BookOpen className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2.5 text-[11px] text-slate-500">
            <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-300">
              {liveStats.lessonsCompletedToday}
            </span>{" "}
            lesson{liveStats.lessonsCompletedToday === 1 ? "" : "s"} completed today
          </p>
        </div>

        <Link
          href="/fees"
          className="group rounded-xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 to-white p-3 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-emerald-900/50 dark:from-emerald-950/25 dark:to-slate-900/40"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700/80 dark:text-emerald-400">
                Fee collection
              </p>
              {feesLoading ? (
                <div className="mt-2 h-6 w-24 animate-pulse rounded bg-emerald-100/80 dark:bg-emerald-900/30" />
              ) : (
                <p className="mt-1 text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                  {finance.collectionRate}%
                </p>
              )}
              <p className="mt-0.5 text-[11px] text-slate-500">
                {feesLoading
                  ? "Loading balances…"
                  : finance.withBalance > 0
                    ? `${finance.withBalance} student${finance.withBalance === 1 ? "" : "s"} with balance`
                    : "Everyone caught up"}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 transition-colors group-hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          {!feesLoading && finance.outstanding > 0 ? (
            <p className="mt-2 text-[11px] font-medium text-rose-600 dark:text-rose-400">
              {formatCurrency(finance.outstanding)} outstanding
            </p>
          ) : null}
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-3 dark:border-slate-700 dark:bg-slate-800/20">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              Students by level
            </p>
          </div>
          <span className="text-[10px] tabular-nums text-slate-400">
            {studentCount} enrolled · {streamCount} stream{streamCount === 1 ? "" : "s"}
          </span>
        </div>

        {enrollmentByLevel.length === 0 ? (
          <p className="py-3 text-center text-xs text-slate-400">
            Enroll students to see how your school fills up by level.
          </p>
        ) : (
          <ul className="space-y-2">
            {enrollmentByLevel.map((row) => (
              <li key={row.levelId}>
                <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate font-medium text-slate-600 dark:text-slate-300">
                    {row.levelName}
                  </span>
                  <span className="shrink-0 tabular-nums text-slate-400">
                    {row.count} · {row.percent}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-[#0073ea] transition-all duration-500"
                    style={{
                      width: `${Math.max(8, (row.count / maxEnrollment) * 100)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/classes"
          className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#0073ea] hover:underline"
        >
          Open classes
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2">
        {workspaceLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-2.5 py-2 transition-all",
                "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900/50",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  item.accent,
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {item.label}
                </span>
                <span className="block truncate text-[10px] text-slate-400">
                  {item.description}
                </span>
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#0073ea]" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
