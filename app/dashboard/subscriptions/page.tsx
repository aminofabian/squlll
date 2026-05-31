"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TicketCheck,
  Search,
  Circle,
  CalendarDays,
  AlertTriangle,
  Building2,
  CreditCard,
  XCircle,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

type SubscriptionStatus =
  | "TRIAL"
  | "ACTIVE"
  | "GRACE_PERIOD"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED";

interface Subscription {
  id: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  trialEndDate: string | null;
  graceEndDate: string | null;
  autoRenew: boolean;
  cancellationReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
  tenant?: { id: string; name: string };
  plan?: { id: number; name: string; monthlyPrice?: number };
}

interface SubscriptionsResponse {
  success: boolean;
  subscriptions: Subscription[];
}

// ─── GraphQL ───────────────────────────────────────────────────

async function fetchSubscriptions(): Promise<Subscription[]> {
  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query AllTenantSubscriptions {
          allTenantSubscriptions {
            success
            subscriptions {
              id
              status
              startDate
              endDate
              trialEndDate
              graceEndDate
              autoRenew
              cancellationReason
              cancelledAt
              createdAt
              tenant { id name }
              plan { id name }
            }
          }
        }
      `,
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "GraphQL error");
  const data: SubscriptionsResponse = json.data.allTenantSubscriptions;
  return data.subscriptions || [];
}

// ─── Helpers ───────────────────────────────────────────────────

function statusBadgeVariant(
  status: SubscriptionStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "TRIAL":
      return "secondary";
    case "GRACE_PERIOD":
      return "secondary";
    case "SUSPENDED":
      return "destructive";
    case "CANCELLED":
      return "outline";
    case "EXPIRED":
      return "outline";
  }
}

function statusColor(status: SubscriptionStatus): string {
  switch (status) {
    case "ACTIVE":
      return "fill-green-500 text-green-500";
    case "TRIAL":
      return "fill-blue-500 text-blue-500";
    case "GRACE_PERIOD":
      return "fill-amber-500 text-amber-500";
    case "SUSPENDED":
      return "fill-red-500 text-red-500";
    case "CANCELLED":
      return "fill-slate-400 text-slate-400";
    case "EXPIRED":
      return "fill-slate-400 text-slate-400";
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysRemaining(endDate: string): { label: string; urgent: boolean } {
  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Overdue", urgent: true };
  if (days === 0) return { label: "Today", urgent: true };
  if (days === 1) return { label: "Tomorrow", urgent: true };
  if (days <= 7) return { label: `${days}d`, urgent: true };
  if (days <= 30) return { label: `${days}d`, urgent: false };
  return { label: `${days}d`, urgent: false };
}

// ─── Skeletons ────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-12 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSubscriptions();
      setSubscriptions(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load subscriptions",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const filtered = useMemo(() => {
    if (!searchTerm) return subscriptions;
    const term = searchTerm.toLowerCase();
    return subscriptions.filter(
      (s) =>
        s.tenant?.name?.toLowerCase().includes(term) ||
        s.plan?.name?.toLowerCase().includes(term) ||
        s.status.toLowerCase().includes(term),
    );
  }, [subscriptions, searchTerm]);

  // Stats
  const totalActive = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const totalTrial = subscriptions.filter((s) => s.status === "TRIAL").length;
  const totalGrace = subscriptions.filter(
    (s) => s.status === "GRACE_PERIOD",
  ).length;
  const totalSuspended = subscriptions.filter(
    (s) => s.status === "SUSPENDED",
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TicketCheck className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Subscriptions
              </h1>
              {!loading && (
                <span className="text-sm font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {subscriptions.length}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tenant subscriptions across all plans
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSubscriptions}
            disabled={loading}
            className="h-9 gap-2"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", loading && "animate-spin")}
            />
            <span className="text-xs font-medium">Refresh</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {[
            {
              label: "Active",
              value: String(totalActive),
              icon: CheckCircle,
              color: "text-green-600",
              gradient: "from-green-500/10 to-green-500/5",
            },
            {
              label: "Trial",
              value: String(totalTrial),
              icon: Clock,
              color: "text-blue-600",
              gradient: "from-blue-500/10 to-blue-500/5",
            },
            {
              label: "Grace Period",
              value: String(totalGrace),
              icon: AlertTriangle,
              color: "text-amber-600",
              gradient: "from-amber-500/10 to-amber-500/5",
            },
            {
              label: "Suspended",
              value: String(totalSuspended),
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search by school, plan, or status..."
            className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-4 p-5 bg-red-50/80 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 rounded-2xl shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                Failed to load subscriptions
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                {error}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSubscriptions}
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
                      "School",
                      "Plan",
                      "Status",
                      "Period",
                      "Time Left",
                      "Auto-Renew",
                      "Created",
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
                  {filtered.map((sub) => {
                    const remaining = getDaysRemaining(sub.endDate);
                    return (
                      <tr
                        key={sub.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-4.5 w-4.5 text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                              {sub.tenant?.name || sub.tenant?.id || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-semibold tracking-wide"
                          >
                            {sub.plan?.name || `Plan #${sub.plan?.id}`}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <Circle
                              className={cn("w-2 h-2", statusColor(sub.status))}
                            />
                            <Badge
                              variant={statusBadgeVariant(sub.status)}
                              className="text-[10px] uppercase font-semibold tracking-wide"
                            >
                              {sub.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                            <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="text-xs">
                              {formatDate(sub.startDate)} –{" "}
                              {formatDate(sub.endDate)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              "text-sm font-medium tabular-nums",
                              remaining.urgent
                                ? "text-red-500"
                                : "text-slate-500",
                            )}
                          >
                            {remaining.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            variant={sub.autoRenew ? "default" : "secondary"}
                            className="text-[10px] uppercase font-semibold"
                          >
                            {sub.autoRenew ? "On" : "Off"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-slate-500">
                            {formatDate(sub.createdAt)}
                          </span>
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
                  <TicketCheck className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {searchTerm
                    ? "No subscriptions match your search"
                    : "No subscriptions yet"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Subscriptions will appear here once tenants are created
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
