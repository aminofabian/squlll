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
  const data = await superAdminGraphqlRequest<{ getAllTenants: TenantRecord[] }>(
    TENANTS_QUERY,
  );
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
