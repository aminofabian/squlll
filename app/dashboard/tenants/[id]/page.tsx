"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CreateUserDialog } from "@/components/dashboard/superadmin/CreateUserDialog";
import { DashboardErrorBanner } from "@/components/dashboard/superadmin/DashboardStatCards";
import {
  AdminPageHeader,
  AdminTableSkeleton,
} from "@/components/dashboard/superadmin/AdminPageChrome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatSubscriptionDate,
  getSubscriptionDaysRemaining,
  subscriptionStatusBadgeVariant,
} from "@/lib/superadmin/subscriptions";
import { useTenantDetail } from "@/lib/superadmin/useTenantDetail";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CreditCard,
  Plus,
  Settings2,
  Users,
} from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TenantDetailPage() {
  const params = useParams<{ id: string }>();
  const tenantId = params.id;
  const {
    detail,
    loading,
    creatingUser,
    error,
    warning,
    refresh,
    createUser,
  } = useTenantDetail(tenantId);
  const [createOpen, setCreateOpen] = useState(false);

  const activeSubscription = detail?.activeSubscription;
  const remaining = activeSubscription
    ? getSubscriptionDaysRemaining(activeSubscription.endDate)
    : null;

  const stats = detail
    ? [
        {
          label: "Users",
          value: detail.usersHasMore
            ? `${detail.userCount}+`
            : String(detail.userCount),
          helper: detail.usersHasMore
            ? "More users may exist on the platform"
            : "Linked to this school",
          icon: Users,
          color: "text-blue-600",
          gradient: "from-blue-500/10 to-blue-500/5",
        },
        {
          label: "Active users",
          value: String(detail.activeUserCount),
          helper: "With active membership",
          icon: Users,
          color: "text-green-600",
          gradient: "from-green-500/10 to-green-500/5",
        },
        {
          label: "Subscription",
          value: activeSubscription
            ? activeSubscription.status.replace("_", " ")
            : "None",
          helper: activeSubscription?.plan?.name ?? "No plan assigned",
          icon: CreditCard,
          color: "text-violet-600",
          gradient: "from-violet-500/10 to-violet-500/5",
        },
        {
          label: "Registered",
          value: formatDate(detail.tenant.createdAt),
          helper: `Subdomain: ${detail.tenant.subdomain}`,
          icon: CalendarDays,
          color: "text-amber-600",
          gradient: "from-amber-500/10 to-amber-500/5",
        },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Link
          href="/dashboard/tenants"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to schools
        </Link>

        <AdminPageHeader
          icon={Building2}
          title={detail?.tenant.name ?? "School details"}
          description={
            detail
              ? `${detail.tenant.subdomain} · ${detail.tenant.status === "ACTIVE" ? "Active" : "Inactive"}`
              : "Loading school profile..."
          }
          loading={loading}
          onRefresh={refresh}
          actions={
            detail ? (
              <div className="flex flex-wrap gap-2">
                {activeSubscription ? (
                  <Button variant="outline" size="sm" className="h-9 gap-2" asChild>
                    <Link
                      href={`/dashboard/subscriptions?manage=${activeSubscription.id}`}
                    >
                      <Settings2 className="h-4 w-4" />
                      Manage subscription
                    </Link>
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  className="h-9 gap-2"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add user
                </Button>
              </div>
            ) : null
          }
        />

        {error ? (
          <DashboardErrorBanner message={error} onRetry={refresh} />
        ) : null}

        {warning ? (
          <DashboardErrorBanner
            message={warning}
            onRetry={refresh}
            variant="warning"
          />
        ) : null}

        {loading && !detail ? <AdminTableSkeleton rows={4} /> : null}

        {detail ? (
          <>
            <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br p-5 shadow-sm dark:border-slate-800/60 dark:from-slate-900 dark:to-slate-900/80 ${stat.gradient}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm dark:bg-slate-800/80">
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">
                          {stat.label}
                        </p>
                        <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                          {stat.value}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                          {stat.helper}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {activeSubscription && remaining ? (
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Current subscription
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Badge
                    variant={subscriptionStatusBadgeVariant(
                      activeSubscription.status,
                    )}
                    className="text-[10px] font-semibold uppercase"
                  >
                    {activeSubscription.status.replace("_", " ")}
                  </Badge>
                  <span>{activeSubscription.plan?.name ?? "Unknown plan"}</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span>
                    {formatSubscriptionDate(activeSubscription.startDate)} –{" "}
                    {formatSubscriptionDate(activeSubscription.endDate)}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span
                    className={
                      remaining.urgent ? "font-medium text-red-500" : undefined
                    }
                  >
                    {remaining.label} left
                  </span>
                </div>
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
                <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Subscription history
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {detail.subscriptions.length} record
                    {detail.subscriptions.length === 1 ? "" : "s"}
                  </p>
                </div>
                {detail.subscriptions.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-slate-500">
                    No subscriptions for this school
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {detail.subscriptions.map((subscription) => (
                      <div
                        key={subscription.id}
                        className="flex items-center justify-between gap-3 px-5 py-3.5"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {subscription.plan?.name ?? "Unknown plan"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatSubscriptionDate(subscription.startDate)} –{" "}
                            {formatSubscriptionDate(subscription.endDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={subscriptionStatusBadgeVariant(
                              subscription.status,
                            )}
                            className="text-[10px] font-semibold uppercase"
                          >
                            {subscription.status.replace("_", " ")}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                            <Link
                              href={`/dashboard/subscriptions?manage=${subscription.id}`}
                            >
                              Manage
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
                <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Users
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Staff and admins at this school
                  </p>
                </div>
                {detail.users.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm text-slate-500">No users yet</p>
                    <Button
                      size="sm"
                      className="mt-4"
                      onClick={() => setCreateOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add first user
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {detail.users.slice(0, 8).map((user) => {
                      const membership = user.memberships.find(
                        (item) => item.tenantId === tenantId,
                      );
                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between gap-3 px-5 py-3.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                              {user.name}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                              {user.email}
                            </p>
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-2">
                            <Badge variant="outline" className="text-[10px] uppercase">
                              {membership?.role ?? "—"}
                            </Badge>
                            <Badge
                              variant={
                                membership?.status === "ACTIVE"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-[10px] uppercase"
                            >
                              {membership?.status ?? "—"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {detail.users.length > 8 ? (
                  <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
                    <Button variant="link" size="sm" className="h-auto p-0" asChild>
                      <Link href="/dashboard/users">View all users</Link>
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </div>

      {detail ? (
        <CreateUserDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          saving={creatingUser}
          defaultTenantId={detail.tenant.id}
          onSubmit={createUser}
        />
      ) : null}
    </DashboardLayout>
  );
}
