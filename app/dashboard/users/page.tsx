"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CreateUserDialog } from "@/components/dashboard/superadmin/CreateUserDialog";
import { UserRowActions } from "@/components/dashboard/superadmin/UserRowActions";
import { DashboardErrorBanner } from "@/components/dashboard/superadmin/DashboardStatCards";
import {
  AdminPageHeader,
  AdminPagination,
  AdminSearchBar,
  AdminStatGrid,
  AdminTableSkeleton,
} from "@/components/dashboard/superadmin/AdminPageChrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Users,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function roleBadgeVariant(
  role: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case "SUPER_ADMIN":
      return "destructive";
    case "SCHOOL_ADMIN":
      return "default";
    case "TEACHER":
      return "secondary";
    default:
      return "outline";
  }
}

function statusBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "PENDING":
      return "secondary";
    case "SUSPENDED":
      return "destructive";
    default:
      return "outline";
  }
}

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
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("create") !== "1") return;
    setCreateOpen(true);
    router.replace("/dashboard/users", { scroll: false });
  }, [searchParams, router]);

  const [deleteTarget, setDeleteTarget] = useState<AdminUserListItem | null>(
    null,
  );
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const filtered = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.memberships.some((m) => m.tenantName.toLowerCase().includes(term)),
    );
  }, [users, searchTerm]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const activeCount = users.filter((u) =>
    u.memberships.some((m) => m.status === "ACTIVE"),
  ).length;
  const superAdminCount = users.filter((u) => u.isGlobalAdmin).length;

  const stats = useMemo(
    () => [
      {
        label: "Total users",
        value: hasMore ? `${users.length}+` : String(users.length),
        helper: hasMore ? "More users available" : "Across all schools",
        icon: Users,
        color: "text-blue-600",
        gradient: "from-blue-500/10 to-blue-500/5",
      },
      {
        label: "Active",
        value: String(activeCount),
        helper:
          users.length > 0
            ? `${Math.round((activeCount / users.length) * 100)}% of all`
            : "—",
        icon: CheckCircle,
        color: "text-green-600",
        gradient: "from-green-500/10 to-green-500/5",
      },
      {
        label: "Super admins",
        value: String(superAdminCount),
        helper: "Platform administrators",
        icon: Shield,
        color: "text-violet-600",
        gradient: "from-violet-500/10 to-violet-500/5",
      },
      {
        label: "Suspended",
        value: String(
          users.filter((user) =>
            user.memberships.some((membership) => membership.status === "SUSPENDED"),
          ).length,
        ),
        helper: "Requires attention",
        icon: XCircle,
        color: "text-red-600",
        gradient: "from-red-500/10 to-red-500/5",
      },
    ],
    [users, hasMore, activeCount, superAdminCount],
  );

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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <AdminPageHeader
          icon={Users}
          title="Users"
          description={`Manage users across all schools${hasMore ? " (showing first 1,000 users)" : ""}`}
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

        <AdminSearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setPage(1);
          }}
          placeholder="Search by name, email, or school..."
          resultCount={filtered.length}
          loading={loading}
        />

        {error ? (
          <DashboardErrorBanner message={error} onRetry={refresh} />
        ) : null}

        {/* Loading */}
        {loading && !error ? <AdminTableSkeleton /> : null}

        {/* Table */}
        {!loading && !error && (
          <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {[
                      "Name",
                      "Email",
                      "Role",
                      "Tenant",
                      "Status",
                      "Joined",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginated.map((user) => {
                    const membership = user.memberships[0];
                    const role = user.isGlobalAdmin
                      ? "SUPER_ADMIN"
                      : membership?.role || "—";
                    const status = membership?.status || "—";
                    const tenantName = membership?.tenantName || "—";

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-primary">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                                {user.name}
                              </p>
                              {user.isGlobalAdmin && (
                                <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">
                                  Global Admin
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px] block">
                            {user.email}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            variant={roleBadgeVariant(role)}
                            className="text-[10px] uppercase font-semibold tracking-wide"
                          >
                            {role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {tenantName}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            variant={statusBadgeVariant(status)}
                            className="text-[10px] uppercase font-semibold tracking-wide"
                          >
                            {status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-slate-500">
                            {user.createdAt ? formatDate(user.createdAt) : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {!user.isGlobalAdmin && (
                            <UserRowActions
                              status={status}
                              loading={actionLoading === user.id}
                              onToggleStatus={() => handleToggleStatus(user)}
                              onDelete={() => {
                                setDeleteTarget(user);
                                setDeleteConfirm("");
                                setDeleteError("");
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 px-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {searchTerm ? "No users match your search" : "No users found"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {searchTerm
                    ? "Try adjusting your search"
                    : "Users will appear here once created"}
                </p>
              </div>
            )}
          </div>
        )}

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
                {deleteTarget?.email}). This cannot be undone.
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

        {!loading && !error && filtered.length > 0 ? (
          <AdminPagination
            page={page}
            perPage={perPage}
            totalItems={filtered.length}
            onPageChange={setPage}
            onPerPageChange={(size) => {
              setPerPage(size);
              setPage(1);
            }}
          />
        ) : null}
      </div>

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        saving={actionLoading === "create"}
        onSubmit={createUser}
      />
    </DashboardLayout>
  );
}
