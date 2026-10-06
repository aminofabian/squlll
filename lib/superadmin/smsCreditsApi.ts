import { superAdminGraphqlRequest } from "./graphql";

/** Super-admin SMS credits control plane — settings, plans, usage, tenants. */

export type SmsReceivingType = "till" | "paybill" | "bank";

export type PlatformSmsCreditSettingsRecord = {
  enabled: boolean;
  unitPriceKes: number;
  defaultIncludedSms: number;
  minPurchaseCredits: number;
  maxPurchaseCredits: number;
  lowBalanceThreshold: number;
  presetCredits: number[];
  receivingType: SmsReceivingType | null;
  receivingNumber: string | null;
  receivingAccount: string | null;
  receivingBankName: string | null;
  updatedAt: string | null;
};

export type UpdatePlatformSmsCreditSettingsInput = {
  enabled?: boolean;
  unitPriceKes?: number;
  defaultIncludedSms?: number;
  minPurchaseCredits?: number;
  maxPurchaseCredits?: number;
  lowBalanceThreshold?: number;
  presetCredits?: number[];
  clearReceiving?: boolean;
  receivingType?: SmsReceivingType | null;
  receivingNumber?: string | null;
  receivingAccount?: string | null;
  receivingBankName?: string | null;
};

export type PlatformSmsTierAllowance = {
  planId: number;
  planName: string;
  includedSmsPerMonth: number;
  active: boolean;
};

export type SmsCreditTopTenant = {
  tenantId: string;
  name: string;
  planName: string;
  sentThisCycle: number;
  available: number;
};

export type SmsCreditUsage = {
  cycleStartedAt: string;
  totalSentThisCycle: number;
  includedSentThisCycle: number;
  purchasedSentThisCycle: number;
  depletedCount: number;
  topTenants: SmsCreditTopTenant[];
};

export type SmsCreditLedgerRow = {
  id: string;
  delta: number;
  balanceAfter: number;
  kind: string;
  reason: string | null;
  referenceId: string | null;
  createdAt: string;
  createdByUserId: string | null;
};

export type SmsCreditPurchaseRow = {
  id: string;
  credits: number;
  amountKes: number | null;
  status: string;
  phoneNumber: string | null;
  message: string | null;
};

export type TenantSmsCreditAccount = {
  tenantId: string;
  includedUsed: number;
  includedOverride: number | null;
  includedAllowance: number;
  includedRemaining: number;
  purchasedBalance: number;
  available: number;
  isPayingTenant: boolean;
  cycleStartedAt: string | null;
  recentLedger: SmsCreditLedgerRow[];
  recentPurchases: SmsCreditPurchaseRow[];
};

const SETTINGS_FIELDS = `
  enabled
  unitPriceKes
  defaultIncludedSms
  minPurchaseCredits
  maxPurchaseCredits
  lowBalanceThreshold
  presetCredits
  receivingType
  receivingNumber
  receivingAccount
  receivingBankName
  updatedAt
`;

const TIER_FIELDS = `
  planId
  planName
  includedSmsPerMonth
  active
`;

const ACCOUNT_FIELDS = `
  tenantId
  includedUsed
  includedOverride
  includedAllowance
  includedRemaining
  purchasedBalance
  available
  isPayingTenant
  cycleStartedAt
  recentLedger {
    id delta balanceAfter kind reason referenceId createdAt createdByUserId
  }
  recentPurchases {
    id credits amountKes status phoneNumber message
  }
`;

export async function fetchPlatformSmsCreditSettings(): Promise<PlatformSmsCreditSettingsRecord> {
  const data = await superAdminGraphqlRequest<{
    platformSmsCreditSettings: PlatformSmsCreditSettingsRecord;
  }>(`query { platformSmsCreditSettings { ${SETTINGS_FIELDS} } }`);
  return data.platformSmsCreditSettings;
}

