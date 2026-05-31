import { buildTenantDetail } from "./tenantDetail";
import { fetchAllSubscriptions } from "./subscriptionsApi";
import { fetchAllTenants } from "./tenantsApi";
import { fetchAllUsers } from "./usersApi";

export async function fetchTenantDetail(tenantId: string) {
  const [tenantsResult, subscriptionsResult, usersResult] =
    await Promise.allSettled([
      fetchAllTenants(),
      fetchAllSubscriptions(),
      fetchAllUsers(),
    ]);

  const errors: string[] = [];

  const tenants =
    tenantsResult.status === "fulfilled" ? tenantsResult.value : [];
  if (tenantsResult.status === "rejected") {
    errors.push(
      tenantsResult.reason instanceof Error
        ? tenantsResult.reason.message
        : "Failed to load school",
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

  const usersPayload =
    usersResult.status === "fulfilled"
      ? usersResult.value
      : { users: [], hasMore: false };
  if (usersResult.status === "rejected") {
    errors.push(
      usersResult.reason instanceof Error
        ? usersResult.reason.message
        : "Failed to load users",
    );
  }

  const detail = buildTenantDetail({
    tenantId,
    tenants,
    subscriptions,
    users: usersPayload.users,
    usersHasMore: usersPayload.hasMore,
  });

  if (!detail && tenants.length > 0) {
    throw new Error("School not found");
  }

  if (!detail && errors.length > 0) {
    throw new Error(errors[0] ?? "Failed to load school details");
  }

  if (!detail) {
    throw new Error("School not found");
  }

  return {
    detail,
    partialErrors: errors,
  };
}
