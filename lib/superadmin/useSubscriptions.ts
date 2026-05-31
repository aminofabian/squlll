"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cancelSubscription,
  fetchAllSubscriptions,
  updateSubscription,
} from "./subscriptionsApi";
import type {
  CancelSubscriptionInput,
  UpdateSubscriptionInput,
} from "./subscriptions";
import type { SubscriptionRecord } from "./types";

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchAllSubscriptions();
      setSubscriptions(next);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load subscriptions",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const patchSubscription = useCallback((updated: SubscriptionRecord) => {
    setSubscriptions((current) =>
      current.map((sub) => (sub.id === updated.id ? updated : sub)),
    );
  }, []);

  const saveSubscription = useCallback(
    async (input: UpdateSubscriptionInput) => {
      setSavingId(input.id);
      setError(null);
      try {
        const updated = await updateSubscription(input);
        patchSubscription(updated);
        return updated;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update subscription";
        setError(message);
        throw err;
      } finally {
        setSavingId(null);
      }
    },
    [patchSubscription],
  );

  const cancelSubscriptionById = useCallback(
    async (input: CancelSubscriptionInput) => {
      setSavingId(input.subscriptionId);
      setError(null);
      try {
        const updated = await cancelSubscription(input);
        patchSubscription(updated);
        return updated;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to cancel subscription";
        setError(message);
        throw err;
      } finally {
        setSavingId(null);
      }
    },
    [patchSubscription],
  );

  return {
    subscriptions,
    loading,
    savingId,
    error,
    refresh,
    saveSubscription,
    cancelSubscriptionById,
  };
}
