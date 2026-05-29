import { useMemo } from "react";
import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";
import { computeTimetableConflicts } from "../utils/computeTimetableConflicts";

/** Entry IDs involved in any teacher or room scheduling clash. */
export function useConflictLessonIds(): Set<string> {
  const entries = useTimetableStore((s) => s.entries);
  const timeSlots = useTimetableStore((s) => s.timeSlots);
  const teachers = useTimetableStore((s) => s.teachers);
  const grades = useTimetableStore((s) => s.grades);
  const subjects = useTimetableStore((s) => s.subjects);

  return useMemo(() => {
    const conflicts = computeTimetableConflicts(
      entries,
      timeSlots,
      teachers,
      grades,
      subjects,
    );
    const ids = new Set<string>();
    for (const conflict of conflicts) {
      for (const entry of conflict.entries) {
        ids.add(entry.id);
      }
    }
    return ids;
  }, [entries, timeSlots, teachers, grades, subjects]);
}
