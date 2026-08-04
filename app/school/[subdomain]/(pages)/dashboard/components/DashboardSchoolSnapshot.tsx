"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CircleDollarSign,
} from "lucide-react";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import { useCurrentAcademicYear } from "@/lib/hooks/useAcademicYears";
import { useActiveTerm } from "@/lib/hooks/useActiveTerm";
import { useStudentsSummary } from "@/lib/hooks/useStudentsSummary";
import { formatCurrency } from "@/lib/parent/parentFees";

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

export function DashboardSchoolSnapshot({
  config,
  students,
  studentCount,
  streamCount = 0,
}: DashboardSchoolSnapshotProps) {
  const { getActiveAcademicYear } = useCurrentAcademicYear();
  const { activeTerm, loading: termLoading } = useActiveTerm();
  const { students: feeRows, isLoading: feesLoading } = useStudentsSummary();

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
      .slice(0, 4)
      .map((item, index) => ({
        levelId: `level-${index}`,
        levelName: item.name,
        count: item.count,
        percent: Math.round((item.count / total) * 100),
      }));
  }, [students, gradeIdToLevelName, studentCount]);

  const maxEnrollment = enrollmentByLevel[0]?.count ?? 1;

  return (
    <div className="space-y-3">
      <div className="space-y-2.5">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-[#1a4d42]/15 bg-[#f3f7f5] text-[#246a59] dark:border-white/15 dark:bg-[#071411]">
            <BookOpen className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
              Academic year
            </p>
            {termLoading ? (
              <div className="mt-1 h-4 w-28 animate-pulse bg-[#1a4d42]/10" />
            ) : (
              <>
                <p className="truncate text-[13px] font-semibold text-[#0a1f1a] dark:text-white">
                  {activeYear?.name ?? "Not set up"}
                </p>
                <p className="text-[11px] text-[#1a4d42]/50 dark:text-white/40">
                  {activeTerm
                    ? activeTerm.name
                    : activeYear
                      ? "No current term"
                      : "Create a year"}
                </p>
              </>
            )}
          </div>
        </div>

        <Link href="/fees" className="group flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CircleDollarSign className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
              Fee collection
            </p>
            {feesLoading ? (
              <div className="mt-1 h-4 w-20 animate-pulse bg-[#1a4d42]/10" />
            ) : (
              <p className="text-[13px] font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                {finance.collectionRate}% collected
              </p>
            )}
            <p className="text-[11px] text-[#1a4d42]/50 dark:text-white/40">
              {feesLoading
                ? "Loading…"
                : finance.outstanding > 0
                  ? `${formatCurrency(finance.outstanding)} due`
                  : finance.withBalance > 0
                    ? `${finance.withBalance} with balance`
                    : "All caught up"}
            </p>
          </div>
        </Link>
      </div>

      <div className="border-t border-[#1a4d42]/10 pt-2.5 dark:border-white/10">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-[#0a1f1a] dark:text-white">
            By level
          </p>
          <span className="text-[10px] tabular-nums text-[#1a4d42]/40">
            {studentCount} · {streamCount} streams
          </span>
        </div>

        {enrollmentByLevel.length === 0 ? (
          <p className="py-2 text-[11px] text-[#1a4d42]/40">
            Enroll students to see mix by level.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {enrollmentByLevel.map((row) => (
              <li key={row.levelId}>
                <div className="mb-0.5 flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate text-[#1a4d42]/70 dark:text-white/65">
                    {row.levelName}
                  </span>
                  <span className="shrink-0 tabular-nums text-[#1a4d42]/40">
                    {row.count}
                  </span>
                </div>
                <div className="h-0.5 overflow-hidden bg-[#e8f2ef] dark:bg-white/10">
                  <div
                    className="h-full bg-[#246a59] transition-all duration-500"
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
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#246a59] hover:text-[#1a4d42]"
        >
          Open classes
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
