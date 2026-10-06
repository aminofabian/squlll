"use client";

import { useCallback, useEffect, useState } from "react";
import {
  connectTenantDomain,
  disconnectTenantDomain,
  fetchTenantDomains,
  setPrimaryTenantDomain,
  verifyTenantDomain,
  type TenantDomain,
} from "@/lib/school/domainsApi";
import { getDisplayErrorMessage } from "@/lib/utils/graphql-errors";

export function useTenantDomains() {
  const [domains, setDomains] = useState<TenantDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const rows = await fetchTenantDomains();
      setDomains(rows);
    } catch (err) {
      setError(getDisplayErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const connect = useCallback(
    async (hostname: string) => {
      try {
        setError(null);
        const created = await connectTenantDomain(hostname);
        await refresh();
        return created;
      } catch (err) {
        const message = getDisplayErrorMessage(err);
        setError(message);
        throw new Error(message);
      }
    },
    [refresh],
  );

  const verify = useCallback(
    async (id: string) => {
      setBusyId(id);
      try {
        setError(null);
        const updated = await verifyTenantDomain(id);
        setDomains((prev) => prev.map((d) => (d.id === id ? updated : d)));
        return updated;
      } catch (err) {
        const message = getDisplayErrorMessage(err);
        setError(message);
        throw new Error(message);
      } finally {
        setBusyId(null);
      }
    },
    [],
  );

  const setPrimary = useCallback(
    async (id: string) => {
      setBusyId(id);
      try {
        setError(null);
        await setPrimaryTenantDomain(id);
        await refresh();
      } catch (err) {
        const message = getDisplayErrorMessage(err);
        setError(message);
        throw new Error(message);
      } finally {
        setBusyId(null);
      }
    },
    [refresh],
  );

  const disconnect = useCallback(
    async (id: string) => {
      setBusyId(id);
      try {
        setError(null);
        await disconnectTenantDomain(id);
        setDomains((prev) => prev.filter((d) => d.id !== id));
      } catch (err) {
        const message = getDisplayErrorMessage(err);
        setError(message);
        throw new Error(message);
      } finally {
        setBusyId(null);
      }
    },
    [],
  );

  return {
    domains,
    loading,
    busyId,
    error,
    refresh,
    connect,
    verify,
    setPrimary,
    disconnect,
  };
}
