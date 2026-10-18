"use client";

import { useCallback, useState } from "react";

/** Which lesson group (class or subject) the user has singled out on the grid. */
export function useGroupFocus() {
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const toggleFocus = useCallback(
    (key: string) => setFocusedKey((current) => (current === key ? null : key)),
    [],
  );
  const clearFocus = useCallback(() => setFocusedKey(null), []);
  return { focusedKey, toggleFocus, clearFocus };
}
