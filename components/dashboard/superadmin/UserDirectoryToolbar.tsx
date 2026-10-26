"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowDownWideNarrow,
  ChevronDown,
  Filter,
  Layers3,
  Search,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ALL_ROLES,
  ALL_STATUSES,
  USER_SORT_OPTIONS,
  type RoleFacet,
  type UserSortKey,
} from "@/lib/superadmin/userRoles";
import { cn } from "@/lib/utils";
import {
  RoleGlyph,
  ROLE_TONE_VISUALS,
} from "@/components/dashboard/superadmin/userRoleVisuals";

const STATUS_OPTIONS = [
  { value: ALL_STATUSES, label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "EXPIRED", label: "Expired" },
] as const;

const NATIVE_SELECT_CLASS =
  "h-9 cursor-pointer appearance-none rounded-xl border border-slate-200/80 bg-white pl-8 pr-7 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600";

export interface UserDirectoryToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: string;
  onRoleChange: (role: string) => void;
  roleFacets: RoleFacet[];
  totalUsers: number;
  resultCount: number;
  status: string;
  onStatusChange: (status: string) => void;
  sort: UserSortKey;
  onSortChange: (sort: UserSortKey) => void;
  grouped: boolean;
  onGroupedChange: (grouped: boolean) => void;
  filtersActive: boolean;
  onClearFilters: () => void;
}

export function UserDirectoryToolbar({
  search,
  onSearchChange,
  role,
  onRoleChange,
  roleFacets,
  totalUsers,
  resultCount,
  status,
  onStatusChange,
  sort,
  onSortChange,
  grouped,
  onGroupedChange,
  filtersActive,
  onClearFilters,
}: UserDirectoryToolbarProps) {
  // Facet-style count: ignore the role filter but respect search/status, so the
  // "All users" chip matches what is currently visible.
  const allRolesCount = roleFacets.reduce((sum, facet) => sum + facet.count, 0);

  return (
    <section
      aria-label="User directory filters"
      className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70"
    >
      <div className="border-b border-slate-100 px-4 pb-2.5 pt-4 dark:border-slate-800/70">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Filter by role
          </h2>
        </div>

        <div className="relative mt-2">
          <div
            role="group"
            aria-label="Roles"
            className="flex gap-2 overflow-x-auto pb-1.5 [scrollbar-width:thin] xl:flex-wrap xl:overflow-visible xl:pb-0"
          >
            <RoleChip
              label="All users"
              count={allRolesCount}
              active={role === ALL_ROLES}
              icon={Users}
              onClick={() => onRoleChange(ALL_ROLES)}
            />

            {roleFacets.map((facet) => (
              <RoleChip
                key={facet.key}
                label={facet.label}
                count={facet.count}
                active={role === facet.key}
                tone={facet.tone}
                role={facet.key}
                title={facet.description || undefined}
                onClick={() => onRoleChange(facet.key)}
              />
            ))}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white/70 to-transparent dark:from-slate-900 dark:via-slate-900/70 xl:hidden"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 flex-1 sm:min-w-[220px] sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Search users"
              placeholder="Search name, email, phone or school..."
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

          <div className="relative">
            <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className={NATIVE_SELECT_CLASS}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <ArrowDownWideNarrow className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <select
              aria-label="Sort users"
              value={sort}
              onChange={(event) => {
                const value = event.target.value as UserSortKey;
                if (USER_SORT_OPTIONS.some((option) => option.value === value)) {
                  onSortChange(value);
                }
              }}
              className={NATIVE_SELECT_CLASS}
            >
              {USER_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort: {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          <Button
            type="button"
            variant={grouped ? "default" : "outline"}
            size="sm"
            aria-pressed={grouped}
            onClick={() => onGroupedChange(!grouped)}
            className={cn(
              "h-9 gap-1.5 rounded-xl px-3 text-xs font-medium",
              grouped
                ? "bg-primary text-white hover:bg-primary-dark"
                : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
            )}
          >
            <Layers3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Group by role</span>
            <span className="sm:hidden">Group</span>
          </Button>

          {filtersActive ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-9 gap-1.5 rounded-xl px-2.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </Button>
          ) : null}
        </div>

        <p
          aria-live="polite"
          className="shrink-0 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 lg:text-right"
        >
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {resultCount.toLocaleString()}
          </span>{" "}
          of {totalUsers.toLocaleString()} users
        </p>
      </div>
    </section>
  );
}

interface RoleChipProps {
  label: string;
  count: number;
  active: boolean;
  icon?: LucideIcon;
  role?: string;
  onClick: () => void;
  tone?: RoleFacet["tone"];
  title?: string;
}

function RoleChip({
  label,
  count,
  active,
  icon: Icon,
  role,
  onClick,
  tone,
  title,
}: RoleChipProps) {
  const visual = tone ? ROLE_TONE_VISUALS[tone] : null;

  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        active
          ? cn(
              "font-semibold",
              visual
                ? cn(visual.chipActive, "ring-2", visual.ring)
                : "border-primary/30 bg-primary/10 text-primary-dark ring-2 ring-primary/30 dark:border-primary/40 dark:bg-primary/20 dark:text-primary-light",
            )
          : "border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800/80",
      )}
    >
      {role ? (
        <RoleGlyph
          role={role}
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            visual ? visual.text : "text-slate-400",
          )}
        />
      ) : Icon ? (
        <Icon
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            active ? "text-primary" : "text-slate-400",
          )}
        />
      ) : null}
      <span className="whitespace-nowrap">{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
          active
            ? "bg-white/70 text-slate-700 dark:bg-slate-900/40 dark:text-slate-100"
            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
        )}
      >
        {count.toLocaleString()}
      </span>
    </button>
  );
}
