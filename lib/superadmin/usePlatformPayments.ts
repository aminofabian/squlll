"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchPlatformDarajaSettings,
  fetchPlatformMpesaCustody,
  testPlatformDarajaConnection,
  updatePlatformDarajaSettings,
  updatePlatformMpesaCustody,
  type PlatformDarajaSettings,
  type PlatformDarajaTestResult,
  type PlatformMpesaCustodySettings,
} from "./paymentsApi";

export function usePlatformPayments() {
  const [daraja, setDaraja] = useState<PlatformDarajaSettings | null>(null);
  const [custody, setCustody] = useState<PlatformMpesaCustodySettings | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<PlatformDarajaTestResult | null>(
    null,
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, c] = await Promise.all([
        fetchPlatformDarajaSettings(),
        fetchPlatformMpesaCustody(),
      ]);
      setDaraja(d);
      setCustody(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveDaraja = useCallback(
    async (input: Record<string, unknown>) => {
      setSaving(true);
      setError(null);
      try {
        const next = await updatePlatformDarajaSettings(input);
        setDaraja(next);
        return next;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Save failed";
        setError(msg);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const runTest = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testPlatformDarajaConnection();
      setTestResult(result);
      return result;
    } catch (e) {
      const result = {
        ok: false,
        message: e instanceof Error ? e.message : "Test failed",
      };
      setTestResult(result);
      return result;
    } finally {
      setTesting(false);
    }
  }, []);

  const setCustodyProvider = useCallback(async (custodyProvider: string) => {
    setSaving(true);
    setError(null);
    try {
      const next = await updatePlatformMpesaCustody(custodyProvider);
      setCustody(next);
      return next;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not update custody";
      setError(msg);
      throw e;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    daraja,
    custody,
    loading,
    saving,
    testing,
    error,
    testResult,
    refresh,
    saveDaraja,
    runTest,
    setCustodyProvider,
  };
}
