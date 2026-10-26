"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CreateUserDialog } from "@/components/dashboard/superadmin/CreateUserDialog";
import { UserInsightSheet } from "@/components/dashboard/superadmin/UserInsightSheet";
import { DashboardErrorBanner } from "@/components/dashboard/superadmin/DashboardStatCards";
import {
  AdminPageHeader,
  AdminPagination,
  AdminStatGrid,
  AdminTableSkeleton,
} from "@/components/dashboard/superadmin/AdminPageChrome";
import { UserDirectoryToolbar } from "@/components/dashboard/superadmin/UserDirectoryToolbar";
import { UserDirectoryTable } from "@/components/dashboard/superadmin/UserDirectoryTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUsers } from "@/lib/superadmin/useUsers";
import type { AdminUserListItem } from "@/lib/superadmin/types";
import { countLoginActivity } from "@/lib/superadmin/userActivity";
import {
  ALL_ROLES,
  ALL_STATUSES,
  countUsersByRole,
  filterUsers,
  resolveUserRole,
  resolveUserStatus,
  roleLabel,
  rolePlural,
  sortUsers,
  type UserSortKey,
} from "@/lib/superadmin/userRoles";
import type { RoleFacet } from "@/lib/superadmin/userRoles";
import {
  Users,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Radio,
  GraduationCap,
  SearchX,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <AdminTableSkeleton />
        </DashboardLayout>
      }
    >
      <UsersPageContent />
    </Suspense>
  );
}

function UsersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    users,
    hasMore,
    loading,
    actionLoading,
    error,
    refresh,
    toggleUserStatus,
    removeUser,
    createUser,
  } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(ALL_ROLES);
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUSES);
  const [sortKey, setSortKey] = useState<UserSortKey>("role");
  const [grouped, setGrouped] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [createOpen, setCreateOpen] = useState(
    () => searchParams.get("create") === "1",
  );
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(
    null,
  );
  const [insightOpen, setInsightOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  // Keep "2m ago" / "last 15m" fresh without refetching the directory.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const openInsight = (user: AdminUserListItem) => {
    setSelectedUser(user);
    setInsightOpen(true);
  };

  useEffect(() => {
    if (searchParams.get("create") !== "1") return;
    router.replace("/dashboard/users", { scroll: false });
  }, [searchParams, router]);

  const [deleteTarget, setDeleteTarget] = useState<AdminUserListItem | null>(
    null,
  );
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Filter updates reset pagination so the user always lands on page 1 of the
  // new result set (no effect needed, so no cascading renders).
  const updateSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const updateRole = useCallback((role: string) => {
    setRoleFilter(role);
    setPage(1);
  }, []);

  const updateStatus = useCallback((status: string) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const updateSort = useCallback((sort: UserSortKey) => {
    setSortKey(sort);
    setPage(1);
  }, []);

  const updateGrouped = useCallback((next: boolean) => {
    setGrouped(next);
    setPage(1);
  }, []);

  const filtersActive =
    searchTerm.trim().length > 0 ||
    roleFilter !== ALL_ROLES ||
    statusFilter !== ALL_STATUSES;

  // Role chips keep a stable order (all roles in the data) but their counts
  // follow the search/status filters, so the chips preview what's clickable.
  const roleFacets = useMemo(() => countUsersByRole(users), [users]);
  const searchAndStatusFiltered = useMemo(
    () => filterUsers(users, { status: statusFilter, query: searchTerm }),
    [users, statusFilter, searchTerm],
  );
  const roleFacetCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const user of searchAndStatusFiltered) {
      const role = resolveUserRole(user);
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }
    return counts;
  }, [searchAndStatusFiltered]);

  const facetsWithCounts = useMemo<RoleFacet[]>(
    () =>
      roleFacets.map((facet) => ({
        ...facet,
        count: roleFacetCounts.get(facet.key) ?? 0,
      })),
    [roleFacets, roleFacetCounts],
  );

  const filtered = useMemo(
    () =>
      sortUsers(
        filterUsers(users, {
          role: roleFilter,
          status: statusFilter,
          query: searchTerm,
        }),
        sortKey,
      ),
    [users, roleFilter, statusFilter, searchTerm, sortKey],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const roleTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const facet of facetsWithCounts) totals[facet.key] = facet.count;
    return totals;
  }, [facetsWithCounts]);

  const activeCount = users.filter(
    (user) => resolveUserStatus(user) === "ACTIVE",
  ).length;
  const suspendedCount = users.filter(
    (user) => resolveUserStatus(user) === "SUSPENDED",
  ).length;
  const teacherCount = useMemo(() => {
    const facet = roleFacets.find((item) => item.key === "TEACHER");
    return facet?.count ?? 0;
  }, [roleFacets]);
  const loginPulse = useMemo(
    () => countLoginActivity(users, now),
    [users, now],
  );

  // ── Filter shortcuts ─────────────────────────────────────────

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setRoleFilter(ALL_ROLES);
    setStatusFilter(ALL_STATUSES);
    setPage(1);
  }, []);

  const showRoleSlice = useCallback((role: string) => {
    setSearchTerm("");
    setStatusFilter(ALL_STATUSES);
    setRoleFilter(role);
    setPage(1);
  }, []);

  const showStatusSlice = useCallback((status: string) => {
    setSearchTerm("");
    setRoleFilter(ALL_ROLES);
    setStatusFilter(status);
    setPage(1);
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Total users",
        value: hasMore ? `${users.length}+` : String(users.length),
        helper: hasMore ? "Showing first 1,000" : "Across all schools",
        icon: Users,
        color: "text-blue-600",
        gradient: "from-blue-500/10 to-blue-500/5",
        onClick: clearFilters,
        active: !filtersActive,
        title: "Show every user",
      },
      {
        label: "Active",
        value: String(activeCount),
        helper:
          users.length > 0
            ? `${Math.round((activeCount / users.length) * 100)}% of all`
            : "—",
        icon: CheckCircle,
        color: "text-emerald-600",
        gradient: "from-emerald-500/10 to-emerald-500/5",
        onClick: () => showStatusSlice("ACTIVE"),
        active: statusFilter === "ACTIVE",
        title: "Show active users",
      },
      {
        label: "Teachers",
        value: String(teacherCount),
        helper: "Teaching staff",
        icon: GraduationCap,
        color: "text-violet-600",
        gradient: "from-violet-500/10 to-violet-500/5",
        onClick: () => showRoleSlice("TEACHER"),
        active: roleFilter === "TEACHER",
        title: "Show teachers",
      },
      {
        label: "Suspended",
        value: String(suspendedCount),
        helper: "Requires attention",
        icon: XCircle,
        color: "text-red-600",
        gradient: "from-red-500/10 to-red-500/5",
        onClick: () => showStatusSlice("SUSPENDED"),
        active: statusFilter === "SUSPENDED",
        title: "Show suspended users",
      },
    ],
    [
      users.length,
      hasMore,
      activeCount,
      teacherCount,
      suspendedCount,
      filtersActive,
      roleFilter,
      statusFilter,
      clearFilters,
      showRoleSlice,
      showStatusSlice,
    ],
  );

  const firstLoad = loading && users.length === 0;
  const showDirectory = !firstLoad && !(error && users.length === 0);

  // ── Handlers ─────────────────────────────────────────────────

  const handleToggleStatus = async (user: AdminUserListItem) => {
    try {
      await toggleUserStatus(user);
    } catch {
      // error surfaced via hook
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (deleteConfirm !== "DELETE") {
      setDeleteError('Type "DELETE" to confirm');
      return;
    }
    try {
      await removeUser(deleteTarget.id);
      setDeleteTarget(null);
      setDeleteConfirm("");
      setDeleteError("");
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete user",
      );
    }
  };

  const filterSummary = [
    roleFilter !== ALL_ROLES ? rolePlural(roleFilter).toLowerCase() : null,
    statusFilter !== ALL_STATUSES
      ? `${statusFilter.toLowerCase()} accounts`
      : null,
    searchTerm.trim() ? `matching “${searchTerm.trim()}”` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AdminPageHeader
          icon={Users}
          title="Users"
          description={`Every account across all schools — filter by role and status, or search a school${hasMore ? " (showing first 1,000 users)" : ""}`}
          count={users.length}
          loading={loading}
          onRefresh={refresh}
          actions={
            <Button
              size="sm"
              className="h-9 gap-2"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Create user</span>
            </Button>
          }
        />

        <AdminStatGrid stats={stats} />

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/60 bg-white/70 px-4 py-3 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              <Radio className="h-3.5 w-3.5" />
              Login pulse
            </span>
            <PulseStat
              dot="bg-emerald-500"
              label="last 15m"
              value={loginPulse.live}
              pulse
            />
            <PulseStat
              dot="bg-emerald-400"
              label="today"
              value={loginPulse.today}
            />
            <PulseStat
              dot="bg-amber-500"
              label="this week"
              value={loginPulse.thisWeek}
            />
            <PulseStat
              dot="bg-rose-500"
              label="never signed in"
              value={loginPulse.never}
              title="No sign-in recorded since activity tracking was enabled"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Live · refreshes every minute
          </p>
        </div>

        {error ? (
          <DashboardErrorBanner message={error} onRetry={refresh} />
        ) : null}

        {firstLoad ? <AdminTableSkeleton /> : null}

        {showDirectory ? (
          <>
            <UserDirectoryToolbar
              search={searchTerm}
              onSearchChange={updateSearch}
              role={roleFilter}
              onRoleChange={updateRole}
              roleFacets={facetsWithCounts}
              totalUsers={users.length}
              resultCount={filtered.length}
              status={statusFilter}
              onStatusChange={updateStatus}
              sort={sortKey}
              onSortChange={updateSort}
              grouped={grouped}
              onGroupedChange={updateGrouped}
              filtersActive={filtersActive}
              onClearFilters={clearFilters}
            />

            <div
              className={cn(
                "transition-opacity",
                loading && "pointer-events-none opacity-60",
              )}
              aria-busy={loading}
            >
              <UserDirectoryTable
                users={paginated}
                grouped={grouped}
                roleTotals={roleTotals}
                now={now}
                actionLoadingId={actionLoading}
                sort={sortKey}
                onSortChange={updateSort}
                onOpenUser={openInsight}
                onToggleStatus={handleToggleStatus}
                onDeleteUser={(user) => {
                  setDeleteTarget(user);
                  setDeleteConfirm("");
                  setDeleteError("");
                }}
                onFilterRole={updateRole}
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
                        <Users className="h-6 w-6" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {filtersActive
                        ? "No users match these filters"
                        : "No users found"}
                    </p>
                    <p className="mt-1 max-w-sm text-xs text-slate-400">
                      {filtersActive
                        ? `${filterSummary || "This combination"} returned nothing. Try a different role, status or search term.`
                        : "Users will appear here once created."}
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

            {filtered.length > 0 ? (
              <AdminPagination
                page={currentPage}
                perPage={perPage}
                totalItems={filtered.length}
                onPageChange={setPage}
                onPerPageChange={(size) => {
                  setPerPage(size);
                  setPage(1);
                }}
              />
            ) : null}
          </>
        ) : null}

        {/* Delete dialog */}
        <Dialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
              setDeleteConfirm("");
              setDeleteError("");
            }
          }}
        >
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" /> Delete User
              </DialogTitle>
              <DialogDescription>
                Permanently delete <strong>{deleteTarget?.name}</strong> (
                {deleteTarget?.email}
                {deleteTarget
                  ? `, ${roleLabel(resolveUserRole(deleteTarget))})`
                  : ")"}{" "}
                This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Type <strong>DELETE</strong> to confirm:
              </p>
              <Input
                placeholder='Type "DELETE"'
                className="rounded-xl"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
              />
              {deleteError && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-3 rounded-xl border border-red-200">
                  {deleteError}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteConfirm("");
                  setDeleteError("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="rounded-xl"
                onClick={handleDeleteConfirm}
                disabled={
                  deleteConfirm !== "DELETE" ||
                  actionLoading === deleteTarget?.id
                }
              >
                {actionLoading === deleteTarget?.id
                  ? "Deleting..."
                  : "Delete User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        saving={actionLoading === "create"}
        onSubmit={createUser}
      />

      <UserInsightSheet
        user={selectedUser}
        open={insightOpen}
        onOpenChange={setInsightOpen}
      />
    </DashboardLayout>
  );
}

function PulseStat({
  dot,
  label,
  value,
  pulse,
  title,
}: {
  dot: string;
  label: string;
  value: number;
  pulse?: boolean;
  title?: string;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5 text-xs" title={title}>
      <span
        className={cn(
          "inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full",
          dot,
          pulse && value > 0 && "animate-pulse",
        )}
      />
      <span className="font-semibold text-slate-700 dark:text-slate-200">
        {value}
      </span>
      <span className="text-slate-400">{label}</span>
    </span>
  );
}
