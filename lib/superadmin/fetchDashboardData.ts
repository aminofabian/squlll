import { buildDashboardData } from "./mapDashboardData";
import { fetchAuditLogs } from "./auditLogsApi";
import { fetchDashboardStats } from "./dashboardStatsApi";
import { fetchAllSubscriptions } from "./subscriptionsApi";
import { fetchAllTenants } from "./tenantsApi";

export async function fetchSuperAdminDashboard() {
  const [statsResult, tenantsResult, subscriptionsResult, auditLogsResult] =
    await Promise.allSettled([
      fetchDashboardStats(),
      fetchAllTenants(),
      fetchAllSubscriptions(),
      fetchAuditLogs(),
    ]);

  const errors: string[] = [];

  const stats =
    statsResult.status === "fulfilled" ? statsResult.value : null;
  if (statsResult.status === "rejected") {
    errors.push(
      statsResult.reason instanceof Error
        ? statsResult.reason.message
        : "Failed to load dashboard stats",
    );
  }

  const tenants =
    tenantsResult.status === "fulfilled" ? tenantsResult.value : [];
  if (tenantsResult.status === "rejected") {
    errors.push(
      tenantsResult.reason instanceof Error
        ? tenantsResult.reason.message
        : "Failed to load schools",
    );
  }

  const subscriptions =
    subscriptionsResult.status === "fulfilled"
      ? subscriptionsResult.value
      : [];
  if (subscriptionsResult.status === "rejected") {
    errors.push(
      subscriptionsResult.reason instanceof Error
        ? subscriptionsResult.reason.message
        : "Failed to load subscriptions",
    );
  }

  const auditLogs =
    auditLogsResult.status === "fulfilled" ? auditLogsResult.value : [];
  if (auditLogsResult.status === "rejected") {
    errors.push(
      auditLogsResult.reason instanceof Error
        ? auditLogsResult.reason.message
        : "Failed to load activity",
    );
  }

  if (errors.length === 4) {
    throw new Error(errors[0] ?? "Failed to load dashboard data");
  }

  const dashboard = buildDashboardData({
    tenants,
    subscriptions,
    stats,
    auditLogs,
  });

  return {
    ...dashboard,
    partialErrors: errors,
  };
}
