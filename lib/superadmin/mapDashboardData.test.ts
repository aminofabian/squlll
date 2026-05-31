import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  buildDashboardStats,
  mapAuditLogsToActivity,
  mapExpiringSubscriptions,
} from "./mapDashboardData";
import type {
  AuditLogRecord,
  DashboardStatsRecord,
  SubscriptionRecord,
  TenantRecord,
} from "./types";

describe("mapExpiringSubscriptions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-31T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns subscriptions expiring within 30 days sorted by urgency", () => {
    const subscriptions: SubscriptionRecord[] = [
      {
        id: "sub-1",
        status: "ACTIVE",
        startDate: "2026-01-01",
        endDate: "2026-06-20",
        tenant: { id: "t1", name: "Alpha School" },
        plan: { id: 1, name: "Starter" },
      },
      {
        id: "sub-2",
        status: "TRIAL",
        startDate: "2026-04-01",
        endDate: "2026-06-05",
        tenant: { id: "t2", name: "Beta School" },
        plan: { id: 2, name: "Standard" },
      },
      {
        id: "sub-3",
        status: "CANCELLED",
        startDate: "2026-01-01",
        endDate: "2026-06-10",
        tenant: { id: "t3", name: "Ignored School" },
        plan: { id: 1, name: "Starter" },
      },
    ];

    const result = mapExpiringSubscriptions(subscriptions);

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("sub-2");
    expect(result[0]?.href).toBe("/dashboard/subscriptions?manage=sub-2");
    expect(result[1]?.id).toBe("sub-1");
  });
});

describe("buildDashboardStats", () => {
  const tenants: TenantRecord[] = [
    {
      id: "t1",
      name: "Alpha",
      subdomain: "alpha",
      isActive: true,
      status: "ACTIVE",
      createdAt: "2026-05-01T00:00:00Z",
    },
  ];

  const subscriptions: SubscriptionRecord[] = [
    {
      id: "sub-1",
      status: "ACTIVE",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      tenant: { id: "t1", name: "Alpha" },
      plan: { id: 1, name: "Starter", monthlyPrice: 99 },
    },
  ];

  it("uses API stats for exact user counts when provided", () => {
    const stats: DashboardStatsRecord = {
      totalTenants: 12,
      activeSubscriptions: 8,
      totalUsers: 240,
      estimatedMonthlyRevenue: 792,
      tenantsCreatedThisMonth: 2,
      usersCreatedThisWeek: 5,
    };

    const result = buildDashboardStats(tenants, subscriptions, stats);
    const usersStat = result.find((item) => item.id === "users");

    expect(usersStat?.value).toBe("240");
    expect(usersStat?.helperText).toBe("Across all schools");
  });

  it("shows unavailable user count when stats are missing", () => {
    const result = buildDashboardStats(tenants, subscriptions, null);
    const usersStat = result.find((item) => item.id === "users");

    expect(usersStat?.value).toBe("—");
    expect(usersStat?.helperText).toBe("User count unavailable");
  });
});

describe("mapAuditLogsToActivity", () => {
  it("maps CREATE_TENANT audit entries to school activity", () => {
    const logs: AuditLogRecord[] = [
      {
        id: "log-1",
        message: "CREATE_TENANT",
        source: "SUPER_ADMIN",
        level: "INFO",
        metadata: { name: "Green Valley Academy", subdomain: "green-valley" },
        timestamp: new Date().toISOString(),
      },
    ];

    const result = mapAuditLogsToActivity(logs);

    expect(result[0]?.action).toBe("School created");
    expect(result[0]?.target).toBe("Green Valley Academy");
    expect(result[0]?.type).toBe("tenant");
  });
});
