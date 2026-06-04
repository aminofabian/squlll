"use client";

import Link from "next/link";
import { AlertCircle, Radio, UserPlus, Users } from "lucide-react";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { useTenantLiveStats } from "@/lib/realtime/useTenantLiveStats";
import { DashboardAnimatedMetric } from "../../dashboard/components/DashboardAnimatedMetric";
import { cn } from "@/lib/utils";
import type { StudentFilter } from "../utils/students-utils";
import { studentsEnrollLink } from "./students-ui";

interface StudentsPulseHeroProps {
  total: number;
  active: number;
  inactive: number;
  missingClass: number;
  gradeCount: number;
  isLoading?: boolean;
  onFilterSelect?: (filter: StudentFilter) => void;
}

export function StudentsPulseHero({
  total,
  active,
  inactive,
  missingClass,
  gradeCount,
  isLoading,
  onFilterSelect,
}: StudentsPulseHeroProps) {
  const { connected } = useRealtime();
  const { stats, loading: liveLoading } = useTenantLiveStats();

  const onlineStudents = stats.onlineStudents;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/70 shadow-sm",
        "bg-gradient-to-br from-[#0073ea]/[0.06] via-white to-slate-50/80",
        "dark:border-slate-800 dark:from-[#0073ea]/12 dark:via-slate-900 dark:to-slate-950",
      )}
      aria-label="Student roster overview"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#0073ea]/10 blur-3xl"
        aria-hidden
      />

      <div className="relative border-b border-slate-100/80 px-4 py-4 dark:border-slate-800 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0073ea]/80 dark:text-[#5ba3ff]">
              Student roster
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {total === 0 ? "Build your enrollment" : `${total} enrolled`}
            </h2>
            <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
              {total === 0
                ? "Add learners to unlock fees, attendance, and parent access."
                : "Search, filter, and open any profile — numbers update as your school grows."}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                connected
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
              )}
            >
              {connected ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  Live
                </>
              ) : (
                <>
                  <Radio className="h-3 w-3" />
                  Syncing
                </>
              )}
            </span>
            {total === 0 ? (
              <Link href="/students?action=add" className={studentsEnrollLink}>
                <UserPlus className="h-3 w-3" />
                Enroll student
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 sm:gap-2.5 sm:p-4">
        <DashboardAnimatedMetric
          label="Enrolled"
          value={total}
          accent="success"
          loading={isLoading}
        />
        <DashboardAnimatedMetric
          label="Active"
          value={active}
          loading={isLoading}
        />
        <button
          type="button"
          className="text-left"
          onClick={() => onFilterSelect?.("missing-class")}
          disabled={missingClass === 0}
        >
          <DashboardAnimatedMetric
            label="Needs class"
            value={missingClass}
            accent={missingClass > 0 ? "warm" : "default"}
            loading={isLoading}
            className={cn(
              missingClass > 0 &&
                "cursor-pointer hover:ring-amber-300/50",
            )}
          >
            {missingClass > 0 && !isLoading ? (
              <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-3 w-3" />
                Tap to review
              </p>
            ) : undefined}
          </DashboardAnimatedMetric>
        </button>
        <DashboardAnimatedMetric
          label="Online now"
          value={onlineStudents}
          accent="live"
          loading={liveLoading}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100/80 px-4 py-2.5 text-[11px] dark:border-slate-800 sm:px-5">
        <span className="text-slate-400">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {gradeCount}
          </span>{" "}
          grade{gradeCount !== 1 ? "s" : ""} with students
          {inactive > 0 ? (
            <>
              {" "}
              ·{" "}
              <button
                type="button"
                className="font-medium text-slate-600 underline-offset-2 hover:underline dark:text-slate-300"
                onClick={() => onFilterSelect?.("inactive")}
              >
                {inactive} inactive
              </button>
            </>
          ) : null}
        </span>
        <span className="inline-flex items-center gap-1 text-slate-400">
          <Users className="h-3 w-3" />
          Portal-ready profiles
        </span>
      </div>
    </section>
  );
}
