"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  GraduationCap,
  Radio,
  UserPlus,
} from "lucide-react";
import { useTenantLiveStats } from "@/lib/realtime/useTenantLiveStats";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { getTenantInfo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { DashboardAnimatedMetric } from "./DashboardAnimatedMetric";

interface DashboardPulseHeroProps {
  studentCount: number;
  teacherCount?: number;
  streamCount?: number;
  statsLoading?: boolean;
  subdomain: string;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatSchoolLabel(subdomain: string, tenantName: string | null): string {
  if (tenantName) return tenantName;
  return subdomain
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function DashboardPulseHero({
  studentCount,
  teacherCount = 0,
  streamCount = 0,
  statsLoading,
  subdomain,
}: DashboardPulseHeroProps) {
  const { stats, loading: liveLoading } = useTenantLiveStats();
  const { connected } = useRealtime();
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const info = getTenantInfo();
    setTenantName(info?.tenantName ?? null);
  }, []);

  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleTimeString("en-KE", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const schoolLabel = formatSchoolLabel(subdomain, tenantName);
  const onlineTotal = stats.onlineTotal;
  const loading = statsLoading || liveLoading;

  const onlineSummary = useMemo(() => {
    const parts: string[] = [];
    if (stats.onlineTeachers > 0) parts.push(`${stats.onlineTeachers} teachers`);
    if (stats.onlineStudents > 0) parts.push(`${stats.onlineStudents} students`);
    if (stats.onlineParents > 0) parts.push(`${stats.onlineParents} parents`);
    if (stats.onlineStaff > 0) parts.push(`${stats.onlineStaff} staff`);
    return parts;
  }, [stats]);

  return (
    <section
      className={cn(
        "overflow-hidden border border-[#1a4d42]/12 bg-white",
        "shadow-[3px_3px_0_0_rgba(10,31,26,0.05)]",
        "dark:border-white/10 dark:bg-[#0c1a17]",
      )}
      aria-label="School overview"
    >
      <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-[#1a4d42]/10 bg-[#0a1f1a] px-3 py-2.5 text-white sm:px-4">
        <div className="min-w-0 flex items-baseline gap-2 sm:gap-3">
          <h2 className="truncate font-display text-lg tracking-tight sm:text-xl">
            {greeting()},{" "}
            <span className="text-emerald-200">{schoolLabel}</span>
          </h2>
          <p className="hidden truncate text-[11px] text-white/50 lg:block">
            {connected && onlineSummary.length > 0
              ? onlineSummary.join(" · ")
              : streamCount > 0
                ? `${streamCount} streams`
                : "School day"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <time
            dateTime={new Date().toISOString()}
            className="font-display text-lg tabular-nums text-white/90"
          >
            {clock}
          </time>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
              connected
                ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
                : "border-white/20 bg-white/10 text-white/70",
            )}
          >
            {connected ? (
              <span className="h-1.5 w-1.5 bg-emerald-300" />
            ) : (
              <Radio className="h-3 w-3" />
            )}
            {connected ? "Live" : "Syncing"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-[#1a4d42]/10 sm:grid-cols-4 sm:divide-y-0 dark:divide-white/10">
        <DashboardAnimatedMetric
          label="Students"
          value={studentCount}
          accent="success"
          loading={loading}
          emptyCta={{
            href: "/students?action=add",
            label: "Enroll first",
            icon: UserPlus,
          }}
        />
        <DashboardAnimatedMetric
          label="Teachers"
          value={teacherCount}
          loading={loading}
          emptyCta={{
            href: "/teachers?action=add",
            label: "Add teacher",
            icon: GraduationCap,
          }}
        />
        <DashboardAnimatedMetric
          label="Online now"
          value={onlineTotal}
          accent="live"
          loading={liveLoading}
        />
        <DashboardAnimatedMetric
          label="Lessons today"
          value={stats.lessonsCompletedToday}
          accent="warm"
          loading={liveLoading}
          emptyCta={{
            href: "/timetable",
            label: "Timetable",
            icon: Clock,
          }}
        />
      </div>
    </section>
  );
}
