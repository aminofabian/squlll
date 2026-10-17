"use client";

import { useMemo } from "react";
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  CircleDollarSign,
  Smartphone,
  Users,
} from "lucide-react";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import { useCurrentAcademicYear } from "@/lib/hooks/useAcademicYears";
import { useStudentsSummary } from "@/lib/hooks/useStudentsSummary";
import { formatCurrency } from "@/lib/parent/parentFees";
import { readIsSchoolOwner } from "@/lib/school/isSchoolOwner";
import { useTerm } from "../../contexts/TermContext";
import { OwnerPaymentsDrawer } from "./OwnerPaymentsDrawer";
import Link from "next/link";

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
  const { selectedTerm: activeTerm, termsLoading: termLoading } = useTerm();
  const { students: feeRows, isLoading: feesLoading } = useStudentsSummary();
  const isOwner = useMemo(() => readIsSchoolOwner(), []);

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

    return { collected, outstanding, withBalance, collectionRate, gross };
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

  const feeDetail =
    finance.gross === 0
      ? "No fees assigned yet"
      : finance.outstanding > 0
        ? `${formatCurrency(finance.outstanding)} due`
        : finance.withBalance > 0
          ? `${finance.withBalance} with balance`
          : "All caught up";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex min-h-[88px] flex-col justify-between border border-[#1a4d42]/10 bg-[#f8fbfa] p-2.5 dark:border-white/10 dark:bg-[#071411]">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-[#246a59] dark:text-emerald-300" strokeWidth={1.75} />
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45 dark:text-white/40">
              Academic year
            </p>
          </div>
          {termLoading ? (
            <div className="mt-2 h-5 w-20 animate-pulse bg-[#1a4d42]/10" />
          ) : (
            <>
              <p className="mt-1.5 truncate font-display text-lg leading-none tracking-tight text-[#0a1f1a] dark:text-white">
                {activeYear?.name ?? "Not set"}
              </p>
              <p className="mt-1 truncate text-[10.5px] text-[#1a4d42]/50 dark:text-white/40">
                {activeTerm
                  ? activeTerm.name
                  : activeYear
                    ? "No current term"
                    : "Create a year"}
              </p>
            </>
          )}
        </div>

        <Link
          href="/fees"
          className="group flex min-h-[88px] flex-col justify-between border border-[#1a4d42]/10 bg-[#f8fbfa] p-2.5 transition-colors hover:border-[#246a59]/30 hover:bg-white dark:border-white/10 dark:bg-[#071411] dark:hover:bg-white/[0.03]"
        >
          <div className="flex items-center gap-1.5">
            <CircleDollarSign className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" strokeWidth={1.75} />
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45 dark:text-white/40">
              Fee collection
            </p>
          </div>
          {feesLoading ? (
            <div className="mt-2 h-5 w-16 animate-pulse bg-[#1a4d42]/10" />
          ) : (
            <>
              <p className="mt-1.5 font-display text-lg leading-none tracking-tight tabular-nums text-emerald-700 dark:text-emerald-300">
                {finance.collectionRate}%
              </p>
              <div className="mt-2 h-1 overflow-hidden bg-[#e8f2ef] dark:bg-white/10">
                <div
                  className="h-full bg-[#246a59] transition-all duration-500 dark:bg-emerald-300"
                  style={{ width: `${finance.collectionRate > 0 ? Math.max(3, finance.collectionRate) : 0}%` }}
                />
              </div>
              <p className="mt-1 truncate text-[10.5px] text-[#1a4d42]/50 transition-colors group-hover:text-[#246a59] dark:text-white/40 dark:group-hover:text-emerald-300">
                {feeDetail}
              </p>
            </>
          )}
        </Link>
      </div>

      {isOwner ? (
        <OwnerPaymentsDrawer
          trigger={
            <button
              type="button"
              className="group flex w-full items-center gap-2.5 border border-[#1a4d42]/10 bg-white p-2.5 text-left transition-colors hover:border-[#246a59]/30 hover:bg-[#f8fbfa] dark:border-white/10 dark:bg-[#0c1a17] dark:hover:bg-white/[0.03]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#1a4d42]/12 bg-[#f8fbfa] text-[#246a59] transition-colors group-hover:border-[#246a59]/30 group-hover:bg-[#0a1f1a] group-hover:text-white dark:border-white/10 dark:bg-[#071411] dark:text-emerald-300">
                <Smartphone className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45 dark:text-white/40">
                  Payment methods
                </span>
                <span className="mt-0.5 block truncate text-[12px] font-semibold text-[#0a1f1a] dark:text-white">
                  Till · paybill · bank
                </span>
                <span className="mt-0.5 block truncate text-[10.5px] text-[#1a4d42]/50 transition-colors group-hover:text-[#246a59] dark:text-white/40">
                  Owner settings
                </span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#1a4d42]/25 transition-transform group-hover:translate-x-0.5 dark:text-white/25" />
            </button>
          }
        />
      ) : null}

      <div className="border-t border-[#1a4d42]/10 pt-3 dark:border-white/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[#246a59] dark:text-emerald-300" strokeWidth={1.75} />
            <p className="text-[11px] font-semibold text-[#0a1f1a] dark:text-white">
              Enrollment by level
            </p>
          </div>
          <span className="text-[10px] tabular-nums text-[#1a4d42]/40 dark:text-white/35">
            {studentCount} students · {streamCount} streams
          </span>
        </div>

        {enrollmentByLevel.length === 0 ? (
          <div className="mt-2.5 border border-dashed border-[#1a4d42]/15 px-3 py-4 text-center dark:border-white/15">
            <p className="text-[11px] leading-relaxed text-[#1a4d42]/45 dark:text-white/40">
              Enrollment mix will appear once students are added.
            </p>
            <Link
              href="/students?action=add"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#246a59] hover:text-[#1a4d42] dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              Add students
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <ul className="mt-2.5 space-y-2">
            {enrollmentByLevel.map((row) => (
              <li key={row.levelId}>
                <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate text-[#1a4d42]/70 dark:text-white/60">
                    {row.levelName}
                  </span>
                  <span className="shrink-0 tabular-nums text-[#1a4d42]/40 dark:text-white/35">
                    {row.count}
                  </span>
                </div>
                <div className="h-1 overflow-hidden bg-[#e8f2ef] dark:bg-white/10">
                  <div
                    className="h-full bg-[#246a59] transition-all duration-500 dark:bg-emerald-300"
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
          className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#246a59] hover:text-[#1a4d42] dark:text-emerald-300 dark:hover:text-emerald-200"
        >
          Open classes
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
