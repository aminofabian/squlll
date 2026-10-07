"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchWalkthroughRequests,
  updateWalkthroughRequest,
  type UpdateWalkthroughInput,
  type WalkthroughRequestRecord,
} from "./walkthroughsApi";

function toLoadErrorMessage(err: unknown): string {
  return err instanceof Error
    ? err.message
    : "Failed to load walkthrough requests";
}

export function useWalkthroughs() {
  const [requests, setRequests] = useState<WalkthroughRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchWalkthroughRequests()
      .then((next) => {
        if (!active) return;
        setRequests(next);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(toLoadErrorMessage(err));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchWalkthroughRequests();
      setRequests(next);
    } catch (err) {
      setError(toLoadErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRequest = useCallback(
    async (
      input: UpdateWalkthroughInput,
    ): Promise<WalkthroughRequestRecord> => {
      setUpdating(true);
      setError(null);
      try {
        const saved = await updateWalkthroughRequest(input);
        setRequests((current) =>
          current.map((request) =>
            request.id === saved.id ? saved : request,
          ),
        );
        return saved;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update request";
        setError(message);
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [],
  );

  return { requests, loading, error, updating, refresh, updateRequest };
}
