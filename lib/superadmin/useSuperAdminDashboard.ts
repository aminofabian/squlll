"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSuperAdminDashboard } from "./fetchDashboardData";
import type { SuperAdminDashboardData } from "./types";

const EMPTY_DASHBOARD: SuperAdminDashboardData = {
  stats: [],
  activity: [],
  expiring: [],
  growth: [],
  quickActions: [],
  growthPeriodLabel: "",
  lastUpdated: new Date(),
};

export function useSuperAdminDashboard() {
  const [data, setData] = useState<SuperAdminDashboardData>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWarning(null);
    try {
      const { partialErrors, ...next } = await fetchSuperAdminDashboard();
      setData(next);
      if (partialErrors.length > 0) {
        setWarning(
          `Some sections could not be loaded: ${partialErrors.join(", ")}`,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    stats: data.stats,
    activity: data.activity,
    expiring: data.expiring,
    growth: data.growth,
    quickActions: data.quickActions,
    growthPeriodLabel: data.growthPeriodLabel,
    lastUpdated: data.lastUpdated,
    loading,
    error,
    warning,
    refresh,
  };
}
