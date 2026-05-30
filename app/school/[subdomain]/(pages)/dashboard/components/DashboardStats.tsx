"use client";

interface DashboardStatsProps {
  tenantStats?: {
    studentCount: number;
    teacherCount: number;
    streamCount: number;
    totalCount: number;
  } | null;
  isLoading?: boolean;
  studentCount?: number;
  selectedGrade?: boolean;
}

export function DashboardStats({
  tenantStats,
  isLoading,
  studentCount = 0,
  selectedGrade,
}: DashboardStatsProps) {
  if (selectedGrade) return null;

  const students = tenantStats?.studentCount ?? studentCount;
  const teachers = tenantStats?.teacherCount ?? 0;
  const streams = tenantStats?.streamCount ?? 0;

  if (isLoading) {
    return (
      <p className="text-xs text-slate-400">
        <span className="inline-block h-3 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      </p>
    );
  }

  if (students === 0 && teachers === 0) return null;

  const parts: string[] = [];
  if (students > 0) parts.push(`${students} students`);
  if (teachers > 0) parts.push(`${teachers} teachers`);
  if (streams > 0) parts.push(`${streams} streams`);

  if (parts.length === 0) return null;

  return (
    <p className="text-xs text-slate-400">{parts.join(" · ")}</p>
  );
}
