const RECEIPT_SHARE_TOKEN_QUERY = `
  query ReceiptShareToken($paymentId: ID!) {
    receiptShareToken(paymentId: $paymentId)
  }
`;

export async function requestReceiptShareToken(
  paymentId: string,
): Promise<string> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: RECEIPT_SHARE_TOKEN_QUERY,
      variables: { paymentId },
    }),
  });
  const body = await response.json();
  const token = body?.data?.receiptShareToken;
  if (body?.errors?.length || typeof token !== "string") {
    throw new Error(body?.errors?.[0]?.message ?? "Could not create a receipt link");
  }
  return token;
}
