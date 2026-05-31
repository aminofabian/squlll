import { superAdminGraphqlRequest } from "./graphql";
import { buildDashboardData } from "./mapDashboardData";
import type {
  AuditLogRecord,
  SubscriptionRecord,
  TenantRecord,
  UserRecord,
} from "./types";

const USER_PAGE_SIZE = 100;

async function fetchTenants(): Promise<TenantRecord[]> {
  const data = await superAdminGraphqlRequest<{ getAllTenants: TenantRecord[] }>(
    `
      query DashboardTenants {
        getAllTenants {
          id
          name
          subdomain
          isActive
          status
          createdAt
        }
      }
    `,
  );
  return data.getAllTenants ?? [];
}

async function fetchSubscriptions(): Promise<SubscriptionRecord[]> {
  const data = await superAdminGraphqlRequest<{
    allTenantSubscriptions: {
      success: boolean;
      subscriptions: SubscriptionRecord[];
    };
  }>(
    `
      query DashboardSubscriptions {
        allTenantSubscriptions {
          success
          subscriptions {
            id
            status
            startDate
            endDate
            tenant { id name }
            plan { id name monthlyPrice }
          }
        }
      }
    `,
  );
  return data.allTenantSubscriptions?.subscriptions ?? [];
}

async function fetchUsers(): Promise<UserRecord[]> {
  const data = await superAdminGraphqlRequest<{ getAllUsers: UserRecord[] }>(
    `
      query DashboardUsers($pagination: AdminUserPaginationInput!) {
        getAllUsers(pagination: $pagination) {
          id
          email
          name
          createdAt
        }
      }
    `,
    {
      pagination: { limit: USER_PAGE_SIZE },
    },
  );
  return data.getAllUsers ?? [];
}

async function fetchAuditLogs(): Promise<AuditLogRecord[]> {
  const data = await superAdminGraphqlRequest<{ getAuditLogs: AuditLogRecord[] }>(
    `
      query DashboardAuditLogs {
        getAuditLogs {
          id
          message
          source
          level
          metadata
          timestamp
        }
      }
    `,
  );
  return data.getAuditLogs ?? [];
}

export async function fetchSuperAdminDashboard() {
  const [tenantsResult, subscriptionsResult, usersResult, auditLogsResult] =
    await Promise.allSettled([
      fetchTenants(),
      fetchSubscriptions(),
      fetchUsers(),
      fetchAuditLogs(),
    ]);

  const errors: string[] = [];

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

  const users =
    usersResult.status === "fulfilled" ? usersResult.value : [];
  if (usersResult.status === "rejected") {
    errors.push(
      usersResult.reason instanceof Error
        ? usersResult.reason.message
        : "Failed to load users",
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
    users,
    usersHasMore: users.length >= USER_PAGE_SIZE,
    auditLogs,
  });

  return {
    ...dashboard,
    partialErrors: errors,
  };
}
