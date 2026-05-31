import type { TimeSlot } from "@/lib/types/timetable";

function formatSlotTime(timeStr?: string): string {
  if (!timeStr) return "";
  if (timeStr.length === 5) return timeStr;
  if (timeStr.length === 8) return timeStr.substring(0, 5);
  return timeStr;
}

/** Build grade-scoped period rows from getSchoolTimetable schedule/day blocks. */
export function extractTimeSlotsFromTimetableData(
  timetableData: {
    schedule?: Array<{
      dayTemplate?: { id?: string; dayOfWeek?: number };
      periods?: Array<{
        isBreak?: boolean;
        period?: {
          id?: string;
          periodNumber?: number;
          startTime?: string;
          endTime?: string;
          label?: string;
        };
      }>;
    }>;
    timetableByGrade?: Array<{
      gradeLevel?: { id?: string };
      days?: Array<{
        dayTemplate?: { id?: string; dayOfWeek?: number };
        periods?: Array<{
          isBreak?: boolean;
          period?: {
            id?: string;
            periodNumber?: number;
            startTime?: string;
            endTime?: string;
            label?: string;
          };
        }>;
      }>;
    }>;
  },
  tenantGradeLevelId?: string,
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const seenIds = new Set<string>();

  const matchingGradeBlocks = (timetableData.timetableByGrade || []).filter(
    (block) =>
      !tenantGradeLevelId || block.gradeLevel?.id === tenantGradeLevelId,
  );

  const dayItems = tenantGradeLevelId
    ? matchingGradeBlocks.flatMap((block) => block.days || [])
    : timetableData.schedule && timetableData.schedule.length > 0
      ? timetableData.schedule
      : matchingGradeBlocks.flatMap((block) => block.days || []);

  for (const dayItem of dayItems) {
    const dayOfWeek = dayItem.dayTemplate?.dayOfWeek;
    const dayTemplateId = dayItem.dayTemplate?.id;
    for (const p of dayItem.periods || []) {
      if (p?.isBreak || !p?.period?.id || !p.period.periodNumber) continue;
      if (seenIds.has(p.period.id)) continue;
      seenIds.add(p.period.id);
      slots.push({
        id: p.period.id,
        periodNumber: p.period.periodNumber,
        time: `${formatSlotTime(p.period.startTime)} - ${formatSlotTime(p.period.endTime)}`,
        startTime: formatSlotTime(p.period.startTime),
        endTime: formatSlotTime(p.period.endTime),
        color: "border-l-primary",
        dayOfWeek,
        label: p.period.label,
        dayTemplateId,
      });
    }
  }

  return slots.sort((a, b) => {
    const dayA = a.dayOfWeek ?? 0;
    const dayB = b.dayOfWeek ?? 0;
    if (dayA !== dayB) return dayA - dayB;
    return a.periodNumber - b.periodNumber;
  });
}

/** Resolve the period row for a given day (1-based) and period number. */
export function getTimeSlotForDayAndPeriod(
  timeSlots: TimeSlot[],
  dayOfWeek: number,
  periodNumber: number,
): TimeSlot | undefined {
  const onDay = timeSlots.find(
    (s) => s.periodNumber === periodNumber && s.dayOfWeek === dayOfWeek,
  );
  if (onDay) return onDay;
  return timeSlots.find(
    (s) => s.periodNumber === periodNumber && !s.dayOfWeek,
  );
}

/** Map period id → day of week from getSchoolTimetable schedule blocks. */
export function buildPeriodDayMapFromTimetableData(timetableData: {
  schedule?: Array<{
    dayTemplate?: { dayOfWeek?: number };
    periods?: Array<{ period?: { id?: string } }>;
  }>;
  timetableByGrade?: Array<{
    days?: Array<{
      dayTemplate?: { dayOfWeek?: number };
      periods?: Array<{ period?: { id?: string } }>;
    }>;
  }>;
}): Map<string, number> {
  const map = new Map<string, number>();

  const addDays = (
    days: Array<{
      dayTemplate?: { dayOfWeek?: number };
      periods?: Array<{ period?: { id?: string } }>;
    }>,
  ) => {
    for (const dayItem of days) {
      const dayOfWeek = dayItem.dayTemplate?.dayOfWeek;
      if (typeof dayOfWeek !== "number") continue;
      for (const p of dayItem.periods || []) {
        const periodId = p?.period?.id;
        if (periodId) map.set(periodId, dayOfWeek);
      }
    }
  };

  addDays(timetableData.schedule || []);
  for (const block of timetableData.timetableByGrade || []) {
    addDays(block.days || []);
  }

  return map;
}

export function uniquePeriodNumbers(timeSlots: TimeSlot[]): number[] {
  const set = new Set<number>();
  for (const s of timeSlots) {
    if (typeof s.periodNumber === "number" && s.periodNumber >= 1) {
      set.add(s.periodNumber);
    }
  }
  return Array.from(set).sort((a, b) => a - b);
}
