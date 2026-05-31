import { useMemo } from "react";
import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";
import { resolveTimetableWeekDays } from "../utils/timetableWeekDays";

/** Labels and count for the active school week (from slots + API). */
export function useTimetableWeekDays() {
  const daysPerWeekFromStore = useTimetableStore((s) => s.daysPerWeek);
  const timeSlots = useTimetableStore((s) => s.timeSlots);
  const entries = useTimetableStore((s) => s.entries);
  const breaks = useTimetableStore((s) => s.breaks);
  const selectedGradeId = useTimetableStore((s) => s.selectedGradeId);

  return useMemo(() => {
    const scopedEntries = selectedGradeId
      ? entries.filter((e) => e.gradeId === selectedGradeId)
      : entries;

    return resolveTimetableWeekDays({
      timeSlots,
      entries: scopedEntries,
      breaks,
      daysPerWeekFromApi: daysPerWeekFromStore,
    });
  }, [
    daysPerWeekFromStore,
    timeSlots,
    entries,
    breaks,
    selectedGradeId,
  ]);
}
