"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createTenant,
  deleteTenants,
  fetchAllTenants,
  type CreateTenantInput,
  type CreateTenantResult,
  type DeleteTenantsResult,
} from "./tenantsApi";
import type { TenantRecord } from "./types";

export function useTenants() {
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchAllTenants();
      setTenants(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schools");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTenant = useCallback(
    async (input: CreateTenantInput): Promise<CreateTenantResult> => {
      setCreating(true);
      setError(null);
      try {
        const result = await createTenant(input);
        setTenants((current) => [result.tenant, ...current]);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create school";
        setError(message);
        throw err;
      } finally {
        setCreating(false);
      }
    },
    [],
  );

  const removeTenants = useCallback(
    async (tenantIds: string[]): Promise<DeleteTenantsResult> => {
      setDeleting(true);
      try {
        const result = await deleteTenants(tenantIds);
        const deletedIds = new Set(result.deleted.map((d) => d.tenantId));
        setTenants((current) => current.filter((t) => !deletedIds.has(t.id)));
        return result;
      } finally {
        setDeleting(false);
      }
    },
    [],
  );

  return {
    tenants,
    loading,
    creating,
    deleting,
    error,
    refresh,
    addTenant,
    removeTenants,
  };
}
