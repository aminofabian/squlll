"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEES_BTN, FEES_LAYOUT } from "../../lib/fees-ui";

interface FeePlansToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
  academicYearFilter: string;
  onAcademicYearFilterChange: (value: string) => void;
  academicYears: string[];
  filteredCount: number;
  totalCount: number;
  onRefresh: () => void;
}

export function FeePlansToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  academicYearFilter,
  onAcademicYearFilterChange,
  academicYears,
  filteredCount,
  totalCount,
  onRefresh,
}: FeePlansToolbarProps) {
  const hasFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    academicYearFilter !== "all";

  const showYearChips = academicYears.length > 0 && academicYears.length <= 5;

  return (
    <div
      className={cn(
        FEES_LAYOUT.page,
        "sticky top-0 z-10 border-b border-[#1a4d42]/10 bg-[#f8fbfa]/95 px-4 py-2.5 backdrop-blur-sm sm:px-5",
      )}
    >
      <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
        {showYearChips ? (
          <div
            className={cn(
              FEES_LAYOUT.chipStrip,
              "shrink-0 gap-1 rounded-none border border-[#1a4d42]/10 bg-white p-1 lg:max-w-[50%]",
            )}
            role="tablist"
            aria-label="Filter by school year"
          >
            <YearChip
              label="All"
              selected={academicYearFilter === "all"}
              onClick={() => onAcademicYearFilterChange("all")}
            />
            {academicYears.map((year) => (
              <YearChip
                key={year}
                label={year}
                selected={academicYearFilter === year}
                onClick={() => onAcademicYearFilterChange(year)}
              />
            ))}
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a4d42]/40" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search name or year…"
              className="h-9 rounded-none border-[#1a4d42]/15 bg-white pl-9 pr-8 text-sm shadow-none focus-visible:border-[#246a59]/50 focus-visible:ring-[#246a59]/20"
            />
            {searchQuery ? (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-none p-0.5 text-[#1a4d42]/40 hover:text-[#0a1f1a]"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                onStatusFilterChange(v as "all" | "active" | "inactive")
              }
            >
              <SelectTrigger className="h-9 w-full min-w-[7rem] rounded-none border-[#1a4d42]/15 text-sm sm:w-[7.5rem]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {!showYearChips && academicYears.length > 0 ? (
              <Select
                value={academicYearFilter}
                onValueChange={onAcademicYearFilterChange}
              >
                <SelectTrigger className="h-9 w-full min-w-[8rem] rounded-none border-[#1a4d42]/15 text-sm sm:w-[8.5rem]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="all">All years</SelectItem>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}

            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(FEES_BTN.icon)}
              onClick={onRefresh}
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <p
        className="mt-1.5 text-[11px] tabular-nums text-[#1a4d42]/45"
        aria-live="polite"
      >
        {hasFilters ? (
          <>
            {filteredCount} of {totalCount} structures
            {searchQuery.trim() ? " matching search" : ""}
          </>
        ) : (
          <>{totalCount} structures · grouped by school year</>
        )}
      </p>
    </div>
  );
}

function YearChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-none px-2.5 py-1.5 text-xs font-medium transition-colors",
        selected
          ? "bg-[#0a1f1a] text-white"
          : "text-[#1a4d42]/65 hover:bg-[#f3f7f5] hover:text-[#0a1f1a]",
      )}
    >
      {label}
    </button>
  );
}
