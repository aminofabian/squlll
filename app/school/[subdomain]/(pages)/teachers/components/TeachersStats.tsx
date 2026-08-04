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
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[80px] animate-pulse rounded-none border border-[#1a4d42]/12 bg-white dark:border-white/10 dark:bg-[#0c1a17]"
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
      accent: "text-[#1a4d42]/60",
      bar: null as number | null,
    },
    {
      icon: CheckCircle,
      label: "Active",
      value: active,
      hint: `${activationRate}% of staff`,
      accent: "text-[#246a59]",
      bar: activationRate,
    },
    {
      icon: BookOpen,
      label: "Departments",
      value: departments,
      hint: departments === 1 ? "Single department" : "Across school",
      accent: "text-[#246a59]",
      bar: null,
    },
    {
      icon: Mail,
      label: "Pending invites",
      value: pendingCount,
      hint: pendingCount > 0 ? "Awaiting response" : "All caught up",
      accent: pendingCount > 0 ? "text-amber-600" : "text-[#1a4d42]/40",
      bar: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
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
    <div className="rounded-none border border-[#1a4d42]/12 bg-white px-3.5 py-3 dark:border-white/10 dark:bg-[#0c1a17]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className={cn("h-3.5 w-3.5 shrink-0 text-[#1a4d42]/40", accent)} />
          <span className="truncate text-xs text-[#1a4d42]/55">{label}</span>
        </div>
      </div>
      <p className="mt-1.5 font-display text-2xl tabular-nums text-[#0a1f1a] dark:text-white">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-[#1a4d42]/45">{hint}</p>
      {bar !== null && (
        <div className="mt-2 h-1 overflow-hidden rounded-none bg-[#1a4d42]/10 dark:bg-white/10">
          <div
            className="h-full rounded-none bg-[#246a59] transition-all duration-500"
            style={{ width: `${bar}%` }}
          />
        </div>
      )}
    </div>
  );
}
