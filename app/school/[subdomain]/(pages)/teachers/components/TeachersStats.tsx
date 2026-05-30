"use client";

import type { ComponentType } from "react";
import { Users, CheckCircle, BookOpen, Award } from "lucide-react";
import { cn } from "@/lib/utils";

type Teacher = {
  status: "active" | "on leave" | "former" | "substitute" | "retired";
  department: string;
  performance?: { rating: number };
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
      <p className="text-xs text-slate-400">
        <span className="inline-block h-3 w-56 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      </p>
    );
  }

  const active = teachers.filter((t) => t.status === "active").length;
  const departments = new Set(teachers.map((t) => t.department)).size;

  const parts = [
    `${teachers.length} teacher${teachers.length !== 1 ? "s" : ""}`,
    `${active} active`,
    `${departments} department${departments !== 1 ? "s" : ""}`,
    ...(pendingCount > 0
      ? [`${pendingCount} pending invite${pendingCount !== 1 ? "s" : ""}`]
      : []),
  ];

  return (
    <div className="space-y-3">
      <p
        className="text-xs text-slate-500 dark:text-slate-400"
        aria-label={`Staff summary: ${parts.join(", ")}`}
      >
        <span className="font-medium text-slate-600 dark:text-slate-300">
          Summary
        </span>
        <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
        {parts.join(" · ")}
      </p>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatChip
          icon={Users}
          label="Total"
          value={teachers.length}
        />
        <StatChip
          icon={CheckCircle}
          label="Active"
          value={active}
          iconClass="text-emerald-600"
        />
        <StatChip
          icon={BookOpen}
          label="Departments"
          value={departments}
          iconClass="text-sky-600"
        />
        <StatChip
          icon={Award}
          label="Top rated"
          value={teachers.filter((t) => (t.performance?.rating ?? 0) >= 4).length}
          iconClass="text-amber-600"
        />
      </dl>
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  iconClass,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  iconClass?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-3.5 w-3.5 text-slate-400", iconClass)} />
        <dt className="text-[11px] text-slate-400">{label}</dt>
      </div>
      <dd className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">
        {value}
      </dd>
    </div>
  );
}
