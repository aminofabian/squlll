"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardErrorBanner } from "@/components/dashboard/superadmin/DashboardStatCards";
import {
  AdminPageHeader,
  AdminSearchBar,
  AdminStatGrid,
  AdminTableSkeleton,
} from "@/components/dashboard/superadmin/AdminPageChrome";
import { SubscriptionManageDrawer } from "@/components/dashboard/superadmin/SubscriptionManageDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  countSubscriptionsByStatus,
  formatSubscriptionDate,
  getSubscriptionDaysRemaining,
  subscriptionStatusBadgeVariant,
  subscriptionStatusColor,
} from "@/lib/superadmin/subscriptions";
import { usePlans } from "@/lib/superadmin/usePlans";
import { useSubscriptions } from "@/lib/superadmin/useSubscriptions";
import type { SubscriptionRecord } from "@/lib/superadmin/types";
import {
  TicketCheck,
  Circle,
  CalendarDays,
  Building2,
  XCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubscriptionsPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <AdminTableSkeleton rows={4} />
        </DashboardLayout>
      }
    >
      <SubscriptionsPageContent />
    </Suspense>
  );
}

function SubscriptionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    subscriptions,
    loading,
    savingId,
    error,
    refresh,
    saveSubscription,
    cancelSubscriptionById,
  } = useSubscriptions();
  const { plans } = usePlans();
  const [searchTerm, setSearchTerm] = useState("");
  const [manageTarget, setManageTarget] = useState<SubscriptionRecord | null>(
    null,
  );

  useEffect(() => {
    const manageId = searchParams.get("manage");
    if (!manageId || loading) return;

    const subscription = subscriptions.find((sub) => sub.id === manageId);
    if (subscription) {
      setManageTarget(subscription);
      router.replace("/dashboard/subscriptions", { scroll: false });
    }
  }, [searchParams, loading, subscriptions, router]);

  const filtered = useMemo(() => {
    if (!searchTerm) return subscriptions;
    const term = searchTerm.toLowerCase();
    return subscriptions.filter(
      (sub) =>
        sub.tenant?.name?.toLowerCase().includes(term) ||
        sub.plan?.name?.toLowerCase().includes(term) ||
        sub.status.toLowerCase().includes(term),
    );
  }, [subscriptions, searchTerm]);

  const stats = useMemo(
    () => [
      {
        label: "Active",
        value: String(countSubscriptionsByStatus(subscriptions, "ACTIVE")),
        icon: CheckCircle,
        color: "text-green-600",
        gradient: "from-green-500/10 to-green-500/5",
      },
      {
        label: "Trial",
        value: String(countSubscriptionsByStatus(subscriptions, "TRIAL")),
        icon: Clock,
        color: "text-blue-600",
        gradient: "from-blue-500/10 to-blue-500/5",
      },
      {
        label: "Grace period",
        value: String(
          countSubscriptionsByStatus(subscriptions, "GRACE_PERIOD"),
        ),
        icon: AlertTriangle,
        color: "text-amber-600",
        gradient: "from-amber-500/10 to-amber-500/5",
      },
      {
        label: "Suspended",
        value: String(countSubscriptionsByStatus(subscriptions, "SUSPENDED")),
        icon: XCircle,
        color: "text-red-600",
        gradient: "from-red-500/10 to-red-500/5",
      },
    ],
    [subscriptions],
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <AdminPageHeader
          icon={TicketCheck}
          title="Subscriptions"
          description="School subscriptions across all plans"
          count={subscriptions.length}
          loading={loading}
          onRefresh={refresh}
        />

        <AdminStatGrid stats={stats} />

        <AdminSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by school, plan, or status..."
          resultCount={filtered.length}
          loading={loading}
        />

        {error ? (
          <DashboardErrorBanner message={error} onRetry={refresh} />
        ) : null}

        {loading && !error ? <AdminTableSkeleton rows={4} /> : null}

        {!loading && !error ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {[
                      "School",
                      "Plan",
                      "Status",
                      "Period",
                      "Time left",
                      "Auto-renew",
                      "Created",
                      "",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filtered.map((sub) => {
                    const remaining = getSubscriptionDaysRemaining(sub.endDate);
                    return (
                      <tr
                        key={sub.id}
                        className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
                              <Building2 className="h-4.5 w-4.5 text-primary" />
                            </div>
                            <span className="max-w-[180px] truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {sub.tenant?.name || sub.tenant?.id || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold uppercase tracking-wide"
                          >
                            {sub.plan?.name || `Plan #${sub.plan?.id}`}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <Circle
                              className={cn(
                                "h-2 w-2",
                                subscriptionStatusColor(sub.status),
                              )}
                            />
                            <Badge
                              variant={subscriptionStatusBadgeVariant(sub.status)}
                              className="text-[10px] font-semibold uppercase tracking-wide"
                            >
                              {sub.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                            <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="text-xs">
                              {formatSubscriptionDate(sub.startDate)} –{" "}
                              {formatSubscriptionDate(sub.endDate)}
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
                            className="text-[10px] font-semibold uppercase"
                          >
                            {sub.autoRenew ? "On" : "Off"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-slate-500">
                            {formatSubscriptionDate(sub.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 rounded-lg px-2.5 text-xs"
                            onClick={() => setManageTarget(sub)}
                          >
                            <Settings2 className="h-3.5 w-3.5" />
                            Manage
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <TicketCheck className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {searchTerm
                    ? "No subscriptions match your search"
                    : "No subscriptions yet"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Subscriptions appear here when schools are assigned a plan
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <SubscriptionManageDrawer
        open={!!manageTarget}
        onOpenChange={(open) => {
          if (!open) setManageTarget(null);
        }}
        subscription={manageTarget}
        plans={plans}
        saving={manageTarget ? savingId === manageTarget.id : false}
        onSave={saveSubscription}
        onCancel={cancelSubscriptionById}
      />
    </DashboardLayout>
  );
}
