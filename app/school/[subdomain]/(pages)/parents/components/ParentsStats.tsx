"use client";

import type { ComponentType } from "react";
import { Users, CheckCircle, GraduationCap, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParentsStatsProps {
  parents: {
    status: "active" | "inactive";
    studentCount: number;
    grades: string[];
  }[];
  pendingCount?: number;
  isLoading?: boolean;
}

export function ParentsStats({
  parents,
  pendingCount = 0,
  isLoading,
}: ParentsStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] animate-pulse rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40"
          />
        ))}
      </div>
    );
  }

  const active = parents.filter((p) => p.status === "active").length;
  const needsSetup = parents.filter((p) => p.status === "inactive").length;
  const totalChildren = parents.reduce((sum, p) => sum + p.studentCount, 0);
  const activationRate =
    parents.length > 0 ? Math.round((active / parents.length) * 100) : 0;

  const stats = [
    {
      icon: Users,
      label: "Registered",
      value: parents.length,
      hint: needsSetup > 0 ? `${needsSetup} awaiting activation` : "All activated",
      accent: "text-slate-600",
      bar: null as number | null,
    },
    {
      icon: CheckCircle,
      label: "Active",
      value: active,
      hint: `${activationRate}% of parents`,
      accent: "text-emerald-600",
      bar: activationRate,
    },
    {
      icon: GraduationCap,
      label: "Linked children",
      value: totalChildren,
      hint: totalChildren === 1 ? "1 student linked" : "Students across families",
      accent: "text-sky-600",
      bar: null,
    },
    {
      icon: Mail,
      label: "Pending invites",
      value: pendingCount,
      hint: pendingCount > 0 ? "Awaiting response" : "All caught up",
      accent: pendingCount > 0 ? "text-amber-600" : "text-slate-400",
      bar: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
  bar,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  hint: string;
  accent?: string;
  bar: number | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-3.5 w-3.5 shrink-0 text-slate-400", accent)} />
        <span className="truncate text-xs text-slate-500">{label}</span>
      </div>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-slate-400">{hint}</p>
      {bar !== null ? (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${bar}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
