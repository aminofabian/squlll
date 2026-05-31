"use client";

import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface AdminStatItem {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
}

interface AdminPageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  count?: number;
  loading?: boolean;
  onRefresh?: () => void;
  actions?: React.ReactNode;
}

export function AdminPageHeader({
  icon: Icon,
  title,
  description,
  count,
  loading,
  onRefresh,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
            {title}
          </h1>
          {count != null && !loading ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              {count}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {onRefresh ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-9 gap-2"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", loading && "animate-spin")}
            />
            <span className="text-xs font-medium">Refresh</span>
          </Button>
        ) : null}
        {actions}
      </div>
    </div>
  );
}

export function AdminStatGrid({ stats }: { stats: AdminStatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br p-5 shadow-sm dark:border-slate-800/60 dark:from-slate-900 dark:to-slate-900/80",
              stat.gradient,
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm dark:bg-slate-800/80">
                <Icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {stat.value}
                </p>
                {stat.helper ? (
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    {stat.helper}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  resultCount?: number;
  loading?: boolean;
}

export function AdminSearchBar({
  value,
  onChange,
  placeholder,
  resultCount,
  loading,
}: AdminSearchBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder={placeholder}
          className="h-10 w-full rounded-xl border border-slate-200/60 bg-white pl-10 pr-4 text-sm transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700/60 dark:bg-slate-900/80"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {resultCount != null && !loading ? (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium">{resultCount}</span> results
        </div>
      ) : null}
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className="border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-4 divide-y divide-slate-100 p-4 dark:divide-slate-800/60">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

interface AdminPaginationProps {
  page: number;
  perPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export function AdminPagination({
  page,
  perPage,
  totalItems,
  onPageChange,
  onPerPageChange,
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const start = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalItems);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium">Page {page}</span>
        <span>of {totalPages}</span>
        <span className="text-slate-300 dark:text-slate-600">·</span>
        <span>
          Showing {start}–{end} of {totalItems}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span>Show</span>
          <select
            value={perPage}
            onChange={(event) => onPerPageChange(Number(event.target.value))}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>per page</span>
        </div>
        <div className="flex items-center gap-1">
          <PaginationButton
            disabled={page === 1}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </PaginationButton>
          <PaginationButton
            disabled={page === 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </PaginationButton>
          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
              let pageNum: number;
              if (totalPages <= 5) pageNum = index + 1;
              else if (page <= 3) pageNum = index + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + index;
              else pageNum = page - 2 + index;

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    "h-8 min-w-[2rem] rounded-lg px-2 text-xs font-medium transition-colors",
                    page === pageNum
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800",
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <PaginationButton
            disabled={page === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </PaginationButton>
          <PaginationButton
            disabled={page === totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            <ChevronsRight className="h-4 w-4" />
          </PaginationButton>
        </div>
      </div>
    </div>
  );
}

function PaginationButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-800"
    >
      {children}
    </button>
  );
}
