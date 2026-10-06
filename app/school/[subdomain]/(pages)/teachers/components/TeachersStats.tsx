"use client";

import {
  Building2,
  Mail,
  Radio,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { cn } from "@/lib/utils";
import { teachersDotGrid, teachersInkPanel } from "./teachers-ui";

type Teacher = {
  status: "active" | "inactive" | "on leave" | "former" | "substitute" | "retired";
  department: string;
};

interface TeachersStatsProps {
  teachers: Teacher[];
  pendingCount?: number;
  isLoading?: boolean;
}

function StatTile({
  icon: Icon,
  label,
  value,
  warn,
  loading,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  warn?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="rounded-none border border-white/10 bg-white/[0.05] px-2.5 py-2 transition-colors hover:border-white/20 hover:bg-white/[0.08]">
      <div
        className={cn(
          "flex items-center gap-1.5",
          warn ? "text-amber-300/90" : "text-white/45",
        )}
      >
        <Icon className="h-3 w-3" />
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "mt-1.5 text-lg font-semibold leading-none tabular-nums",
          warn ? "text-amber-200" : "text-white",
        )}
      >
        {loading ? "—" : value}
      </p>
    </div>
  );
}

export function TeachersStats({
  teachers,
  pendingCount = 0,
  isLoading,
}: TeachersStatsProps) {
  const { connected } = useRealtime();

  if (isLoading) {
    return (
      <div
        className={cn(teachersInkPanel, "h-24 animate-pulse")}
        aria-hidden="true"
      />
    );
  }

  const active = teachers.filter((t) => t.status === "active").length;
  const needsSetup = teachers.filter((t) => t.status === "inactive").length;
  const departments = new Set(teachers.map((t) => t.department)).size;

  return (
    <section className={teachersInkPanel} aria-label="Staff overview">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={teachersDotGrid}
      />
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#246a59]/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-[#1a4d42]/40 blur-3xl" />

      <div className="relative p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                Staff pulse
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-none border px-1.5 py-0.5 text-[10px] font-semibold",
                  connected
                    ? "border-[#3fae8f]/40 bg-[#3fae8f]/15 text-[#8fe3c8]"
                    : "border-white/15 bg-white/5 text-white/55",
                )}
              >
                {connected ? (
                  <>
                    <span className="h-1.5 w-1.5 animate-pulse rounded-none bg-[#8fe3c8]" />
                    Live
                  </>
                ) : (
                  <>
                    <Radio className="h-2.5 w-2.5" />
                    Syncing
                  </>
                )}
              </span>
            </div>

            <h2 className="mt-2 font-display text-xl font-normal tracking-tight text-white sm:text-2xl">
              {teachers.length === 0
                ? "Build your staff"
                : `${teachers.length} on staff`}
            </h2>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-white/55">
              {needsSetup > 0
                ? `${needsSetup} awaiting activation`
                : "Everyone activated"}
              {" · "}
              {departments} department{departments === 1 ? "" : "s"} · open a row
              for profile &amp; schedule.
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-3 lg:grid-cols-5">
            <StatTile icon={Users} label="Staff" value={teachers.length} />
            <StatTile icon={UserCheck} label="Active" value={active} />
            <StatTile icon={ShieldCheck} label="Needs setup" value={needsSetup} />
            <StatTile icon={Building2} label="Depts" value={departments} />
            <StatTile
              icon={Mail}
              label="Invites"
              value={pendingCount}
              warn={pendingCount > 0}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
