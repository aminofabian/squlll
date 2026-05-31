import type {
  AdminUserListItem,
  SubscriptionRecord,
  TenantRecord,
} from "./types";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "ACTIVE",
  "TRIAL",
  "GRACE_PERIOD",
]);

export interface TenantDetailData {
  tenant: TenantRecord;
  subscriptions: SubscriptionRecord[];
  activeSubscription: SubscriptionRecord | null;
  users: AdminUserListItem[];
  userCount: number;
  activeUserCount: number;
  usersHasMore: boolean;
}

export function filterUsersForTenant(
  users: AdminUserListItem[],
  tenantId: string,
): AdminUserListItem[] {
  return users.filter((user) =>
    user.memberships.some((membership) => membership.tenantId === tenantId),
  );
}

export function filterSubscriptionsForTenant(
  subscriptions: SubscriptionRecord[],
  tenantId: string,
): SubscriptionRecord[] {
  return subscriptions.filter(
    (subscription) => subscription.tenant?.id === tenantId,
  );
}

export function pickActiveSubscription(
  subscriptions: SubscriptionRecord[],
): SubscriptionRecord | null {
  return (
    subscriptions.find((subscription) =>
      ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status.toUpperCase()),
    ) ??
    subscriptions[0] ??
    null
  );
}

export function countActiveUsersForTenant(
  users: AdminUserListItem[],
  tenantId: string,
): number {
  return users.filter((user) =>
    user.memberships.some(
      (membership) =>
        membership.tenantId === tenantId && membership.status === "ACTIVE",
    ),
  ).length;
}

export function buildTenantDetail(input: {
  tenantId: string;
  tenants: TenantRecord[];
  subscriptions: SubscriptionRecord[];
  users: AdminUserListItem[];
  usersHasMore?: boolean;
}): TenantDetailData | null {
  const tenant = input.tenants.find((item) => item.id === input.tenantId);
  if (!tenant) return null;

  const subscriptions = filterSubscriptionsForTenant(
    input.subscriptions,
    input.tenantId,
  );
  const users = filterUsersForTenant(input.users, input.tenantId);

  return {
    tenant,
    subscriptions,
    activeSubscription: pickActiveSubscription(subscriptions),
    users,
    userCount: users.length,
    activeUserCount: countActiveUsersForTenant(users, input.tenantId),
    usersHasMore: Boolean(input.usersHasMore),
  };
}
