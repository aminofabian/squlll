"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardGradeEmptyStateProps {
  gradeName: string;
}

export function DashboardGradeEmptyState({
  gradeName,
}: DashboardGradeEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200/80 bg-white px-6 py-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
      <p className="text-sm text-slate-500">
        No students in {gradeName} yet
      </p>
      <Button asChild size="sm" variant="outline" className="mt-4">
        <Link href="/students?action=add">Add student</Link>
      </Button>
    </div>
  );
}
