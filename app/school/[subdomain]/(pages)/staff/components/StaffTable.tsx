"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Staff } from "../hooks/useStaff";
import {
  getRoleBadgeColor,
  getStatusBadgeColor,
} from "../hooks/useStaff";
import {
  formatStaffLabel,
  staffDisplayName,
} from "../utils/staff-utils";
import { staffAddLinkLg, staffPanel, staffTh } from "./staff-ui";

interface StaffTableProps {
  staff: Staff[];
  isLoading?: boolean;
  onStaffClick?: (staffId: string) => void;
  title?: string;
  emptyMessage?: string;
  showAddAction?: boolean;
}

const PAGE_SIZE = 15;

function statusBadge(member: Staff) {
  if (member.isActive) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export function StaffTable({
  staff,
  isLoading,
  onStaffClick,
  title = "All staff",
  emptyMessage = "No staff yet",
  showAddAction = false,
}: StaffTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(staff.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = staff.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const incompleteCount = staff.filter((s) => !s.hasCompletedProfile).length;

  useEffect(() => {
    setPage(1);
  }, [staff.length]);

  const defaultDescription =
    staff.length === 0
      ? emptyMessage
      : `Click a row to view full profile · ${staff.length} shown`;

  if (isLoading) {
    return (
      <div className={staffPanel}>
        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-9 animate-pulse rounded-lg bg-slate-50 dark:bg-slate-800/60"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={staffPanel}>
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">{defaultDescription}</p>
      </div>

      {staff.length === 0 ? (
        <div className="px-4 py-14 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <User className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {emptyMessage}
          </p>
          {showAddAction ? (
            <Link href="/staff?action=add" className={cn(staffAddLinkLg, "mt-4")}>
              Add staff
              <ArrowRight className="h-3 w-3 text-white/70" />
            </Link>
          ) : null}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left dark:border-slate-800 dark:bg-slate-900/60">
                  <th className={cn(staffTh, "w-10")}>#</th>
                  <th className={staffTh}>Name</th>
                  <th className={cn(staffTh, "hidden sm:table-cell")}>Role</th>
                  <th className={staffTh}>Department</th>
                  <th className={cn(staffTh, "hidden md:table-cell")}>
                    Employee ID
                  </th>
                  <th className={staffTh}>Status</th>
                  <th className={cn(staffTh, "w-10")} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginated.map((member, index) => (
                  <tr
                    key={member.id}
                    className={cn(
                      "group cursor-pointer text-slate-700 transition-colors hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-800/40",
                      !member.hasCompletedProfile &&
                        "bg-amber-50/30 dark:bg-amber-950/10",
                    )}
                    onClick={() => onStaffClick?.(member.id)}
                  >
                    <td className="px-4 py-3 text-xs tabular-nums text-slate-400">
                      {(safePage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                        {staffDisplayName(member)}
                      </p>
                      {member.email ? (
                        <p className="truncate text-[11px] text-slate-400">
                          {member.email}
                        </p>
                      ) : null}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {member.role ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-normal",
                            getRoleBadgeColor(member.role),
                          )}
                        >
                          {formatStaffLabel(member.role)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                      {formatStaffLabel(member.department)}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-slate-500 md:table-cell">
                      {member.employeeId || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-normal",
                          member.status
                            ? getStatusBadgeColor(member.status)
                            : statusBadge(member),
                        )}
                      >
                        {formatStaffLabel(member.status) ||
                          (member.isActive ? "Active" : "Inactive")}
                      </Badge>
                    </td>
                    <td className="px-2 py-3">
                      <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {incompleteCount > 0 ? (
            <div className="flex items-center gap-2 border-t border-amber-100 bg-amber-50/50 px-4 py-2.5 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
              {incompleteCount} staff member
              {incompleteCount !== 1 ? "s have" : " has"} an incomplete profile.
            </div>
          ) : null}

          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
                className="h-8 rounded-md text-xs text-slate-500 hover:bg-slate-100/80 dark:hover:bg-slate-800/50"
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                Previous
              </Button>
              <span className="text-xs text-slate-400">
                Page {safePage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={safePage === totalPages}
                onClick={() => setPage(safePage + 1)}
                className="h-8 rounded-md text-xs text-slate-500 hover:bg-slate-100/80 dark:hover:bg-slate-800/50"
              >
                Next
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
