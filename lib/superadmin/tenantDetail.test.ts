import { describe, expect, it } from "vitest";
import {
  buildTenantDetail,
  countActiveUsersForTenant,
  filterSubscriptionsForTenant,
  filterUsersForTenant,
  pickActiveSubscription,
} from "./tenantDetail";
import type {
  AdminUserListItem,
  SubscriptionRecord,
  TenantRecord,
} from "./types";

const tenant: TenantRecord = {
  id: "tenant-1",
  name: "Alpha School",
  subdomain: "alpha",
  isActive: true,
  status: "ACTIVE",
  createdAt: "2026-01-01T00:00:00Z",
};

const subscriptions: SubscriptionRecord[] = [
  {
    id: "sub-old",
    status: "CANCELLED",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    tenant: { id: "tenant-1", name: "Alpha School" },
    plan: { id: 1, name: "Starter" },
  },
  {
    id: "sub-active",
    status: "ACTIVE",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    tenant: { id: "tenant-1", name: "Alpha School" },
    plan: { id: 2, name: "Standard" },
  },
  {
    id: "sub-other",
    status: "ACTIVE",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    tenant: { id: "tenant-2", name: "Beta School" },
    plan: { id: 2, name: "Standard" },
  },
];

const users: AdminUserListItem[] = [
  {
    id: "user-1",
    email: "admin@alpha.edu",
    name: "Admin One",
    isGlobalAdmin: false,
    globalRole: "NONE",
    createdAt: "2026-01-02T00:00:00Z",
    memberships: [
      {
        id: "m1",
        role: "SCHOOL_ADMIN",
        status: "ACTIVE",
        tenantId: "tenant-1",
        tenantName: "Alpha School",
        tenantSubdomain: "alpha",
        joinedAt: "2026-01-02T00:00:00Z",
      },
    ],
  },
  {
    id: "user-2",
    email: "staff@alpha.edu",
    name: "Staff Two",
    isGlobalAdmin: false,
    globalRole: "NONE",
    createdAt: "2026-01-03T00:00:00Z",
    memberships: [
      {
        id: "m2",
        role: "STAFF",
        status: "SUSPENDED",
        tenantId: "tenant-1",
        tenantName: "Alpha School",
        tenantSubdomain: "alpha",
        joinedAt: "2026-01-03T00:00:00Z",
      },
    ],
  },
];

describe("tenant detail helpers", () => {
  it("filters subscriptions and users by tenant", () => {
    expect(filterSubscriptionsForTenant(subscriptions, "tenant-1")).toHaveLength(
      2,
    );
    expect(filterUsersForTenant(users, "tenant-1")).toHaveLength(2);
  });

  it("picks the active subscription over cancelled history", () => {
    const tenantSubscriptions = filterSubscriptionsForTenant(
      subscriptions,
      "tenant-1",
    );
    expect(pickActiveSubscription(tenantSubscriptions)?.id).toBe("sub-active");
  });

  it("counts only active memberships for the tenant", () => {
    expect(countActiveUsersForTenant(users, "tenant-1")).toBe(1);
  });

  it("builds a full tenant detail model", () => {
    const detail = buildTenantDetail({
      tenantId: "tenant-1",
      tenants: [tenant],
      subscriptions,
      users,
      usersHasMore: true,
    });

    expect(detail).not.toBeNull();
    expect(detail?.tenant.name).toBe("Alpha School");
    expect(detail?.activeSubscription?.id).toBe("sub-active");
    expect(detail?.userCount).toBe(2);
    expect(detail?.activeUserCount).toBe(1);
    expect(detail?.usersHasMore).toBe(true);
  });

  it("returns null when the tenant does not exist", () => {
    expect(
      buildTenantDetail({
        tenantId: "missing",
        tenants: [tenant],
        subscriptions,
        users,
      }),
    ).toBeNull();
  });
});
