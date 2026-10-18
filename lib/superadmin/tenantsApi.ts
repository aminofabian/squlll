import { superAdminGraphqlRequest } from "./graphql";
import type { TenantRecord } from "./types";

const TENANT_FIELDS = `
  id
  name
  subdomain
  isActive
  status
  createdAt
`;

const TENANTS_QUERY = `
  query GetAllTenants {
    getAllTenants {
      ${TENANT_FIELDS}
    }
  }
`;

export interface CreateTenantInput {
  name: string;
  subdomain: string;
  description?: string;
  adminEmail?: string;
  adminName?: string;
  planId?: number;
}

export interface CreateTenantResult {
  tenant: TenantRecord;
  adminUserId?: string;
  adminTempPassword?: string;
  subscriptionId?: string;
}

export async function fetchAllTenants(): Promise<TenantRecord[]> {
  const data = await superAdminGraphqlRequest<{
    getAllTenants: TenantRecord[];
  }>(TENANTS_QUERY);
  return data.getAllTenants ?? [];
}

export async function createTenant(
  input: CreateTenantInput,
): Promise<CreateTenantResult> {
  const data = await superAdminGraphqlRequest<{
    createTenant: {
      success: boolean;
      message?: string;
      tenant?: TenantRecord;
      adminUserId?: string;
      adminTempPassword?: string;
      subscriptionId?: string;
    };
  }>(
    `
      mutation CreateTenant($input: CreateTenantInput!) {
        createTenant(input: $input) {
          success
          message
          tenant {
            ${TENANT_FIELDS}
          }
          adminUserId
          adminTempPassword
          subscriptionId
        }
      }
    `,
    { input },
  );

  const result = data.createTenant;
  if (!result?.success || !result.tenant) {
    throw new Error(result?.message || "Failed to create school");
  }

  return {
    tenant: result.tenant,
    adminUserId: result.adminUserId,
    adminTempPassword: result.adminTempPassword,
    subscriptionId: result.subscriptionId,
  };
}

const BACKEND_DELETE_CONFIRMATION = "DELETE";

export interface DeleteTenantsResult {
  deleted: { tenantId: string; name: string; usersDeleted: number }[];
  failed: { tenantId: string; message: string }[];
}

/** Permanently deletes schools and all of their data. Irreversible. */
export async function deleteTenants(
  tenantIds: string[],
): Promise<DeleteTenantsResult> {
  const data = await superAdminGraphqlRequest<{
    deleteTenants: DeleteTenantsResult;
  }>(
    `
      mutation DeleteTenants($input: DeleteTenantsInput!) {
        deleteTenants(input: $input) {
          deleted {
            tenantId
            name
            usersDeleted
          }
          failed {
            tenantId
            message
          }
        }
      }
    `,
    { input: { tenantIds, confirmation: BACKEND_DELETE_CONFIRMATION } },
  );
  return data.deleteTenants;
}

export async function enterTenantPortal(tenantId: string): Promise<{
  portalUrl: string;
  message: string;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch("/api/auth/impersonate-tenant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ tenantId }),
      signal: controller.signal,
    });

    let result: { portalUrl?: string; error?: string; message?: string } = {};
    try {
      result = await response.json();
    } catch {
      throw new Error("The portal service returned an invalid response.");
    }
    if (!response.ok || !result?.portalUrl) {
      throw new Error(result?.error || "Could not enter school portal");
    }

    return {
      portalUrl: result.portalUrl,
      message: result.message || "Opening school portal",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "Opening the school portal timed out. Try again in a moment.",
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
