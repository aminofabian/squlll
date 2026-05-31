"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchTenantDetail } from "./fetchTenantDetail";
import { createTenantUser } from "./usersApi";
import type { TenantDetailData } from "./tenantDetail";

export function useTenantDetail(tenantId: string) {
  const [detail, setDetail] = useState<TenantDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      const result = await fetchTenantDetail(tenantId);
      setDetail(result.detail);
      if (result.partialErrors.length > 0) {
        setWarning(
          `Some sections could not be loaded: ${result.partialErrors.join(", ")}`,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load school details",
      );
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createUser = useCallback(
    async (input: {
      email: string;
      name: string;
      role: string;
    }) => {
      setCreatingUser(true);
      setError(null);
      try {
        await createTenantUser({
          tenantId,
          email: input.email,
          name: input.name,
          role: input.role,
        });
        await refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create user";
        setError(message);
        throw err;
      } finally {
        setCreatingUser(false);
      }
    },
    [tenantId, refresh],
  );

  return {
    detail,
    loading,
    creatingUser,
    error,
    warning,
    refresh,
    createUser,
  };
}
