import { useMemo } from "react";
import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";

/** Entry IDs involved in any teacher or room scheduling clash. */
export function useConflictLessonIds(): Set<string> {
  const conflicts = useTimetableStore((s) => s.conflicts);

  return useMemo(() => {
    const ids = new Set<string>();
    for (const conflict of conflicts) {
      for (const entry of conflict.entries) {
        ids.add(entry.id);
      }
    }
    return ids;
  }, [conflicts]);
}
