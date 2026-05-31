import { superAdminGraphqlRequest } from "./graphql";
import type { DashboardStatsRecord } from "./types";

const GET_DASHBOARD_STATS = `
  query GetDashboardStats {
    getDashboardStats {
      totalTenants
      activeSubscriptions
      totalUsers
      estimatedMonthlyRevenue
      tenantsCreatedThisMonth
      usersCreatedThisWeek
    }
  }
`;

export async function fetchDashboardStats(): Promise<DashboardStatsRecord> {
  const data = await superAdminGraphqlRequest<{
    getDashboardStats: DashboardStatsRecord;
  }>(GET_DASHBOARD_STATS);

  return data.getDashboardStats;
}
