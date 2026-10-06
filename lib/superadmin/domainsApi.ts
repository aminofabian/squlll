import { superAdminGraphqlRequest } from "./graphql";

export type DomainProviderKind = "COOLIFY" | "CLOUDFLARE" | "STATIC";

export type DomainStatus =
  | "PENDING"
  | "VERIFYING"
  | "ACTIVE"
  | "FAILED"
  | "SUSPENDED";

export interface PlatformZone {
  zone: string;
  country: string;
  locale: string;
  currency: string;
  timeZone: string;
  isPrimary: boolean;
  isActive: boolean;
}

export interface PlatformDomainSettingsRecord {
  provider: DomainProviderKind;
  coolifyBaseUrl: string | null;
  coolifyAppUuid: string | null;
  coolifyServerUuid: string | null;
  coolifyRedeployOnAttach: boolean;
  hasCoolifyApiToken: boolean;
  cloudflareZoneId: string | null;
  cloudflareSaasEnabled: boolean;
  cloudflareFallbackOrigin: string | null;
  hasCloudflareApiToken: boolean;
  connectATarget: string | null;
  connectAaaaTarget: string | null;
  connectCnameTarget: string | null;
  ownershipTxtPrefix: string;
  platformZones: PlatformZone[];
  reservedHostnames: string[];
  selfServeEnabled: boolean;
  requireSuperadminApproval: boolean;
  certProbeEnabled: boolean;
  certProbeIntervalMs: number;
  encryptionConfigured: boolean;
  updatedBy: string | null;
  updatedAt: string | null;
  registrarProvider: RegistrarProviderKind;
  registrarBaseUrl: string | null;
  registrarEmail: string | null;
  hasRegistrarApiKey: boolean;
  registrarCurrency: string | null;
  registrarWhois: Record<string, string>;
  registrarAllowedTlds: string | null;
  registrarSearchBaseUrl: string | null;
  hasRegistrarSearchApiKey: boolean;
  domainCheckoutBillingStubEnabled: boolean;
  domainOrderSyncEnabled: boolean;
  domainOrderSyncIntervalMs: number;
}

export type RegistrarProviderKind = "MANUAL" | "HOSTAFRICA";

