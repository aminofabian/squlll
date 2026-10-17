"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpenCheck,
  Clock,
  GraduationCap,
  Radio,
  UserPlus,
  Users,
} from "lucide-react";
import { useTenantLiveStats } from "@/lib/realtime/useTenantLiveStats";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { cn } from "@/lib/utils";
import { DashboardAnimatedMetric } from "./DashboardAnimatedMetric";

interface DashboardPulseHeroProps {
  studentCount: number;
  teacherCount?: number;
  streamCount?: number;
  statsLoading?: boolean;
  subdomain: string;
  schoolName?: string;
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

function todayLabel(): string {
  return new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function DashboardPulseHero({
  studentCount,
  teacherCount = 0,
  streamCount = 0,
  statsLoading,
  subdomain,
  schoolName,
}: DashboardPulseHeroProps) {
  const { stats, loading: liveLoading } = useTenantLiveStats();
  const { connected } = useRealtime();
  const [clock, setClock] = useState("");

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

  const schoolLabel = formatSchoolLabel(subdomain, schoolName ?? null);
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

  const presenceLine = useMemo(() => {
    if (onlineSummary.length > 0) return onlineSummary.join(" · ");
    if (onlineTotal > 0) {
      return `${onlineTotal} ${onlineTotal === 1 ? "person" : "people"} online`;
    }
    return "No one online right now";
  }, [onlineSummary, onlineTotal]);

  const onlineHint = useMemo(() => {
    if (onlineSummary.length > 0) return onlineSummary.join(" · ");
    if (onlineTotal > 0) return "Only you are online";
    return "No one online right now";
  }, [onlineSummary, onlineTotal]);

  return (
    <section
      className={cn(
        "overflow-hidden border border-[#1a4d42]/12 bg-white",
        "shadow-[3px_3px_0_0_rgba(10,31,26,0.05)]",
        "dark:border-white/10 dark:bg-[#0c1a17]",
      )}
      aria-label="School overview"
    >
      <div className="relative overflow-hidden border-b border-white/10 bg-[#0a1f1a] px-4 py-4 text-white sm:px-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 55% 120% at 92% -20%, rgba(36,106,89,0.75), transparent 62%), radial-gradient(ellipse 40% 80% at 0% 120%, rgba(200,169,106,0.18), transparent 60%), linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "auto, auto, 56px 56px, 56px 56px",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c8a96a]/70 to-transparent"
        />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#e6c98e]">
              {todayLabel()}
            </p>
            <h2 className="mt-1.5 truncate font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-tight tracking-tight">
              {greeting()},{" "}
              <span className="text-[#e6c98e]">{schoolLabel}</span>
            </h2>
            <p className="mt-1.5 flex items-center gap-2 text-[11px] text-white/45">
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0",
                  connected ? "bg-emerald-300" : "bg-white/30",
                )}
                aria-hidden
              />
              <span className="truncate">
                {presenceLine}
                {streamCount > 0 ? ` · ${streamCount} streams` : ""}
              </span>
            </p>
          </div>

          <div className="flex w-full items-center justify-end gap-3 sm:w-auto sm:gap-4">
            <div className="text-right">
              <time
                dateTime={new Date().toISOString()}
                className="font-display text-xl leading-none tabular-nums text-white/90 sm:text-2xl"
              >
                {clock}
              </time>
              <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
                Local time
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em]",
                connected
                  ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                  : "border-white/15 bg-white/[0.06] text-white/60",
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
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-[#1a4d42]/10 sm:grid-cols-4 sm:divide-y-0 dark:divide-white/10">
        <DashboardAnimatedMetric
          label="Students"
          value={studentCount}
          icon={Users}
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
          icon={GraduationCap}
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
          icon={Radio}
          accent="live"
          loading={liveLoading}
          hint={onlineHint}
        />
        <DashboardAnimatedMetric
          label="Lessons today"
          value={stats.lessonsCompletedToday}
          icon={BookOpenCheck}
          accent="warm"
          loading={liveLoading}
          hint="Marked complete"
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
