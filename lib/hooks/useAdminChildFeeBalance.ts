"use client";

import { useCallback, useEffect, useState } from "react";
import { graphqlClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";

export type AdminFeeBalance = {
  studentId: string;
  totalDue: number;
  totalPaid: number;
  feesOwed: number;
  items: {
    id: string;
    bucketName: string;
    itemName: string | null;
    amount: number;
    amountPaid: number;
    balance: number;
    isMandatory: boolean;
  }[];
};

const ADMIN_CHILD_FEE_BALANCE = gql`
  query AdminChildFeeBalance($studentId: String!) {
    adminChildFeeBalance(studentId: $studentId) {
      studentId
      totalDue
      totalPaid
      feesOwed
      items {
        id
        bucketName
        itemName
        amount
        amountPaid
        balance
        isMandatory
      }
    }
  }
`;

export function useAdminChildFeeBalance(studentId: string | null) {
  const [balance, setBalance] = useState<AdminFeeBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!studentId) {
      setBalance(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await graphqlClient.request<{
        adminChildFeeBalance: AdminFeeBalance;
      }>(ADMIN_CHILD_FEE_BALANCE, { studentId });

      setBalance(response.adminChildFeeBalance);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load fee balance",
      );
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, error, refetch: fetchBalance };
}
