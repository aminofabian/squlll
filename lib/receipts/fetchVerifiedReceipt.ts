import { resolveGraphqlEndpoint } from "@/lib/graphql-endpoint";
import type { VerifiedReceipt } from "./verified-receipt";

const VERIFICATION_TOKEN_PATTERN = /^[a-f0-9]{32}$/;

const VERIFIED_RECEIPT_QUERY = `
  query VerifiedReceipt($subdomain: String!, $token: String!) {
    verifiedReceipt(subdomain: $subdomain, token: $token) {
      schoolName
      receiptNumber
      amount
      receiptDate
      studentName
      admissionNumber
      className
      termName
      academicYearName
      paymentMethod
      transactionReference
      isVoided
    }
  }
`;

export async function fetchVerifiedReceipt(
  subdomain: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<VerifiedReceipt | null> {
  if (!VERIFICATION_TOKEN_PATTERN.test(token)) return null;

  try {
    const response = await fetchImpl(resolveGraphqlEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-subdomain": subdomain,
      },
      body: JSON.stringify({
        query: VERIFIED_RECEIPT_QUERY,
        variables: { subdomain, token },
      }),
      cache: "no-store",
    });
    if (!response.ok) return null;

    const body = await response.json();
    return (body?.data?.verifiedReceipt as VerifiedReceipt | null) ?? null;
  } catch {
    return null;
  }
}
