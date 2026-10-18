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
import { classesPanel } from "./classes-ui";

interface ClassStatStripProps {
  studentCount: number;
  schoolStudentCount: number;
  classTeacherName?: string | null;
  assignedSubjects: number;
  totalSubjects: number;
  feeHealth: FeeHealth;
  classMean: number | null;
}

function StatCell({
  icon: Icon,
  label,
  value,
  detail,
  bar,
  className,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  detail: string;
  bar?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 border-b border-[#1a4d42]/10 px-3 py-3 dark:border-white/10 sm:border-r sm:px-4",
        className,
      )}
    >
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#1a4d42]/45 dark:text-white/40">
        <Icon className="h-3.5 w-3.5 shrink-0 text-[#246a59]/70 dark:text-emerald-300/70" />
        <span className="truncate">{label}</span>
      </p>
      <p className="mt-1.5 truncate font-display text-xl leading-none tracking-tight tabular-nums text-[#0a1f1a] dark:text-white">
        {value}
      </p>
      <p className="mt-1 truncate text-[10px] text-[#1a4d42]/50 dark:text-white/40">
        {detail}
      </p>
      {bar != null ? (
        <div className="mt-1.5 h-1 w-full overflow-hidden bg-[#1a4d42]/10 dark:bg-white/10">
          <div
            className={cn(
              "h-full transition-[width] duration-500",
              bar >= 0.85
                ? "bg-emerald-500/80"
                : bar >= 0.5
                  ? "bg-[#246a59]"
                  : "bg-amber-500/80",
            )}
            style={{
              width: `${Math.round(Math.min(1, Math.max(0, bar)) * 100)}%`,
            }}
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
    <section className={classesPanel} aria-label="Class metrics">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <StatCell
          icon={Users}
          label="Learners"
          value={String(studentCount)}
          detail={
            studentCount > 0
              ? `${Math.round(enrolmentShare * 100)}% of the school`
              : "No students yet"
          }
          bar={studentCount > 0 ? Math.min(1, enrolmentShare * 4) : 0}
        />
        <StatCell
          icon={UserRound}
          label="Class teacher"
          value={classTeacherName ? initials(classTeacherName) : "—"}
          detail={classTeacherName ?? "Not assigned"}
        />
        <StatCell
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
          bar={coverage}
        />
        <StatCell
          icon={CircleDollarSign}
          label="Fee collection"
          value={feeHealth.hasData ? `${Math.round(collection * 100)}%` : "—"}
          detail={
            feeHealth.hasData
              ? `${formatKes(feeHealth.paid)} of ${formatKes(feeHealth.billed)}`
              : "Fees not configured"
          }
          bar={collection}
        />
        <StatCell
          icon={classMean != null ? TrendingUp : GraduationCap}
          label="Class mean"
          value={classMean != null ? `${classMean.toFixed(1)}%` : "—"}
          detail={
            classMean != null ? "Latest processed exam" : "No exam results"
          }
          bar={classMean != null ? classMean / 100 : undefined}
          className="col-span-2 border-r-0 sm:col-span-1 sm:border-r lg:col-span-1 lg:border-r-0"
        />
      </div>
    </section>
  );
}
