/**
 * Tenant SMS credits API. Mirrors the fetch pattern used by the school
 * dashboard hooks: same-origin `/api/graphql`, cookies + Bearer fallback.
 *
 * The message (SMS) is the unit everywhere — the platform price is never
 * surfaced to the tenant.
 */

export type SmsCreditBalance = {
  available: number;
  includedRemaining: number;
  includedAllowance: number;
  purchasedBalance: number;
  cycleEndsAt: string | null;
  lowBalance: boolean;
  meteringEnabled: boolean;
  isPayingTenant: boolean;
  minPurchaseCredits: number;
  maxPurchaseCredits: number;
  /** Message-count packages offered for one-tap selection (no prices). */
  presetCredits: number[];
};

export type SmsCreditLedgerKind =
  | "INCLUDED_SPEND"
  | "PURCHASED_SPEND"
  | "PURCHASE"
  | "GRANT"
  | "REFUND"
  | "CYCLE_RESET";

export type SmsCreditLedgerRow = {
  id: string;
  delta: number;
  balanceAfter: number;
  kind: SmsCreditLedgerKind;
  reason: string | null;
  referenceId: string | null;
  createdAt: string;
};

export type SmsCreditPurchaseStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED";

export type SmsCreditPurchase = {
  id: string;
  credits: number;
  amountKes: number | null;
  status: SmsCreditPurchaseStatus;
  phoneNumber: string | null;
  message: string | null;
};

export type SmsCreditPurchaseStatusRecord = {
  id: string;
  credits: number;
  status: SmsCreditPurchaseStatus;
  mpesaReceipt: string | null;
  paidAt: string | null;
  needsRetry: boolean;
};

const BALANCE_FIELDS = `
  available
  includedRemaining
  includedAllowance
  purchasedBalance
  cycleEndsAt
  lowBalance
  meteringEnabled
  isPayingTenant
  minPurchaseCredits
  maxPurchaseCredits
  presetCredits
`;

const LEDGER_FIELDS = `
  id
  delta
  balanceAfter
  kind
  reason
  referenceId
  createdAt
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

export async function fetchSmsCreditBalance(): Promise<SmsCreditBalance> {
  const data = await gqlRequest<{ smsCreditBalance: SmsCreditBalance }>({
    query: `query SmsCreditBalance { smsCreditBalance { ${BALANCE_FIELDS} } }`,
  });
  return data.smsCreditBalance;
}

export async function fetchSmsCreditLedger(
  limit = 50,
): Promise<SmsCreditLedgerRow[]> {
  const data = await gqlRequest<{ smsCreditLedger: SmsCreditLedgerRow[] }>({
    query: `query SmsCreditLedger($limit: Int) {
      smsCreditLedger(limit: $limit) { ${LEDGER_FIELDS} }
    }`,
    variables: { limit },
  });
  return data.smsCreditLedger ?? [];
}

export async function purchaseSmsCredits(input: {
  credits: number;
  phone: string;
}): Promise<SmsCreditPurchase> {
  const data = await gqlRequest<{ purchaseSmsCredits: SmsCreditPurchase }>({
    query: `mutation PurchaseSmsCredits($input: PurchaseSmsCreditsInput!) {
      purchaseSmsCredits(input: $input) {
        id
        credits
        status
        phoneNumber
        message
      }
    }`,
    variables: { input },
  });
  return data.purchaseSmsCredits;
}

export async function fetchSmsCreditPurchaseStatus(
  id: string,
): Promise<SmsCreditPurchaseStatusRecord> {
  const data = await gqlRequest<{
    smsCreditPurchaseStatus: SmsCreditPurchaseStatusRecord;
  }>({
    query: `query SmsCreditPurchaseStatus($id: String!) {
      smsCreditPurchaseStatus(id: $id) {
        id
        credits
        status
        mpesaReceipt
        paidAt
        needsRetry
      }
    }`,
    variables: { id },
  });
  return data.smsCreditPurchaseStatus;
}
