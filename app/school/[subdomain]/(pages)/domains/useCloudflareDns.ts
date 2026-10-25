"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addDomainRecordsToCloudflare,
  connectCloudflareToken,
  disconnectCloudflareAccount,
  fetchCloudflareConnection,
  type CloudflareConnection,
  type CloudflareDnsResult,
} from "@/lib/school/domainsApi";
import { getDisplayErrorMessage } from "@/lib/utils/graphql-errors";

/**
 * Per-school Cloudflare connection plus the "write my DNS rows" action.
 * A missing connection is a normal state (the school may prefer manual DNS),
 * so load failures are surfaced but never block the domain list.
 */
export function useCloudflareDns() {
  const [connection, setConnection] = useState<CloudflareConnection | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [results, setResults] = useState<
    Record<string, CloudflareDnsResult[]>
  >({});
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setConnection(await fetchCloudflareConnection());
      setError(null);
    } catch (err) {
      setError(getDisplayErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const next = await fetchCloudflareConnection();
        if (alive) {
          setConnection(next);
          setError(null);
        }
      } catch (err) {
        if (alive) setError(getDisplayErrorMessage(err));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const connect = useCallback(async (token: string) => {
    setConnecting(true);
    try {
      setError(null);
      const next = await connectCloudflareToken(token);
      setConnection(next);
      return next;
    } catch (err) {
      const message = getDisplayErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      setError(null);
      const next = await disconnectCloudflareAccount();
      setConnection(next);
      setResults({});
    } catch (err) {
      const message = getDisplayErrorMessage(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const apply = useCallback(async (domainId: string) => {
    setApplyingId(domainId);
    try {
      setError(null);
      const rows = await addDomainRecordsToCloudflare(domainId);
      setResults((prev) => ({ ...prev, [domainId]: rows }));
      return rows;
    } catch (err) {
      const message = getDisplayErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setApplyingId(null);
    }
  }, []);

  return {
    connection,
    loading,
    connecting,
    applyingId,
    results,
    error,
    refresh,
    connect,
    disconnect,
    apply,
  };
}
