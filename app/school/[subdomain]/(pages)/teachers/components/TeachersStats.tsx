"use client";

import { cn } from "@/lib/utils";
import { teachersPanel } from "./teachers-ui";

type Teacher = {
  status: "active" | "inactive" | "on leave" | "former" | "substitute" | "retired";
  department: string;
};

interface TeachersStatsProps {
  teachers: Teacher[];
  pendingCount?: number;
  isLoading?: boolean;
}

function Stat({
  label,
  value,
  warn,
}: {
  label: string;
  value: number;
  warn?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#1a4d42]/45">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-sm font-semibold tabular-nums",
          warn ? "text-amber-700" : "text-[#0a1f1a] dark:text-white",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function TeachersStats({
  teachers,
  pendingCount = 0,
  isLoading,
}: TeachersStatsProps) {
  if (isLoading) {
    return (
      <div
        className={cn(teachersPanel, "h-12 animate-pulse bg-[#e8f2ef]/60")}
      />
    );
  }

  const active = teachers.filter((t) => t.status === "active").length;
  const needsSetup = teachers.filter((t) => t.status === "inactive").length;
  const departments = new Set(teachers.map((t) => t.department)).size;

  return (
    <section
      className={cn(teachersPanel, "bg-[#f8fbfa] dark:bg-[#0c1a17]")}
      aria-label="Teachers overview"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base tracking-tight text-[#0a1f1a] dark:text-white">
            {teachers.length === 0
              ? "Build your staff"
              : `${teachers.length} on staff`}
          </h2>
          <p className="mt-0.5 text-[11px] text-[#1a4d42]/50">
            {needsSetup > 0
              ? `${needsSetup} awaiting activation`
              : "Everyone activated"}
            {" · "}
            open a row for profile & schedule
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          <Stat label="Staff" value={teachers.length} />
          <Stat label="Active" value={active} />
          <Stat label="Depts" value={departments} />
          <Stat
            label="Invites"
            value={pendingCount}
            warn={pendingCount > 0}
          />
        </div>
      </div>
    </section>
  );
}
