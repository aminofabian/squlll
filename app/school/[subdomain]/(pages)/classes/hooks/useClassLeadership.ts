"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  EMPTY_LEADERSHIP,
  parseLeadership,
  prefectStorageKey,
  sameStudent,
  type ClassLeadership,
  type PrefectRef,
} from "../utils/classPulse";

export type LeadershipRole = "prefect" | "deputy";

/**
 * Class prefect / deputy. There is no leadership table in the API yet, so the
 * selection is kept in localStorage per school + class. Swap the read/write
 * helpers for a mutation when the backend lands.
 */
export function useClassLeadership(
  gradeId: string,
  streamId?: string | null,
) {
  const params = useParams<{ subdomain?: string }>();
  const subdomain = (params?.subdomain as string) || "school";

  const storageKey = useMemo(
    () => (gradeId ? prefectStorageKey(subdomain, gradeId, streamId) : ""),
    [subdomain, gradeId, streamId],
  );

  const [leadership, setLeadership] = useState<ClassLeadership>({
    ...EMPTY_LEADERSHIP,
  });

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;

    const read = () => {
      try {
        setLeadership(
          parseLeadership(window.localStorage.getItem(storageKey)),
        );
      } catch {
        setLeadership({ ...EMPTY_LEADERSHIP });
      }
    };

    read();

    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey) read();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey]);

  const update = useCallback(
    (fn: (prev: ClassLeadership) => ClassLeadership) => {
      setLeadership((prev) => {
        const next = fn(prev);
        if (storageKey && typeof window !== "undefined") {
          try {
            window.localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {
            // Storage can be unavailable (private mode); keep in-memory state.
          }
        }
        return next;
      });
    },
    [storageKey],
  );

  const assign = useCallback(
    (role: LeadershipRole, student: PrefectRef) => {
      update((prev) => {
        const otherRole: LeadershipRole =
          role === "prefect" ? "deputy" : "prefect";
        const next: ClassLeadership = { ...prev };

        // Toggle off when the same learner is chosen again.
        if (sameStudent(prev[role], student)) {
          next[role] = null;
          return next;
        }

        next[role] = student;
        // A learner can't hold both badges at once.
        if (sameStudent(prev[otherRole], student)) next[otherRole] = null;
        return next;
      });
    },
    [update],
  );

  const clear = useCallback(
    (role: LeadershipRole) => {
      update((prev) => ({ ...prev, [role]: null }));
    },
    [update],
  );

  return { leadership, assign, clear };
}
