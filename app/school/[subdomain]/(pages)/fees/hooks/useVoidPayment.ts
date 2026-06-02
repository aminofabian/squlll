"use client";

import { useState } from "react";

export function useVoidPayment() {
  const [isVoiding, setIsVoiding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voidPayment = async (
    paymentId: string,
    reason: string,
  ): Promise<boolean> => {
    setIsVoiding(true);
    setError(null);
    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation VoidPayment($id: ID!, $reason: String!) {
              voidPayment(id: $id, reason: $reason)
            }
          `,
          variables: { id: paymentId, reason },
        }),
      });

      const result = await response.json();
      if (result.errors?.length) {
        throw new Error(result.errors.map((e: { message: string }) => e.message).join(", "));
      }
      return Boolean(result.data?.voidPayment);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to void payment";
      setError(message);
      return false;
    } finally {
      setIsVoiding(false);
    }
  };

  return { voidPayment, isVoiding, error };
}
