"use client";

import type { ComponentType } from "react";
import {
  Activity,
  ArrowDownWideNarrow,
  ChevronDown,
  Filter,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AUDIT_CATEGORY_META,
  countAuditLogsByCategory,
  type AuditCategory,
  type AuditCategoryFilter,
} from "@/lib/superadmin/auditLogs";
import type { AuditLogRecord } from "@/lib/superadmin/types";
import { cn } from "@/lib/utils";

export type AuditSort = "newest" | "oldest";

export interface AuditActionOption {
  value: string;
  label: string;
  category: AuditCategory;
}

export interface AuditLogToolbarProps {
  logs: AuditLogRecord[];
  search: string;
  onSearchChange: (value: string) => void;
  category: AuditCategoryFilter;
  onCategoryChange: (category: AuditCategoryFilter) => void;
  action: string;
  onActionChange: (action: string) => void;
  actionOptions: AuditActionOption[];
  sort: AuditSort;
  onSortChange: (sort: AuditSort) => void;
  resultCount: number;
  filtersActive: boolean;
  onClearFilters: () => void;
}

const CATEGORY_ORDER: AuditCategory[] = [
  "user",
  "school",
  "billing",
  "access",
  "system",
];

const NATIVE_SELECT_CLASS =
  "h-9 cursor-pointer appearance-none rounded-xl border border-slate-200/80 bg-white pl-8 pr-7 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600";

export function AuditLogToolbar({
  logs,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  action,
  onActionChange,
  actionOptions,
  sort,
  onSortChange,
  resultCount,
  filtersActive,
  onClearFilters,
}: AuditLogToolbarProps) {
  const groupedActions = CATEGORY_ORDER.map((key) => ({
    key,
    label: AUDIT_CATEGORY_META[key].label,
    options: actionOptions.filter((option) => option.category === key),
  })).filter((group) => group.options.length > 0);

  return (
    <section
      aria-label="Audit log filters"
      className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70"
    >
      <div className="border-b border-slate-100 px-4 pb-2.5 pt-4 dark:border-slate-800/70">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Filter by event type
          </h2>
        </div>

        <div className="relative mt-2">
          <div
            role="group"
            aria-label="Event categories"
            className="flex gap-2 overflow-x-auto pb-1.5 [scrollbar-width:thin] xl:flex-wrap xl:overflow-visible xl:pb-0"
          >
            <CategoryChip
              label="All events"
              count={logs.length}
              active={category === "all"}
              icon={Activity}
              onClick={() => onCategoryChange("all")}
            />

            {CATEGORY_ORDER.map((key) => {
              const meta = AUDIT_CATEGORY_META[key];
              const Icon = meta.icon;
              return (
                <CategoryChip
                  key={key}
                  label={meta.label}
                  count={countAuditLogsByCategory(logs, key)}
                  active={category === key}
                  icon={Icon}
                  title={meta.description}
                  onClick={() => onCategoryChange(key)}
                />
              );
            })}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white/70 to-transparent dark:from-slate-900 dark:via-slate-900/70 xl:hidden"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 w-full sm:w-auto sm:min-w-[240px] sm:max-w-sm sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Search audit logs"
              placeholder="Search events..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-9 w-full rounded-xl border border-slate-200/80 bg-white pl-9 pr-8 text-xs text-slate-700 shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {search ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <select
                aria-label="Filter by action"
                value={action}
                onChange={(event) => onActionChange(event.target.value)}
                className={cn(NATIVE_SELECT_CLASS, "max-w-[170px] sm:max-w-[210px]")}
              >
                <option value="all">All actions</option>
                {groupedActions.map((group) => (
                  <optgroup key={group.key} label={group.label}>
                    {group.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="relative">
              <ArrowDownWideNarrow className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <select
                aria-label="Sort audit logs"
                value={sort}
                onChange={(event) => onSortChange(event.target.value as AuditSort)}
                className={NATIVE_SELECT_CLASS}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {filtersActive ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-9 gap-1.5 rounded-xl px-2.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {resultCount}
          </span>
          <span>{resultCount === 1 ? "event" : "events"}</span>
        </div>
      </div>
    </section>
  );
}

function CategoryChip({
  label,
  count,
  active,
  icon: Icon,
  title,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  icon: ComponentType<{ className?: string }>;
  title?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={cn(
        "inline-flex flex-shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-primary/40 bg-primary/5 text-primary shadow-sm dark:border-primary/50 dark:bg-primary/10"
          : "border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
          active
            ? "bg-primary/10 text-primary dark:bg-primary/20"
            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
        )}
      >
        {count}
      </span>
    </button>
  );
}
