"use client";

import { useEffect, useRef, useState } from "react";

function readOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

/**
 * Tracks browser online/offline and exposes a one-shot "reconnected" signal
 * (offline → online) for debounced timetable refresh.
 */
export function useTimetableNetworkStatus() {
  const [isOnline, setIsOnline] = useState(readOnline);
  const [reconnectedAt, setReconnectedAt] = useState(0);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    const handleOffline = () => {
      wasOfflineRef.current = true;
      setIsOnline(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        setReconnectedAt(Date.now());
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    setIsOnline(readOnline());

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return { isOnline, reconnectedAt };
}
