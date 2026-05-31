"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardActivityFeed } from "@/components/dashboard/superadmin/DashboardActivityFeed";
import { DashboardExpiringList } from "@/components/dashboard/superadmin/DashboardExpiringList";
import { DashboardGrowthChart } from "@/components/dashboard/superadmin/DashboardGrowthChart";
import { DashboardQuickActions } from "@/components/dashboard/superadmin/DashboardQuickActions";
import { AdminPageHeader } from "@/components/dashboard/superadmin/AdminPageChrome";
import {
  DashboardErrorBanner,
  DashboardStatCards,
} from "@/components/dashboard/superadmin/DashboardStatCards";
import { useSuperAdminDashboard } from "@/lib/superadmin/useSuperAdminDashboard";
import { LayoutDashboard } from "lucide-react";

function formatLastUpdated(date?: Date): string {
  if (!date) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const {
    stats,
    activity,
    expiring,
    growth,
    quickActions,
    growthPeriodLabel,
    lastUpdated,
    loading,
    error,
    warning,
    refresh,
  } = useSuperAdminDashboard();

  const showContent = !error || stats.length > 0;
  const description =
    !loading && lastUpdated
      ? `Overview of schools, subscriptions, and platform activity · Updated ${formatLastUpdated(lastUpdated)}`
      : "Overview of schools, subscriptions, and platform activity";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <AdminPageHeader
          icon={LayoutDashboard}
          title="Dashboard"
          description={description}
          loading={loading}
          onRefresh={refresh}
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

        {showContent ? (
          <>
            <section aria-label="Key metrics">
              <DashboardStatCards stats={stats} loading={loading} />
            </section>

            <section
              aria-label="Activity and subscriptions"
              className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-3"
            >
              <DashboardActivityFeed activity={activity} loading={loading} />
              <DashboardExpiringList expiring={expiring} loading={loading} />
            </section>

            <section
              aria-label="Growth and actions"
              className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-3"
            >
              <DashboardGrowthChart
                growth={growth}
                periodLabel={growthPeriodLabel}
                loading={loading}
              />
              <div className="lg:col-span-2">
                <DashboardQuickActions actions={quickActions} />
              </div>
            </section>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
