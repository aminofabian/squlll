"use client";

import {
  BookOpen,
  CircleDollarSign,
  GraduationCap,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeeHealth } from "../utils/classPulse";
import { formatKes, initials } from "../utils/classPulse";

interface ClassStatStripProps {
  studentCount: number;
  schoolStudentCount: number;
  classTeacherName?: string | null;
  assignedSubjects: number;
  totalSubjects: number;
  feeHealth: FeeHealth;
  classMean: number | null;
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  accent,
  bar,
  className,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  detail: string;
  accent: string;
  bar?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-[#1a4d42]/12 bg-white p-3 transition-colors hover:border-[#246a59]/30 dark:border-white/10 dark:bg-[#0c1a17]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45 dark:text-white/40">
          {label}
        </span>
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
            accent,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2 truncate text-lg font-semibold leading-none tracking-tight tabular-nums text-[#0a1f1a] dark:text-white">
        {value}
      </p>
      <p className="mt-1 truncate text-[10px] text-[#1a4d42]/50 dark:text-white/40">
        {detail}
      </p>
      {bar != null ? (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#e8f2ef] dark:bg-white/10">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-500",
              bar >= 0.85
                ? "bg-emerald-500/80"
                : bar >= 0.5
                  ? "bg-[#246a59]"
                  : "bg-amber-500/80",
            )}
            style={{ width: `${Math.round(Math.min(1, Math.max(0, bar)) * 100)}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

export function ClassStatStrip({
  studentCount,
  schoolStudentCount,
  classTeacherName,
  assignedSubjects,
  totalSubjects,
  feeHealth,
  classMean,
}: ClassStatStripProps) {
  const enrolmentShare =
    schoolStudentCount > 0 ? studentCount / schoolStudentCount : 0;
  const coverage = totalSubjects > 0 ? assignedSubjects / totalSubjects : 0;
  const collection = feeHealth.collectionRate;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard
        icon={Users}
        label="Learners"
        value={String(studentCount)}
        detail={
          studentCount > 0
            ? `${Math.round(enrolmentShare * 100)}% of the school`
            : "No students yet"
        }
        accent="bg-[#246a59]/10 text-[#246a59] dark:bg-[#246a59]/25 dark:text-[#8fe3c8]"
        bar={studentCount > 0 ? Math.min(1, enrolmentShare * 4) : 0}
      />
      <StatCard
        icon={UserRound}
        label="Class teacher"
        value={classTeacherName ? initials(classTeacherName) : "—"}
        detail={classTeacherName ?? "Not assigned"}
        accent="bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300"
      />
      <StatCard
        icon={BookOpen}
        label="Subjects"
        value={
          totalSubjects > 0 ? `${assignedSubjects}/${totalSubjects}` : "—"
        }
        detail={
          totalSubjects === 0
            ? "Curriculum not set"
            : coverage >= 1
              ? "All staffed"
              : `${Math.round(coverage * 100)}% staffed`
        }
        accent="bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300"
        bar={coverage}
      />
      <StatCard
        icon={CircleDollarSign}
        label="Fee collection"
        value={feeHealth.hasData ? `${Math.round(collection * 100)}%` : "—"}
        detail={
          feeHealth.hasData
            ? `${formatKes(feeHealth.paid)} of ${formatKes(feeHealth.billed)}`
            : "Fees not configured"
        }
        accent="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
        bar={collection}
      />
      <StatCard
        icon={classMean != null ? TrendingUp : GraduationCap}
        label="Class mean"
        value={classMean != null ? `${classMean.toFixed(1)}%` : "—"}
        detail={classMean != null ? "Latest processed exam" : "No exam results"}
        accent="bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300"
        bar={classMean != null ? classMean / 100 : undefined}
        className="col-span-2 sm:col-span-1"
      />
    </div>
  );
}
