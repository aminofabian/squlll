import type { TimetableStats } from "@/lib/timetable/types";
import type { WeekViewerType } from "./weekViewerType";
import type { WeekScheduleSummary } from "./summarizeWeekSchedule";

const MISSING_VALUE = "—";

export type HeroMetric = { label: string; value: string };

/** The three headline figures shown above the timetable. */
export function buildHeroMetrics(
  viewType: WeekViewerType,
  stats: TimetableStats | undefined,
  summary: WeekScheduleSummary | null,
): HeroMetric[] {
  const periods = { label: "Periods", value: String(stats?.totalLessons ?? 0) };
  const time = summary?.contactTimeLabel ?? MISSING_VALUE;
  if (viewType === "student") {
    return [periods, { label: "In class", value: time }, { label: "Subjects", value: String(stats?.totalSubjects ?? 0) }];
  }
  return [periods, { label: "Contact time", value: time }, { label: "Classes", value: String(summary?.distinctClasses ?? 0) }];
}
