import { useMemo } from "react";
import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";
import { dayLabelsForCount } from "../utils/timetableWeekDays";

/** Labels and count for the active school week (from backend). */
export function useTimetableWeekDays() {
  const daysPerWeek = useTimetableStore((s) => s.daysPerWeek);

  return useMemo(() => {
    const d = daysPerWeek || 5;
    return {
      daysPerWeek: d,
      dayLabels: dayLabelsForCount(d),
    };
  }, [daysPerWeek]);
}
