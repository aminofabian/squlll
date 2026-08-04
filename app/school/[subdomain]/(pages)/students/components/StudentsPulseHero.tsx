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
        "relative overflow-hidden rounded-none border border-[#1a4d42]/12",
        "bg-gradient-to-br from-[#246a59]/[0.06] via-[#f8fbfa] to-[#f3f7f5]",
        "dark:border-white/10 dark:from-[#246a59]/12 dark:via-[#0c1a17] dark:to-[#071411]",
      )}
      aria-label="Student roster overview"
    >
      <div className="relative border-b border-[#1a4d42]/10 px-3.5 py-3 dark:border-white/10 sm:px-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#246a59]">
              Student roster
            </p>
            <h2 className="mt-1 font-display text-lg tracking-tight text-[#0a1f1a] dark:text-white">
              {total === 0 ? "Build your enrollment" : `${total} enrolled`}
            </h2>
            <p className="mt-1 max-w-md text-xs text-[#1a4d42]/55 dark:text-white/45">
              {total === 0
                ? "Add learners to unlock fees, attendance, and parent access."
                : "Search, filter, and open any profile — numbers update as your school grows."}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-none px-2.5 py-1 text-[11px] font-semibold",
                connected
                  ? "bg-[#246a59] text-white"
                  : "bg-[#e8f2ef] text-[#1a4d42]/70 dark:bg-white/10 dark:text-white/60",
              )}
            >
              {connected ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-none bg-white/70 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-none bg-white" />
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

      <div className="relative grid grid-cols-2 gap-2 p-2.5 sm:grid-cols-4 sm:gap-2 sm:p-3">
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

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1a4d42]/10 px-3.5 py-2 text-[11px] dark:border-white/10 sm:px-4">
        <span className="text-[#1a4d42]/45">
          <span className="font-medium text-[#0a1f1a] dark:text-white/70">
            {gradeCount}
          </span>{" "}
          grade{gradeCount !== 1 ? "s" : ""} with students
          {inactive > 0 ? (
            <>
              {" "}
              ·{" "}
              <button
                type="button"
                className="font-medium text-[#0a1f1a] underline-offset-2 hover:underline dark:text-white/70"
                onClick={() => onFilterSelect?.("inactive")}
              >
                {inactive} inactive
              </button>
            </>
          ) : null}
        </span>
        <span className="inline-flex items-center gap-1 text-[#1a4d42]/45">
          <Users className="h-3 w-3" />
          Portal-ready profiles
        </span>
      </div>
    </section>
  );
}
