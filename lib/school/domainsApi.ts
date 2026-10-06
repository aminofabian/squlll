/**
 * Tenant custom-domain API. Mirrors the fetch pattern used by the school
 * dashboard hooks: same-origin `/api/graphql`, cookies + Bearer fallback.
 */

export type TenantDomainStatus =
  | "PENDING"
  | "VERIFYING"
  | "ACTIVE"
  | "FAILED"
  | "SUSPENDED";

export type DnsRecord = {
  type: string;
  name: string;
  value: string;
};

export type DnsInstruction = {
  provider: string;
  hostname: string;
  recommendedRecords: DnsRecord[];
  ownership: { type: string; name: string; value: string };
  note?: string;
};

export type TenantDomain = {
  id: string;
  tenantId: string;
  tenantName: string | null;
  hostname: string;
  isPrimary: boolean;
  status: TenantDomainStatus;
  source: string;
  provider: string;
  verificationMethod: string;
  dnsInstruction: DnsInstruction | null;
  certStatus: string | null;
  lastCheckedAt: string | null;
  verifiedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

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

async function gqlRequest<T>(body: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const accessToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem("accessToken")
      : null;
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch("/api/graphql", {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message?: string }>;
  };
  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message || "Request failed");
  }
  return payload.data as T;
}

export async function fetchTenantDomains(): Promise<TenantDomain[]> {
  const data = await gqlRequest<{ myTenantDomains: TenantDomain[] }>({
    query: `query MyTenantDomains { myTenantDomains { ${DOMAIN_FIELDS} } }`,
  });
  return data.myTenantDomains ?? [];
}

export async function connectTenantDomain(
  hostname: string,
): Promise<TenantDomain> {
  const data = await gqlRequest<{ connectTenantDomain: TenantDomain }>({
    query: `
      mutation ConnectTenantDomain($input: ConnectDomainInput!) {
        connectTenantDomain(input: $input) { ${DOMAIN_FIELDS} }
      }
    `,
    variables: { input: { hostname } },
  });
  return data.connectTenantDomain;
}

export async function verifyTenantDomain(id: string): Promise<TenantDomain> {
  const data = await gqlRequest<{ verifyTenantDomain: TenantDomain }>({
    query: `
      mutation VerifyTenantDomain($id: ID!) {
        verifyTenantDomain(id: $id) { ${DOMAIN_FIELDS} }
      }
    `,
    variables: { id },
  });
  return data.verifyTenantDomain;
}

export async function setPrimaryTenantDomain(
  id: string,
): Promise<TenantDomain> {
  const data = await gqlRequest<{ setPrimaryTenantDomain: TenantDomain }>({
    query: `
      mutation SetPrimaryTenantDomain($id: ID!) {
        setPrimaryTenantDomain(id: $id) { ${DOMAIN_FIELDS} }
      }
    `,
    variables: { id },
  });
  return data.setPrimaryTenantDomain;
}

export async function disconnectTenantDomain(id: string): Promise<boolean> {
  const data = await gqlRequest<{ disconnectTenantDomain: boolean }>({
    query: `
      mutation DisconnectTenantDomain($id: ID!) {
        disconnectTenantDomain(id: $id)
      }
    `,
    variables: { id },
  });
  return data.disconnectTenantDomain;
}

// ── Buy a domain (Slice G) ────────────────────────────────────────────

export type DomainOrderStatus =
  | "QUOTED"
  | "AWAITING_PAYMENT"
  | "REGISTERING"
  | "OWNED"
  | "PROVISIONING"
  | "LIVE"
  | "FAILED"
  | "CANCELLED";

export type RegistrarQuote = {
  fqdn: string;
  available: boolean | null;
  priceCents: string | null;
  currency: string | null;
  note: string | null;
};

export type DomainOrder = {
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
};

const ORDER_FIELDS = `
  id tenantId tenantName fqdn status registrar priceCents currency nsStatus
  domainMappingId billingStub paidAt paymentTxnId payerPhone lastStkStatus
  lastError createdAt updatedAt
`;

export async function searchRegistrarDomains(
  query: string,
): Promise<RegistrarQuote[]> {
  const data = await gqlRequest<{ registrarDomainSearch: RegistrarQuote[] }>({
    query: `query RegistrarDomainSearch($query: String!) {
      registrarDomainSearch(query: $query) { fqdn available priceCents currency note }
    }`,
    variables: { query },
  });
  return data.registrarDomainSearch ?? [];
}

export async function fetchMyDomainOrders(): Promise<DomainOrder[]> {
  const data = await gqlRequest<{ myDomainOrders: DomainOrder[] }>({
    query: `query MyDomainOrders { myDomainOrders { ${ORDER_FIELDS} } }`,
  });
  return data.myDomainOrders ?? [];
}

export async function createDomainOrder(fqdn: string): Promise<DomainOrder> {
  const data = await gqlRequest<{ createDomainOrder: DomainOrder }>({
    query: `mutation CreateDomainOrder($input: CreateDomainOrderInput!) {
      createDomainOrder(input: $input) { ${ORDER_FIELDS} }
    }`,
    variables: { input: { fqdn } },
  });
  return data.createDomainOrder;
}

export async function initiateDomainOrderPayment(
  orderId: string,
  phone: string,
): Promise<DomainOrder> {
  const data = await gqlRequest<{ initiateDomainOrderPayment: DomainOrder }>({
    query: `mutation InitiateDomainOrderPayment($input: InitiateDomainOrderPaymentInput!) {
      initiateDomainOrderPayment(input: $input) { ${ORDER_FIELDS} }
    }`,
    variables: { input: { orderId, phone } },
  });
  return data.initiateDomainOrderPayment;
}

export async function cancelDomainOrder(id: string): Promise<DomainOrder> {
  const data = await gqlRequest<{ cancelDomainOrder: DomainOrder }>({
    query: `mutation CancelDomainOrder($id: ID!) {
      cancelDomainOrder(id: $id) { ${ORDER_FIELDS} }
    }`,
    variables: { id },
  });
  return data.cancelDomainOrder;
}
