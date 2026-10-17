import { useCallback, useState, useSyncExternalStore } from "react";

const DISMISSED_VALUE = "1";

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readDismissed(storageKey: string) {
  try {
    return window.localStorage.getItem(storageKey) === DISMISSED_VALUE;
  } catch {
    return false;
  }
}

/** A per-device "don't show this again" flag stored in localStorage. */
export function usePersistentDismissal(storageKey: string) {
  const storedDismissed = useSyncExternalStore(
    subscribeToStorage,
    () => readDismissed(storageKey),
    () => false,
  );
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  const dismiss = useCallback(() => {
    setDismissedKey(storageKey);
    try {
      window.localStorage.setItem(storageKey, DISMISSED_VALUE);
    } catch {
      // Storage can be unavailable (private mode); hiding for this visit is enough.
    }
  }, [storageKey]);

  return { dismissed: storedDismissed || dismissedKey === storageKey, dismiss };
}
