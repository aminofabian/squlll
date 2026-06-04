"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpenCheck,
  GraduationCap,
  Radio,
  Sparkles,
  Users,
  UserCircle,
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

  const rolePills = useMemo(
    () =>
      [
        { label: "Teachers", count: stats.onlineTeachers, icon: GraduationCap },
        { label: "Students", count: stats.onlineStudents, icon: Users },
        { label: "Parents", count: stats.onlineParents, icon: UserCircle },
        { label: "Staff", count: stats.onlineStaff, icon: Sparkles },
      ].filter((r) => r.count > 0),
    [stats],
  );

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/70 shadow-sm",
        "bg-gradient-to-br from-[#0073ea]/[0.07] via-white to-emerald-50/40",
        "dark:border-slate-800 dark:from-[#0073ea]/15 dark:via-slate-900 dark:to-emerald-950/20",
      )}
      aria-label="School pulse"
    >
      <div
        className="pointer-events-none absolute -left-12 top-0 h-40 w-40 rounded-full bg-[#0073ea]/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-8 right-0 h-36 w-36 rounded-full bg-emerald-400/15 blur-3xl"
        aria-hidden
      />

      <div className="relative border-b border-white/60 px-4 py-4 dark:border-slate-800/80 sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0073ea]/80 dark:text-[#5ba3ff]">
              {greeting()}
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
              {schoolLabel}
            </h2>
            <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
              Your school is active — stats and events update as things happen.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="font-mono text-sm tabular-nums text-slate-600 dark:text-slate-300">
              {clock}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm",
                connected
                  ? "bg-emerald-500 text-white"
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
          </div>
        </div>

        {rolePills.length > 0 && connected ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {rolePills.map((pill) => {
              const Icon = pill.icon;
              return (
                <span
                  key={pill.label}
                  className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/70 px-2 py-0.5 text-[10px] font-medium text-slate-700 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200"
                >
                  <Icon className="h-3 w-3 text-slate-400" />
                  {pill.count} {pill.label.toLowerCase()} online
                </span>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="relative grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 sm:gap-2.5 sm:p-4">
        <DashboardAnimatedMetric
          label="Students"
          value={studentCount}
          accent="success"
          loading={loading}
        />
        <DashboardAnimatedMetric
          label="Teachers"
          value={teacherCount}
          loading={loading}
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
        />
      </div>

      {streamCount > 0 ? (
        <p className="border-t border-slate-100/80 px-4 py-2 text-center text-[10px] text-slate-400 dark:border-slate-800">
          {streamCount} class stream{streamCount !== 1 ? "s" : ""} configured
        </p>
      ) : null}
    </section>
  );
}
