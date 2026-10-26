"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Building2,
  CreditCard,
  Download,
  LogIn,
  SearchX,
  Shield,
  UserPlus,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AuditLogTable } from "@/components/dashboard/superadmin/AuditLogTable";
import {
  AuditLogToolbar,
  type AuditSort,
} from "@/components/dashboard/superadmin/AuditLogToolbar";
import {
  AdminPageHeader,
  AdminPagination,
  AdminStatGrid,
  AdminTableSkeleton,
} from "@/components/dashboard/superadmin/AdminPageChrome";
import { DashboardErrorBanner } from "@/components/dashboard/superadmin/DashboardStatCards";
import { Button } from "@/components/ui/button";
import {
  AUDIT_CATEGORY_META,
  countAuditLogsByCategory,
  filterAuditLogs,
  getAuditActionOptions,
  getAuditActor,
  getAuditTarget,
  parseAuditMetadata,
  type AuditCategoryFilter,
} from "@/lib/superadmin/auditLogs";
import { AUDIT_LOG_FETCH_LIMIT } from "@/lib/superadmin/auditLogsApi";
import { useAuditLogs } from "@/lib/superadmin/useAuditLogs";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function AuditLogsPage() {
  const { logs, loading, error, refresh } = useAuditLogs();

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<AuditCategoryFilter>("all");
  const [action, setAction] = useState("all");
  const [sort, setSort] = useState<AuditSort>("newest");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE_OPTIONS[0]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  // Keep "3h ago" / "in the last 24h" fresh without refetching the log table.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const actionOptions = useMemo(() => getAuditActionOptions(logs), [logs]);

  const filtered = useMemo(
    () => filterAuditLogs(logs, { query: searchTerm, category, action }),
    [logs, searchTerm, category, action],
  );

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const delta =
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      return sort === "newest" ? delta : -delta;
    });
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const filtersActive =
    searchTerm.trim().length > 0 || category !== "all" || action !== "all";

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setCategory("all");
    setAction("all");
    setPage(1);
    setExpandedId(null);
  }, []);

  const chooseCategory = useCallback((next: AuditCategoryFilter) => {
    setCategory(next);
    setPage(1);
    setExpandedId(null);
  }, []);

  const updateSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
    setExpandedId(null);
  }, []);

  const updateAction = useCallback((value: string) => {
    setAction(value);
    setPage(1);
    setExpandedId(null);
  }, []);

  const updateSort = useCallback((value: AuditSort) => {
    setSort(value);
    setPage(1);
    setExpandedId(null);
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  const categoryCounts = useMemo(
    () => ({
      user: countAuditLogsByCategory(logs, "user"),
      school: countAuditLogsByCategory(logs, "school"),
      billing: countAuditLogsByCategory(logs, "billing"),
      access: countAuditLogsByCategory(logs, "access"),
      system: countAuditLogsByCategory(logs, "system"),
    }),
    [logs],
  );

  const last24h = useMemo(
    () =>
      logs.filter(
        (entry) =>
          now.getTime() - new Date(entry.timestamp).getTime() < 86_400_000,
      ).length,
    [logs, now],
  );

  const stats = useMemo(
    () => [
      {
        label: "All events",
        value: String(logs.length),
        helper: last24h > 0 ? `${last24h} in 24h` : "Quiet for 24h",
        icon: Activity,
        color: "text-primary",
        gradient: "from-primary/10 to-primary/5",
        onClick: clearFilters,
        active: !filtersActive,
        title: "Show every audit event",
      },
      {
        label: "Users",
        value: String(categoryCounts.user),
        helper: "Accounts",
        icon: UserPlus,
        color: "text-emerald-600",
        gradient: "from-emerald-500/10 to-emerald-500/5",
        onClick: () => chooseCategory("user"),
        active: category === "user",
        title: "Show user account events",
      },
      {
        label: "Schools",
        value: String(categoryCounts.school),
        helper: "Add / remove",
        icon: Building2,
        color: "text-blue-600",
        gradient: "from-blue-500/10 to-blue-500/5",
        onClick: () => chooseCategory("school"),
        active: category === "school",
        title: "Show school events",
      },
      {
        label: "Billing",
        value: String(categoryCounts.billing),
        helper: "Plans / subs",
        icon: CreditCard,
        color: "text-violet-600",
        gradient: "from-violet-500/10 to-violet-500/5",
        onClick: () => chooseCategory("billing"),
        active: category === "billing",
        title: "Show plan and subscription events",
      },
      {
        label: "Portal",
        value: String(categoryCounts.access),
        helper: "Entries",
        icon: LogIn,
        color: "text-sky-600",
        gradient: "from-sky-500/10 to-sky-500/5",
        onClick: () => chooseCategory("access"),
        active: category === "access",
        title: "Show portal access events",
      },
      {
        label: "Other",
        value: String(categoryCounts.system),
        helper: "Uncategorised",
        icon: Shield,
        color: "text-amber-600",
        gradient: "from-amber-500/10 to-amber-500/5",
        onClick: () => chooseCategory("system"),
        active: category === "system",
        title: "Show uncategorised events",
      },
    ],
    [logs.length, last24h, categoryCounts, category, filtersActive, clearFilters, chooseCategory],
  );

  // Keep the expanded row from disappearing when the page or filters change.
  const activeExpandedId =
    expandedId && paginated.some((entry) => entry.id === expandedId)
      ? expandedId
      : null;

  const firstLoad = loading && logs.length === 0;
  const refreshing = loading && logs.length > 0;
  const showContent = !firstLoad && !(error && logs.length === 0);
  const truncated = logs.length >= AUDIT_LOG_FETCH_LIMIT;

  const filterSummary = [
    category !== "all"
      ? AUDIT_CATEGORY_META[category].label.toLowerCase()
      : null,
    action !== "all"
      ? (actionOptions.find((option) => option.value === action)?.label ?? action)
          .toLowerCase()
      : null,
    searchTerm.trim() ? `matching “${searchTerm.trim()}”` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const exportCsv = () => {
    if (sorted.length === 0) return;

    const header = [
      "Timestamp",
      "Action",
      "Level",
      "Actor",
      "Actor email",
      "Target",
      "Target type",
      "Details",
    ];
    const rows = sorted.map((entry) => {
      const actor = getAuditActor(entry);
      const target = getAuditTarget(entry);
      return [
        new Date(entry.timestamp).toISOString(),
        entry.message,
        entry.level,
        actor.displayName,
        actor.email ?? "",
        target.label,
        target.kind,
        JSON.stringify(parseAuditMetadata(entry.metadata) ?? {}),
      ];
    });

    const escape = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [header, ...rows]
      .map((row) => row.map(escape).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `squl-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AdminPageHeader
          icon={Activity}
          title="Audit logs"
          description="Super-admin audit trail across users, schools, billing and portal access"
          count={loading ? undefined : filtered.length}
          loading={loading}
          onRefresh={refresh}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={sorted.length === 0}
              className="h-9 gap-2"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Export CSV</span>
            </Button>
          }
        />

        <AdminStatGrid
          stats={stats}
          className="lg:grid-cols-3 xl:grid-cols-6"
        />

        {error ? (
          <DashboardErrorBanner message={error} onRetry={refresh} />
        ) : null}

        {firstLoad ? <AdminTableSkeleton rows={6} /> : null}

        {showContent ? (
          <>
            <AuditLogToolbar
              logs={logs}
              search={searchTerm}
              onSearchChange={updateSearch}
              category={category}
              onCategoryChange={chooseCategory}
              action={action}
              onActionChange={updateAction}
              actionOptions={actionOptions}
              sort={sort}
              onSortChange={updateSort}
              resultCount={filtered.length}
              filtersActive={filtersActive}
              onClearFilters={clearFilters}
            />

            <div
              className={cn(
                "transition-opacity",
                refreshing && "pointer-events-none opacity-60",
              )}
              aria-busy={refreshing}
            >
              <AuditLogTable
                logs={paginated}
                expandedId={activeExpandedId}
                onToggle={toggleExpanded}
                emptyState={
                  <div className="flex flex-col items-center px-5 py-16 text-center">
                    <div
                      className={cn(
                        "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl",
                        filtersActive
                          ? "bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400"
                          : "bg-slate-100 text-slate-400 dark:bg-slate-800",
                      )}
                    >
                      {filtersActive ? (
                        <SearchX className="h-6 w-6" />
                      ) : (
                        <Activity className="h-6 w-6" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {filtersActive
                        ? "No events match these filters"
                        : "No audit events yet"}
                    </p>
                    <p className="mt-1 max-w-sm text-xs text-slate-400">
                      {filtersActive
                        ? `${filterSummary || "This combination"} returned nothing. Try another event type, action or search term.`
                        : "Events appear here as super admins create schools, manage users, change plans or enter a school portal."}
                    </p>
                    {filtersActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="mt-4 h-8 rounded-lg text-xs"
                      >
                        Clear filters
                      </Button>
                    ) : null}
                  </div>
                }
              />
            </div>

            {sorted.length > 0 ? (
              <AdminPagination
                page={currentPage}
                perPage={perPage}
                totalItems={sorted.length}
                onPageChange={(next) => {
                  setPage(next);
                  setExpandedId(null);
                }}
                onPerPageChange={(size) => {
                  setPerPage(size);
                  setPage(1);
                  setExpandedId(null);
                }}
              />
            ) : null}

            {truncated ? (
              <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
                Showing the latest {AUDIT_LOG_FETCH_LIMIT.toLocaleString()}{" "}
                events. Older entries remain in the database.
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
