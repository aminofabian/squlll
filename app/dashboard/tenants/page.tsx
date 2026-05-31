"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Users,
  CreditCard,
  CalendarDays,
  Circle,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  status: string;
  createdAt: string;
}

interface TenantListResponse {
  getAllTenants: Tenant[];
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

async function fetchTenants(): Promise<Tenant[]> {
  const data = await graphqlRequest(`
    query GetAllTenants {
      getAllTenants {
        id
        name
        subdomain
        isActive
        status
        createdAt
      }
    }
  `);
  return data.getAllTenants;
}

// ─── Badge Helpers ─────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <div className="flex items-center gap-2">
      <Circle
        className={cn(
          "w-2 h-2",
          isActive
            ? "fill-green-500 text-green-500"
            : "fill-slate-400 text-slate-400",
        )}
      />
      <Badge
        variant={isActive ? "default" : "secondary"}
        className="text-[10px] uppercase font-semibold tracking-wide"
      >
        {isActive ? "Active" : "Inactive"}
      </Badge>
    </div>
  );
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

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTenants();
      setTenants(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const filtered = useMemo(() => {
    if (!searchTerm) return tenants;
    const term = searchTerm.toLowerCase();
    return tenants.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.subdomain.toLowerCase().includes(term),
    );
  }, [tenants, searchTerm]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const activeCount = tenants.filter((t) => t.status === "ACTIVE").length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Tenants
              </h1>
              {!loading && (
                <span className="text-sm font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {tenants.length}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Schools registered on the platform
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadTenants}
              disabled={loading}
              className="h-9 gap-2"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", loading && "animate-spin")}
              />
              <span className="text-xs font-medium">Refresh</span>
            </Button>
            <Button size="sm" className="h-9 gap-2" disabled>
              <Plus className="h-4 w-4" />
              <span>Add Tenant</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {[
            {
              label: "Total Tenants",
              value: String(tenants.length),
              change: "From GraphQL",
              icon: Building2,
              color: "text-blue-600",
              gradient: "from-blue-500/10 to-blue-500/5",
            },
            {
              label: "Active",
              value: String(activeCount),
              change:
                tenants.length > 0
                  ? `${Math.round((activeCount / tenants.length) * 100)}% of all`
                  : "—",
              icon: CreditCard,
              color: "text-green-600",
              gradient: "from-green-500/10 to-green-500/5",
            },
            {
              label: "Subdomains",
              value: String(new Set(tenants.map((t) => t.subdomain)).size),
              change: "Unique subdomains",
              icon: Users,
              color: "text-violet-600",
              gradient: "from-violet-500/10 to-violet-500/5",
            },
            {
              label: "Inactive",
              value: String(
                tenants.filter((t) => t.status !== "ACTIVE").length,
              ),
              change: "Requires attention",
              icon: CalendarDays,
              color: "text-amber-600",
              gradient: "from-amber-500/10 to-amber-500/5",
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
              placeholder="Search by school or subdomain..."
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
                Failed to load tenants
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                {error}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Make sure the backend is running. The{" "}
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">
                  getAllTenants
                </code>{" "}
                query was just added — restart the backend.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadTenants}
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
                    {["School", "Subdomain", "Status", "Created"].map((h) => (
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
                  {paginated.map((tenant) => (
                    <tr
                      key={tenant.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary">
                              {tenant.name.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                              {tenant.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-slate-500">
                          {tenant.subdomain}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={tenant.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-slate-500">
                          {new Date(tenant.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 px-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {searchTerm
                    ? "No tenants match your search"
                    : "No tenants found"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {searchTerm
                    ? "Try adjusting your search"
                    : "Tenants will appear here once schools register"}
                </p>
              </div>
            )}
          </div>
        )}

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
