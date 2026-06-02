"use client";

import { useState } from "react";

export type FeeAdjustmentTypeInput =
  | "DISCOUNT"
  | "WAIVER"
  | "REMOVE_CHARGE"
  | "OTHER";

export interface ApplyFeeAdjustmentInput {
  studentId: string;
  type: FeeAdjustmentTypeInput;
  amount: number;
  reason: string;
  studentFeeItemId?: string;
}

export interface FeeAdjustmentRecord {
  id: string;
  type: FeeAdjustmentTypeInput;
  amount: number;
  reason: string;
  studentFeeItemId?: string;
  createdAt: string;
}

const FRONTEND_TO_API_TYPE: Record<string, FeeAdjustmentTypeInput> = {
  discount: "DISCOUNT",
  waiver: "WAIVER",
  remove_charge: "REMOVE_CHARGE",
  other: "OTHER",
};

export function mapAdjustmentType(
  type: string,
): FeeAdjustmentTypeInput {
  return FRONTEND_TO_API_TYPE[type] ?? "OTHER";
}

export const useGraphQLFeeAdjustments = () => {
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyFeeAdjustment = async (
    input: ApplyFeeAdjustmentInput,
  ): Promise<FeeAdjustmentRecord | null> => {
    setIsApplying(true);
    setError(null);

    try {
      const mutation = `
        mutation ApplyFeeAdjustment($input: ApplyFeeAdjustmentInput!) {
          applyFeeAdjustment(input: $input) {
            id
            type
            amount
            reason
            studentFeeItemId
            createdAt
          }
        }
      `;

      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mutation, variables: { input } }),
      });

      const result = await response.json();
      if (result.errors?.length) {
        throw new Error(result.errors[0]?.message ?? "Adjustment failed");
      }

      return result.data?.applyFeeAdjustment ?? null;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to apply adjustment";
      setError(message);
      return null;
    } finally {
      setIsApplying(false);
    }
  };

  return { applyFeeAdjustment, isApplying, error };
};
