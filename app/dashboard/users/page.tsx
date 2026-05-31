"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

interface MembershipInfo {
  id: string;
  role: string;
  status: string;
  tenantId: string;
  tenantName: string;
  tenantSubdomain: string;
  joinedAt: string | null;
}

interface UserListItem {
  id: string;
  email: string;
  name: string;
  isGlobalAdmin: boolean;
  globalRole: string;
  createdAt: string;
  memberships: MembershipInfo[];
}

// ─── GraphQL Helpers ──────────────────────────────────────────

async function graphqlRequest(
  query: string,
  variables?: Record<string, unknown>,
) {
  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "GraphQL error");
  return json.data;
}

async function fetchUsers(
  cursor?: string,
  limit = 50,
): Promise<UserListItem[]> {
  const data = await graphqlRequest(
    `
    query GetAllUsers($pagination: AdminUserPaginationInput!) {
      getAllUsers(pagination: $pagination) {
        id
        email
        name
        isGlobalAdmin
        globalRole
        createdAt
        memberships {
          id
          role
          status
          tenantId
          tenantName
          tenantSubdomain
          joinedAt
        }
      }
    }
    `,
    { pagination: { cursor: cursor || null, limit } },
  );
  return data.getAllUsers;
}

async function changeUserStatus(userId: string, newStatus: string) {
  await graphqlRequest(
    `
    mutation ChangeUserStatus($input: UserStatusChangeInput!) {
      changeUserStatus(input: $input) {
        userId
        status
      }
    }
    `,
    { input: { userId, newStatus } },
  );
}

async function deleteUser(userId: string, confirmation: string) {
  await graphqlRequest(
    `
    mutation DeleteUser($input: DeleteUserInput!) {
      deleteUser(input: $input) {
        success
        userId
      }
    }
    `,
    { input: { userId, confirmation } },
  );
}

async function createTenantUser(data: {
  tenantId: string;
  email: string;
  name: string;
  role: string;
}) {
  await graphqlRequest(
    `
    mutation CreateTenantUser($input: CreateTenantUserInput!) {
      createTenantUser(input: $input) {
        userId
        membershipId
      }
    }
    `,
    { input: data },
  );
}

// ─── Helpers ───────────────────────────────────────────────────

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

// ─── Skeletons ────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────

const ITEMS_PER_PAGE = [10, 25, 50];

