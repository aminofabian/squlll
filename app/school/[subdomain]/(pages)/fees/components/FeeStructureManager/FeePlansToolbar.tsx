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
import { Plus, RefreshCw, Search, X } from "lucide-react";
import { FEES_BRAND } from "../../lib/fees-ui";

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
  onCreateNew: () => void;
  canCreate: boolean;
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
  onCreateNew,
  canCreate,
}: FeePlansToolbarProps) {
  const hasFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    academicYearFilter !== "all";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search plans or year…"
            className="h-9 border-slate-200 bg-slate-50/50 pl-9 pr-8 text-sm"
          />
          {searchQuery ? (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-700"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) =>
            onStatusFilterChange(v as "all" | "active" | "inactive")
          }
        >
          <SelectTrigger className="h-9 w-full border-slate-200 text-sm sm:w-[7.5rem]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {academicYears.length > 0 ? (
          <Select value={academicYearFilter} onValueChange={onAcademicYearFilterChange}>
            <SelectTrigger className="h-9 w-full border-slate-200 text-sm sm:w-[8.5rem]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {academicYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
        <p className="text-xs text-slate-500 tabular-nums" aria-live="polite">
          {hasFilters ? (
            <>
              Showing{" "}
              <span className="font-semibold text-slate-800">{filteredCount}</span> of{" "}
              <span className="font-semibold text-slate-800">{totalCount}</span> fee
              plans
            </>
          ) : (
            <>
              <span className="font-semibold text-slate-800">{totalCount}</span> fee
              plan{totalCount === 1 ? "" : "s"} total
            </>
          )}
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 border-slate-200"
            onClick={onRefresh}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-9 gap-1.5 text-white shadow-sm"
            style={{ backgroundColor: FEES_BRAND.primary }}
            disabled={!canCreate}
            onClick={onCreateNew}
          >
            <Plus className="h-4 w-4" />
            New fee plan
          </Button>
        </div>
      </div>
    </div>
  );
}
