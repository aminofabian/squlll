"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { staffAddLink, staffPanel } from "./staff-ui";

interface StaffOverviewBarProps {
  total: number;
  active: number;
  inactive: number;
  departmentCount: number;
  isLoading?: boolean;
}

export function StaffOverviewBar({
  total,
  active,
  inactive,
  departmentCount,
  isLoading,
}: StaffOverviewBarProps) {
  if (isLoading) {
    return (
      <div className={staffPanel}>
        <div className="grid grid-cols-2 gap-px bg-[#1a4d42]/10 dark:bg-white/10 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white px-4 py-3 dark:bg-[#0c1a17]">
              <div className="h-3 w-16 animate-pulse bg-[#e8f2ef] dark:bg-white/10" />
              <div className="mt-2 h-4 w-12 animate-pulse bg-[#f3f7f5] dark:bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cells = [
    {
      label: "On staff",
      content:
        total > 0 ? (
          <p className="mt-1 text-sm font-semibold tabular-nums text-[#0a1f1a] dark:text-white">
            {total}
          </p>
        ) : (
          <div className="mt-1">
            <p className="text-xs text-[#1a4d42]/55 dark:text-white/45">
              No staff members yet.
            </p>
            <Link href="/staff?action=add" className={cn(staffAddLink, "mt-2")}>
              Add staff
              <ArrowRight className="h-3 w-3 text-white/70" />
            </Link>
          </div>
        ),
    },
    { label: "Active", value: String(active), muted: active === 0 },
    { label: "Inactive", value: String(inactive), muted: inactive === 0 },
    { label: "Departments", value: String(departmentCount), muted: false },
  ];

  return (
    <div className={staffPanel} role="group" aria-label="Staff statistics">
      <div className="grid grid-cols-2 gap-px bg-[#1a4d42]/10 dark:bg-white/10 lg:grid-cols-4">
        {cells.map((cell) => (
          <div key={cell.label} className="bg-white px-4 py-3 dark:bg-[#0c1a17]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
              {cell.label}
            </p>
            {"content" in cell && cell.content ? (
              cell.content
            ) : (
              <p
                className={cn(
                  "mt-1 text-sm font-semibold tabular-nums text-[#0a1f1a] dark:text-white",
                  cell.muted && "text-[#1a4d42]/40",
                )}
              >
                {cell.value}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
