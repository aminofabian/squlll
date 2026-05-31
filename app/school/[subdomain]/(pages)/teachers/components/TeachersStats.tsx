"use client";

import type { ComponentType } from "react";
import { Users, CheckCircle, BookOpen, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

type Teacher = {
  status: "active" | "inactive" | "on leave" | "former" | "substitute" | "retired";
  department: string;
};

interface TeachersStatsProps {
  teachers: Teacher[];
  pendingCount?: number;
  isLoading?: boolean;
}

export function TeachersStats({
  teachers,
  pendingCount = 0,
  isLoading,
}: TeachersStatsProps) {
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

  const active = teachers.filter((t) => t.status === "active").length;
  const needsSetup = teachers.filter((t) => t.status === "inactive").length;
  const departments = new Set(teachers.map((t) => t.department)).size;
  const activationRate =
    teachers.length > 0 ? Math.round((active / teachers.length) * 100) : 0;

  const stats = [
    {
      icon: Users,
      label: "On staff",
      value: teachers.length,
      hint: needsSetup > 0 ? `${needsSetup} awaiting activation` : "Everyone activated",
      accent: "text-slate-600",
      bar: null as number | null,
    },
    {
      icon: CheckCircle,
      label: "Active",
      value: active,
      hint: `${activationRate}% of staff`,
      accent: "text-emerald-600",
      bar: activationRate,
    },
    {
      icon: BookOpen,
      label: "Departments",
      value: departments,
      hint: departments === 1 ? "Single department" : "Across school",
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
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={cn("h-3.5 w-3.5 shrink-0 text-slate-400", accent)} />
          <span className="truncate text-xs text-slate-500">{label}</span>
        </div>
      </div>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-slate-400">{hint}</p>
      {bar !== null && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${bar}%` }}
          />
        </div>
      )}
    </div>
  );
}
