"use client";

import { useMemo, useEffect, useState } from "react";
import type { StudentSummaryFromAPI } from "../types";
import { usePaymentsQuery } from "./useGraphQLPayments";

const BALANCE_ALERT_KES = 20_000;

export interface BursarDashboardMetrics {
  totalExpected: number;
  totalCollected: number;
  totalOutstanding: number;
  todayCollected: number;
  todayPaymentCount: number;
  studentsWithBalance: number;
  studentsAboveAlert: number;
  collectionRate: number;
  loadingToday: boolean;
}

function todayIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function useBursarDashboardMetrics(
  students: StudentSummaryFromAPI[],
): BursarDashboardMetrics {
  const { payments, fetchPayments, isLoading: loadingToday } =
    usePaymentsQuery();
  const [todayFetched, setTodayFetched] = useState(false);

  useEffect(() => {
    const today = todayIsoDate();
    void fetchPayments({ startDate: today, endDate: today }).finally(() =>
      setTodayFetched(true),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  const aggregated = useMemo(() => {
    let totalExpected = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let studentsWithBalance = 0;
    let studentsAboveAlert = 0;

    for (const s of students) {
      const { totalOwed, totalPaid, balance } = s.feeSummary;
      totalExpected += totalOwed;
      totalCollected += totalPaid;
      totalOutstanding += balance;
      if (balance > 0) studentsWithBalance += 1;
      if (balance >= BALANCE_ALERT_KES) studentsAboveAlert += 1;
    }

    const gross = totalCollected + totalOutstanding;
    const collectionRate = gross > 0 ? (totalCollected / gross) * 100 : 0;

    return {
      totalExpected,
      totalCollected,
      totalOutstanding,
      studentsWithBalance,
      studentsAboveAlert,
      collectionRate,
    };
  }, [students]);

  const todayStats = useMemo(() => {
    const today = todayIsoDate();
    const todayPayments = payments.filter((p) => {
      const d = p.paymentDate?.split("T")[0];
      return d === today;
    });
    return {
      todayCollected: todayPayments.reduce((sum, p) => sum + p.amount, 0),
      todayPaymentCount: todayPayments.length,
    };
  }, [payments]);

  return {
    ...aggregated,
    ...todayStats,
    loadingToday: loadingToday && !todayFetched,
  };
}

export { BALANCE_ALERT_KES };
