"use client";

import Link from "next/link";
import { Banknote, Users } from "lucide-react";
import { useGradeLevelFeeSummary } from "@/lib/hooks/useGradeLevelFeeSummary";
import { cn } from "@/lib/utils";

interface ClassDetailMetricsProps {
  gradeId: string;
  streamName?: string;
  streamStudentCount?: number;
}

function formatKes(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Secondary facts — enrollment priority lives in hero when empty; fees hidden until configured. */
export function ClassDetailMetrics({
  gradeId,
  streamName,
  streamStudentCount,
}: ClassDetailMetricsProps) {
  const { data: feeSummary, isLoading: feesLoading } =
    useGradeLevelFeeSummary(gradeId);

  const studentCount =
    streamStudentCount ?? feeSummary?.totalStudents ?? 0;
  const feesOwed = feeSummary?.totalFeesOwed ?? 0;
  const showEnrollment = studentCount > 0;
  const showFees = !feesLoading && feesOwed > 0;

  if (!showEnrollment && !showFees) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100/80 pt-4 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
      {showEnrollment ? (
        <>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[#0073ea]" />
            <span>
              <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                {studentCount}
              </span>{" "}
              student{studentCount !== 1 ? "s" : ""}
              {streamName ? ` in ${streamName}` : " in this grade"}
            </span>
          </span>
          {showFees ? (
            <span className="hidden h-3 w-px bg-slate-200 sm:inline dark:bg-slate-700" />
          ) : null}
        </>
      ) : null}

      {showFees ? (
        <span className="inline-flex items-center gap-1.5">
          <Banknote className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
            {formatKes(feesOwed)}
          </span>
          <span>fees billed (grade)</span>
          <Link
            href="/fees"
            className="font-medium text-[#0073ea] hover:underline"
          >
            View fees
          </Link>
        </span>
      ) : null}
    </div>
  );
}