export async function updatePlatformSmsCreditSettings(
  input: UpdatePlatformSmsCreditSettingsInput,
): Promise<PlatformSmsCreditSettingsRecord> {
  const data = await superAdminGraphqlRequest<{
    updatePlatformSmsCreditSettings: PlatformSmsCreditSettingsRecord;
  }>(
    `mutation UpdateSettings($input: UpdatePlatformSmsCreditSettingsInput!) {
      updatePlatformSmsCreditSettings(input: $input) { ${SETTINGS_FIELDS} }
    }`,
    { input },
  );
  return data.updatePlatformSmsCreditSettings;
}

export async function fetchPlatformSmsCreditTiers(): Promise<
  PlatformSmsTierAllowance[]
> {
  const data = await superAdminGraphqlRequest<{
    platformSmsCreditTiers: PlatformSmsTierAllowance[];
  }>(`query { platformSmsCreditTiers { ${TIER_FIELDS} } }`);
  return data.platformSmsCreditTiers ?? [];
}

export async function upsertPlatformSmsCreditTier(
  planId: number,
  input: { includedSmsPerMonth: number; active?: boolean },
): Promise<PlatformSmsTierAllowance[]> {
  const data = await superAdminGraphqlRequest<{
    upsertPlatformSmsCreditTier: PlatformSmsTierAllowance[];
  }>(
    `mutation UpsertTier($planId: Int!, $input: UpdatePlatformSmsTierAllowanceInput!) {
      upsertPlatformSmsCreditTier(planId: $planId, input: $input) { ${TIER_FIELDS} }
    }`,
    { planId, input },
  );
  return data.upsertPlatformSmsCreditTier ?? [];
}

export async function fetchPlatformSmsCreditUsage(): Promise<SmsCreditUsage> {
  const data = await superAdminGraphqlRequest<{
    platformSmsCreditUsage: SmsCreditUsage;
  }>(`query {
    platformSmsCreditUsage {
      cycleStartedAt
      totalSentThisCycle
      includedSentThisCycle
      purchasedSentThisCycle
      depletedCount
      topTenants { tenantId name planName sentThisCycle available }
    }
  }`);
  return data.platformSmsCreditUsage;
}

export async function fetchTenantSmsCreditAccount(
  tenantId: string,
): Promise<TenantSmsCreditAccount> {
  const data = await superAdminGraphqlRequest<{
    tenantSmsCreditAccount: TenantSmsCreditAccount;
  }>(
    `query TenantAccount($tenantId: String!) {
      tenantSmsCreditAccount(tenantId: $tenantId) { ${ACCOUNT_FIELDS} }
    }`,
    { tenantId },
  );
  return data.tenantSmsCreditAccount;
}

export async function grantTenantSmsCredits(
  tenantId: string,
  input: { credits: number; note?: string },
): Promise<TenantSmsCreditAccount> {
  const data = await superAdminGraphqlRequest<{
    grantTenantSmsCredits: TenantSmsCreditAccount;
  }>(
    `mutation Grant($tenantId: String!, $input: GrantTenantSmsCreditsInput!) {
      grantTenantSmsCredits(tenantId: $tenantId, input: $input) { ${ACCOUNT_FIELDS} }
    }`,
    { tenantId, input },
  );
  return data.grantTenantSmsCredits;
}

export async function updateTenantSmsCreditAccount(
  tenantId: string,
  includedOverride: number | null,
): Promise<TenantSmsCreditAccount> {
  const data = await superAdminGraphqlRequest<{
    updateTenantSmsCreditAccount: TenantSmsCreditAccount;
  }>(
    `mutation UpdateAccount($tenantId: String!, $input: UpdateTenantSmsCreditAccountInput!) {
      updateTenantSmsCreditAccount(tenantId: $tenantId, input: $input) { ${ACCOUNT_FIELDS} }
    }`,
    { tenantId, input: { includedOverride } },
  );
  return data.updateTenantSmsCreditAccount;
}