export default function UsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    tenantId: "",
    email: "",
    name: "",
    role: "SCHOOL_ADMIN",
  });
  const [createError, setCreateError] = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const activeCount = users.filter((u) =>
    u.memberships.some((m) => m.status === "ACTIVE"),
  ).length;
  const superAdminCount = users.filter((u) => u.isGlobalAdmin).length;

  // ── Handlers ─────────────────────────────────────────────────

  const handleToggleStatus = async (user: UserListItem) => {
    const membership = user.memberships[0];
    if (!membership) return;
    const newStatus = membership.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setActionLoading(user.id);
    try {
      await changeUserStatus(user.id, newStatus);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (deleteConfirm !== "DELETE") {
      setDeleteError('Type "DELETE" to confirm');
      return;
    }
    setActionLoading(deleteTarget.id);
    try {
      await deleteUser(deleteTarget.id, "DELETE");
      setDeleteTarget(null);
      setDeleteConfirm("");
      setDeleteError("");
      await loadUsers();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete user",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = async () => {
    setCreateError("");
    if (!createForm.tenantId || !createForm.email || !createForm.name) {
      setCreateError("All fields are required");
      return;
    }
    setActionLoading("create");
    try {
      await createTenantUser(createForm);
      setCreateOpen(false);
      setCreateForm({
        tenantId: "",
        email: "",
        name: "",
        role: "SCHOOL_ADMIN",
      });
      await loadUsers();
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create user",
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Users
              </h1>
              {!loading && (
                <span className="text-sm font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {users.length}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage users across all tenants
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              disabled={loading}
              className="h-9 gap-2"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", loading && "animate-spin")}
              />
              <span className="text-xs font-medium">Refresh</span>
            </Button>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Create User</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Create Tenant User</DialogTitle>
                  <DialogDescription>
                    Create a staff, school admin, or school manager in a tenant.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Tenant ID</Label>
                    <Input
                      placeholder="tenant-uuid"
                      className="rounded-xl"
                      value={createForm.tenantId}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          tenantId: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="John Doe"
                      className="rounded-xl"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="john@school.com"
                      className="rounded-xl"
                      value={createForm.email}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={createForm.role}
                      onValueChange={(v) =>
                        setCreateForm({ ...createForm, role: v })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SCHOOL_ADMIN">
                          School Admin
                        </SelectItem>
                        <SelectItem value="SCHOOL_MANAGER">
                          School Manager
                        </SelectItem>
                        <SelectItem value="STAFF">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {createError && (
                    <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-3 rounded-xl border border-red-200">
                      {createError}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="rounded-xl"
                    onClick={handleCreate}
                    disabled={actionLoading === "create"}
                  >
                    {actionLoading === "create" ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {[
            {
              label: "Total Users",
              value: String(users.length),
              change: "From GraphQL",
              icon: Users,
              color: "text-blue-600",
              gradient: "from-blue-500/10 to-blue-500/5",
            },
            {
              label: "Active",
              value: String(activeCount),
              change:
                users.length > 0
                  ? `${Math.round((activeCount / users.length) * 100)}% of all`
                  : "—",
              icon: CheckCircle,
              color: "text-green-600",
              gradient: "from-green-500/10 to-green-500/5",
            },
            {
              label: "Super Admins",
              value: String(superAdminCount),
              change: "Platform administrators",
              icon: Shield,
              color: "text-violet-600",
              gradient: "from-violet-500/10 to-violet-500/5",
            },
            {
              label: "Suspended",
              value: String(
                users.filter((u) =>
                  u.memberships.some((m) => m.status === "SUSPENDED"),
                ).length,
              ),
              change: "Requires attention",
              icon: XCircle,
              color: "text-red-600",
              gradient: "from-red-500/10 to-red-500/5",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  "relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-5 shadow-sm bg-gradient-to-br dark:from-slate-900 dark:to-slate-900/80",
                  stat.gradient,
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm flex items-center justify-center">
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search by name, email, or tenant..."
              className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          {!loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">{filtered.length}</span> results
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-4 p-5 bg-red-50/80 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 rounded-2xl shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                Failed to load users
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                {error}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && !error && <TableSkeleton />}

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
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2.5 text-xs rounded-lg"
                                onClick={() => handleToggleStatus(user)}
                                disabled={actionLoading === user.id}
                              >
                                {actionLoading === user.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : status === "ACTIVE" ? (
                                  <XCircle className="h-3.5 w-3.5 mr-1 text-amber-500" />
                                ) : (
                                  <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-500" />
                                )}
                                {status === "ACTIVE" ? "Suspend" : "Activate"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2.5 text-xs rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={() => {
                                  setDeleteTarget(user);
                                  setDeleteConfirm("");
                                  setDeleteError("");
                                }}
                                disabled={actionLoading === user.id}
                              >
                                <AlertTriangle className="h-3.5 w-3.5 mr-1" />{" "}
                                Delete
                              </Button>
                            </div>
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

        {/* Pagination */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">Page {page}</span>
              <span>of {totalPages}</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span>
                Showing {(page - 1) * perPage + 1}–
                {Math.min(page * perPage, filtered.length)} of {filtered.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Show</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {ITEMS_PER_PAGE.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span>per page</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2)
                      pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={cn(
                          "h-8 min-w-[2rem] px-2 rounded-lg text-xs font-medium transition-colors",
                          page === pageNum
                            ? "bg-primary text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800",
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Shield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function AlertCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
