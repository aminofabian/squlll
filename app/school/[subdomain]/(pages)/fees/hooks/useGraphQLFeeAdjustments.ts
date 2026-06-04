"use client";

import { useState } from "react";
import { graphqlClient } from "@/lib/graphql-client";

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

const APPLY_FEE_ADJUSTMENT = `
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

type ApplyFeeAdjustmentResponse = {
  applyFeeAdjustment: FeeAdjustmentRecord;
};

export const useGraphQLFeeAdjustments = () => {
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyFeeAdjustment = async (
    input: ApplyFeeAdjustmentInput,
  ): Promise<{ record: FeeAdjustmentRecord | null; errorMessage: string | null }> => {
    setIsApplying(true);
    setError(null);

    try {
      const payload = await graphqlClient.request<ApplyFeeAdjustmentResponse>(
        APPLY_FEE_ADJUSTMENT,
        { input },
      );

      const record = payload.applyFeeAdjustment ?? null;
      if (!record) {
        const msg = "Server returned no adjustment record.";
        setError(msg);
        return { record: null, errorMessage: msg };
      }
      return { record, errorMessage: null };
    } catch (err: unknown) {
      const gqlErrors = (
        err as { response?: { errors?: { message?: string }[] } }
      )?.response?.errors;
      const message =
        gqlErrors?.map((e) => e.message).filter(Boolean).join(". ") ||
        (err instanceof Error ? err.message : "Failed to apply adjustment");
      setError(message);
      return { record: null, errorMessage: message };
    } finally {
      setIsApplying(false);
    }
  };

  const clearError = () => setError(null);

  return { applyFeeAdjustment, isApplying, error, clearError };
};
