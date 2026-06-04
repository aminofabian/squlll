"use client";

import { Download, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FEES_BTN, FEES_LAYOUT } from "../lib/fees-ui";

export type ClassLinksFilter =
  | "all"
  | "ready"
  | "needs_students"
  | "inactive";

export type FilterCounts = Record<ClassLinksFilter, number>;

const FILTERS: {
  id: ClassLinksFilter;
  label: string;
  short: string;
}[] = [
  { id: "all", label: "All links", short: "All" },
  { id: "ready", label: "Ready to bill", short: "Ready" },
  { id: "needs_students", label: "Needs students", short: "Empty" },
];

interface FeeAssignmentsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: ClassLinksFilter;
  onFilterChange: (filter: ClassLinksFilter) => void;
  counts: FilterCounts | null;
  showInactiveFilter: boolean;
  loading: boolean;
  showingCount: number | null;
  totalCount: number | null;
  onRefresh: () => void;
  onExport: () => void;
  exportDisabled: boolean;
}

export function FeeAssignmentsToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  counts,
  showInactiveFilter,
  loading,
  showingCount,
  totalCount,
  onRefresh,
  onExport,
  exportDisabled,
}: FeeAssignmentsToolbarProps) {
  const filters = showInactiveFilter
    ? [
        ...FILTERS,
        {
          id: "inactive" as const,
          label: "Inactive",
          short: "Off",
        },
      ]
    : FILTERS;

  return (
    <div
      className={cn(
        "sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-3 py-2.5 backdrop-blur-sm sm:px-4",
        FEES_LAYOUT.page,
      )}
    >
      <p className="mb-2 text-xs leading-relaxed text-slate-600">
        Each row is a fee structure linked to classes for a billing period. Expand a
        row to see enrolled students and line items.
      </p>

      <div
        className={cn(
          FEES_LAYOUT.chipStrip,
          "mb-2 gap-1 rounded-lg bg-slate-100/80 p-1",
        )}
        role="tablist"
        aria-label="Filter class links"
      >
        {filters.map((f) => {
          const active = filter === f.id;
          const count = counts?.[f.id];
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onFilterChange(f.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <span className="hidden sm:inline">{f.label}</span>
              <span className="sm:hidden">{f.short}</span>
              {count != null ? (
                <span
                  className={cn(
                    "rounded px-1 py-0 text-[10px] font-semibold tabular-nums",
                    active ? "bg-slate-100 text-slate-700" : "text-slate-500",
                  )}
                >
                  {count}
                </span>
              ) : loading ? (
                <Skeleton className="h-3.5 w-4 rounded" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className={cn(FEES_LAYOUT.toolbarRow, "gap-2")}>
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search structure or class…"
            className="h-8 border-slate-200 bg-slate-50/80 pl-8 text-xs"
            aria-label="Search class links"
          />
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className={cn(FEES_BTN.secondary, "h-8 w-8 p-0")}
            onClick={onRefresh}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", loading && "animate-spin")}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(FEES_BTN.secondary, "h-8 gap-1 text-xs")}
            onClick={onExport}
            disabled={exportDisabled}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {loading && showingCount == null ? (
        <Skeleton className="mt-2 h-3 w-36" />
      ) : showingCount != null && totalCount != null ? (
        <p className="mt-2 text-[11px] tabular-nums text-slate-500">
          Showing {showingCount} of {totalCount} link
          {totalCount === 1 ? "" : "s"}
          {search.trim() ? " matching search" : ""}
        </p>
      ) : null}
    </div>
  );
}