export interface PlatformDomainRecord {
  id: string;
  tenantId: string;
  tenantName: string | null;
  hostname: string;
  isPrimary: boolean;
  status: DomainStatus;
  source: string;
  provider: DomainProviderKind;
  verificationMethod: string;
  dnsInstruction: {
    recommendedRecords?: Array<{ type: string; name: string; value: string }>;
    ownership?: { type: string; name: string; value: string };
  } | null;
  certStatus: string | null;
  lastCheckedAt: string | null;
  verifiedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DomainProviderDiagnostic {
  provider: DomainProviderKind;
  configured: boolean;
  missing: string[];
  reachable: boolean | null;
  message: string;
}

const SETTINGS_FIELDS = `
  provider
  coolifyBaseUrl
  coolifyAppUuid
  coolifyServerUuid
  coolifyRedeployOnAttach
  hasCoolifyApiToken
  cloudflareZoneId
  cloudflareSaasEnabled
  cloudflareFallbackOrigin
  hasCloudflareApiToken
  connectATarget
  connectAaaaTarget
  connectCnameTarget
  ownershipTxtPrefix
  platformZones { zone country locale currency timeZone isPrimary isActive }
  reservedHostnames
  selfServeEnabled
  requireSuperadminApproval
  certProbeEnabled
  certProbeIntervalMs
  encryptionConfigured
  updatedBy
  updatedAt
  registrarProvider
  registrarBaseUrl
  registrarEmail
  hasRegistrarApiKey
  registrarCurrency
  registrarWhois
  registrarAllowedTlds
  registrarSearchBaseUrl
  hasRegistrarSearchApiKey
  domainCheckoutBillingStubEnabled
  domainOrderSyncEnabled
  domainOrderSyncIntervalMs
`;

const DOMAIN_FIELDS = `
  id
  tenantId
  tenantName
  hostname
  isPrimary
  status
  source
  provider
  verificationMethod
  dnsInstruction
  certStatus
  lastCheckedAt
  verifiedAt
  lastError
  createdAt
  updatedAt
`;

export async function fetchPlatformDomainSettings(): Promise<PlatformDomainSettingsRecord> {
  const data = await superAdminGraphqlRequest<{
    platformDomainSettings: PlatformDomainSettingsRecord;
  }>(`query PlatformDomainSettings { platformDomainSettings { ${SETTINGS_FIELDS} } }`);
  return data.platformDomainSettings;
}

export interface UpdatePlatformDomainSettingsInput {
  provider?: DomainProviderKind;
  coolifyBaseUrl?: string;
  coolifyApiToken?: string;
  clearCoolifyApiToken?: boolean;
  coolifyAppUuid?: string;
  coolifyServerUuid?: string;
  coolifyRedeployOnAttach?: boolean;
  cloudflareApiToken?: string;
  clearCloudflareApiToken?: boolean;
  cloudflareZoneId?: string;
  cloudflareSaasEnabled?: boolean;
  cloudflareFallbackOrigin?: string;
  connectATarget?: string;
  connectAaaaTarget?: string;
  connectCnameTarget?: string;
  ownershipTxtPrefix?: string;
  platformZones?: PlatformZone[];
  reservedHostnames?: string[];
  selfServeEnabled?: boolean;
  requireSuperadminApproval?: boolean;
  certProbeEnabled?: boolean;
  certProbeIntervalMs?: number;
  registrarProvider?: RegistrarProviderKind;
  registrarBaseUrl?: string;
  registrarEmail?: string;
  registrarApiKey?: string;
  clearRegistrarApiKey?: boolean;
  registrarCurrency?: string;
  registrarWhois?: Record<string, string>;
  registrarAllowedTlds?: string;
  registrarSearchBaseUrl?: string;
  registrarSearchApiKey?: string;
  clearRegistrarSearchApiKey?: boolean;
  domainCheckoutBillingStubEnabled?: boolean;
  domainOrderSyncEnabled?: boolean;
  domainOrderSyncIntervalMs?: number;
}

export async function updatePlatformDomainSettings(
  input: UpdatePlatformDomainSettingsInput,
): Promise<PlatformDomainSettingsRecord> {
  const data = await superAdminGraphqlRequest<{
    updatePlatformDomainSettings: PlatformDomainSettingsRecord;
  }>(
    `mutation UpdatePlatformDomainSettings($input: UpdatePlatformDomainSettingsInput!) {
      updatePlatformDomainSettings(input: $input) { ${SETTINGS_FIELDS} }
    }`,
    { input },
  );
  return data.updatePlatformDomainSettings;
}

export async function testPlatformDomainProvider(
  provider: DomainProviderKind,
): Promise<DomainProviderDiagnostic> {
  const data = await superAdminGraphqlRequest<{
    testPlatformDomainProvider: DomainProviderDiagnostic;
  }>(
    `mutation TestPlatformDomainProvider($provider: DomainProviderKind!) {
      testPlatformDomainProvider(provider: $provider) {
        provider configured missing reachable message
      }
    }`,
    { provider },
  );
  return data.testPlatformDomainProvider;
}

export async function testPlatformRegistrar(): Promise<DomainProviderDiagnostic> {
  const data = await superAdminGraphqlRequest<{
    testPlatformRegistrar: DomainProviderDiagnostic;
  }>(
    `mutation TestPlatformRegistrar {
      testPlatformRegistrar { provider configured missing reachable message }
    }`,
  );
  return data.testPlatformRegistrar;
}

export interface PlatformDomainsFilter {
  status?: DomainStatus;
  tenantId?: string;
  search?: string;
}

export async function fetchPlatformDomains(
  filter?: PlatformDomainsFilter,
): Promise<PlatformDomainRecord[]> {
  const data = await superAdminGraphqlRequest<{
    platformDomains: PlatformDomainRecord[];
  }>(
    `query PlatformDomains($filter: PlatformDomainsFilterInput) {
      platformDomains(filter: $filter) { ${DOMAIN_FIELDS} }
    }`,
    { filter: filter ?? null },
  );
  return data.platformDomains ?? [];
}

export async function verifyPlatformDomain(
  id: string,
): Promise<PlatformDomainRecord> {
  const data = await superAdminGraphqlRequest<{
    verifyPlatformDomain: PlatformDomainRecord;
  }>(
    `mutation VerifyPlatformDomain($id: ID!) {
      verifyPlatformDomain(id: $id) { ${DOMAIN_FIELDS} }
    }`,
    { id },
  );
  return data.verifyPlatformDomain;
}

export async function approvePlatformDomain(
  id: string,
): Promise<PlatformDomainRecord> {
  const data = await superAdminGraphqlRequest<{
    approvePlatformDomain: PlatformDomainRecord;
  }>(
    `mutation ApprovePlatformDomain($id: ID!) {
      approvePlatformDomain(id: $id) { ${DOMAIN_FIELDS} }
    }`,
    { id },
  );
  return data.approvePlatformDomain;
}

export async function suspendPlatformDomain(
  id: string,
): Promise<PlatformDomainRecord> {
  const data = await superAdminGraphqlRequest<{
    suspendPlatformDomain: PlatformDomainRecord;
  }>(
    `mutation SuspendPlatformDomain($id: ID!) {
      suspendPlatformDomain(id: $id) { ${DOMAIN_FIELDS} }
    }`,
    { id },
  );
  return data.suspendPlatformDomain;
}

export async function detachPlatformDomain(id: string): Promise<boolean> {
  const data = await superAdminGraphqlRequest<{
    detachPlatformDomain: boolean;
  }>(
    `mutation DetachPlatformDomain($id: ID!) {
      detachPlatformDomain(id: $id)
    }`,
    { id },
  );
  return data.detachPlatformDomain;
}

// ── Domain orders (Slice G) ───────────────────────────────────────────

export type DomainOrderStatus =
  | "QUOTED"
  | "AWAITING_PAYMENT"
  | "REGISTERING"
  | "OWNED"
  | "PROVISIONING"
  | "LIVE"
  | "FAILED"
  | "CANCELLED";

export interface PlatformDomainOrderRecord {
  id: string;
  tenantId: string;
  tenantName: string | null;
  fqdn: string;
  status: DomainOrderStatus;
  registrar: string;
  priceCents: string | null;
  currency: string | null;
  nsStatus: string;
  domainMappingId: string | null;
  billingStub: boolean;
  paidAt: string | null;
  paymentTxnId: string | null;
  payerPhone: string | null;
  lastStkStatus: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

const ORDER_FIELDS = `
  id tenantId tenantName fqdn status registrar priceCents currency nsStatus
  domainMappingId billingStub paidAt paymentTxnId payerPhone lastStkStatus
  lastError createdAt updatedAt
`;

export async function fetchPlatformDomainOrders(filter?: {
  status?: DomainOrderStatus;
  tenantId?: string;
  search?: string;
}): Promise<PlatformDomainOrderRecord[]> {
  const data = await superAdminGraphqlRequest<{
    platformDomainOrders: PlatformDomainOrderRecord[];
  }>(
    `query PlatformDomainOrders($filter: DomainOrderFilterInput) {
      platformDomainOrders(filter: $filter) { ${ORDER_FIELDS} }
    }`,
    { filter: filter ?? null },
  );
  return data.platformDomainOrders ?? [];
}

export async function retryPlatformDomainOrder(
  id: string,
): Promise<PlatformDomainOrderRecord> {
  const data = await superAdminGraphqlRequest<{
    retryPlatformDomainOrder: PlatformDomainOrderRecord;
  }>(
    `mutation RetryPlatformDomainOrder($id: ID!) {
      retryPlatformDomainOrder(id: $id) { ${ORDER_FIELDS} }
    }`,
    { id },
  );
  return data.retryPlatformDomainOrder;
}

export async function markPlatformDomainOrderRegistered(
  id: string,
  registrarDomainId?: string,
): Promise<PlatformDomainOrderRecord> {
  const data = await superAdminGraphqlRequest<{
    markPlatformDomainOrderRegistered: PlatformDomainOrderRecord;
  }>(
    `mutation MarkPlatformDomainOrderRegistered($id: ID!, $registrarDomainId: String) {
      markPlatformDomainOrderRegistered(id: $id, registrarDomainId: $registrarDomainId) { ${ORDER_FIELDS} }
    }`,
    { id, registrarDomainId: registrarDomainId ?? null },
  );
  return data.markPlatformDomainOrderRegistered;
}

export async function markPlatformDomainOrderLive(
  id: string,
): Promise<PlatformDomainOrderRecord> {
  const data = await superAdminGraphqlRequest<{
    markPlatformDomainOrderLive: PlatformDomainOrderRecord;
  }>(
    `mutation MarkPlatformDomainOrderLive($id: ID!) {
      markPlatformDomainOrderLive(id: $id) { ${ORDER_FIELDS} }
    }`,
    { id },
  );
  return data.markPlatformDomainOrderLive;
}

export async function failPlatformDomainOrder(
  id: string,
  reason: string,
): Promise<PlatformDomainOrderRecord> {
  const data = await superAdminGraphqlRequest<{
    failPlatformDomainOrder: PlatformDomainOrderRecord;
  }>(
    `mutation FailPlatformDomainOrder($id: ID!, $reason: String!) {
      failPlatformDomainOrder(id: $id, reason: $reason) { ${ORDER_FIELDS} }
    }`,
    { id, reason },
  );
  return data.failPlatformDomainOrder;
}
