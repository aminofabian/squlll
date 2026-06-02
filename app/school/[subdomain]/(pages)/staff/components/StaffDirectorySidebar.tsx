"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Staff } from "../hooks/useStaff";
import {
  formatStaffLabel,
  staffDisplayName,
} from "../utils/staff-utils";
import {
  staffDirectoryMeta,
  staffGhostButton,
  staffSearchClearBtn,
  staffSearchInput,
  staffSidebarItem,
} from "./staff-ui";

interface StaffDirectorySidebarProps {
  staff: Staff[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedStaffId: string | null;
  onStaffSelect: (staffId: string) => void;
  displayedCount: number;
  onLoadMore: () => void;
  isLoading?: boolean;
}

function StaffInitials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200/60 text-[11px] font-semibold text-slate-600 dark:bg-slate-700/60 dark:text-slate-300">
      {initials || "?"}
    </div>
  );
}

export function StaffDirectorySidebar({
  staff,
  searchTerm,
  onSearchChange,
  selectedStaffId,
  onStaffSelect,
  displayedCount,
  onLoadMore,
  isLoading = false,
}: StaffDirectorySidebarProps) {
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return staff;
    const q = searchTerm.toLowerCase();
    return staff.filter(
      (member) =>
        staffDisplayName(member).toLowerCase().includes(q) ||
        (member.email?.toLowerCase().includes(q) ?? false) ||
        (member.employeeId?.toLowerCase().includes(q) ?? false) ||
        (member.department?.toLowerCase().includes(q) ?? false) ||
        (member.role?.toLowerCase().includes(q) ?? false),
    );
  }, [staff, searchTerm]);

  const visible = filtered.slice(0, displayedCount);
  const activeCount = staff.filter((member) => member.isActive).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col pt-1">
      <div className="relative mb-3 shrink-0">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search name, role, ID…"
          className={staffSearchInput}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          autoComplete="off"
          aria-label="Search staff"
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className={staffSearchClearBtn}
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <div className={staffDirectoryMeta}>
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Directory
        </p>
        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {staff.length}
          </span>{" "}
          staff ·{" "}
          <span className="text-primary">{activeCount} active</span>
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-0.5">
        {isLoading ? (
          <p className="py-8 text-center text-xs text-slate-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center">
            <User className="mx-auto mb-2 h-5 w-5 text-slate-300 dark:text-slate-600" />
            <p className="text-xs text-slate-400">
              {searchTerm ? "No matches" : "No staff in this view"}
            </p>
          </div>
        ) : (
          visible.map((member) => {
            const isSelected = member.id === selectedStaffId;
            const highlight = !member.hasCompletedProfile;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => onStaffSelect(member.id)}
                className={staffSidebarItem(isSelected, highlight)}
              >
                <div className="flex items-center gap-2.5">
                  <StaffInitials name={staffDisplayName(member)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {staffDisplayName(member)}
                      </span>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          member.isActive ? "bg-emerald-500" : "bg-amber-400",
                        )}
                      />
                    </div>
                    <p className="truncate text-[11px] text-slate-400">
                      {formatStaffLabel(member.role)}
                      {member.department
                        ? ` · ${formatStaffLabel(member.department)}`
                        : ""}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {filtered.length > displayedCount ? (
        <div className="mt-2 shrink-0 border-t border-slate-200/40 pt-2 dark:border-slate-800/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            className={staffGhostButton}
          >
            Show more ({Math.min(10, filtered.length - displayedCount)})
          </Button>
        </div>
      ) : null}
    </div>
  );
}
