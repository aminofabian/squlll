import { DAY_NAMES, DAY_SHORT_NAMES } from "@/lib/timetable/constants";
import type {
  TimetableBreak,
  TimetableCell,
  TimetableDay,
  TimetableGrade,
  TimetableLesson,
  TimetableSlot,
} from "@/lib/timetable/types";
import type { BreakType } from "@/lib/timetable/types";

type TimeSlotInfo = {
  id: string;
  periodNumber: number;
  startTime?: string;
  endTime?: string;
  displayTime?: string;
  time?: string;
};

type LessonEntry = {
  id: string;
  subject: { id?: string; name: string; code?: string };
  teacher: { id?: string; name: string; fullName?: string };
  roomNumber?: string | null;
  gradeId?: string;
  isDoublePeriod?: boolean;
  isDoubleContinuation?: boolean;
};

type BreakEntry = {
  id?: string;
  name: string;
  type: string;
  afterPeriod: number;
  durationMinutes: number;
  dayOfWeek?: number;
  applyToAllDays?: boolean;
  icon?: string;
};

function mapBreakType(type: string): BreakType {
  const haystack = type.toLowerCase();
  if (haystack.includes("lunch")) return "LUNCH";
  if (haystack.includes("assembly")) return "ASSEMBLY";
  if (haystack.includes("exam")) return "EXAM";
  if (haystack.includes("recess")) return "RECESS";
  return "BREAK";
}

function breakBlocksDoubleSpan(
  getBreaksAfterPeriod: (period: number) => BreakEntry[],
  dayOfWeek: number,
  afterPeriod: number,
): boolean {
  return getBreaksAfterPeriod(afterPeriod).some(
    (b) => b.applyToAllDays || b.dayOfWeek === dayOfWeek,
  );
}

function slotToTimetableSlot(slot: TimeSlotInfo): TimetableSlot {
  const start = slot.startTime ?? "";
  const end = slot.endTime ?? "";
  const display =
    slot.displayTime?.trim() ||
    slot.time?.trim() ||
    (start && end ? `${start} – ${end}` : `Period ${slot.periodNumber}`);

  return {
    id: slot.id,
    periodNumber: slot.periodNumber,
    startTime: start,
    endTime: end,
    displayTime: display,
    color: null,
  };
}

function resolveDisplayEntry(
  dayOfWeek: number,
  period: number,
  prevPeriod: number | null,
  getEntryFor: (dayOfWeek: number, period: number) => LessonEntry | null,
  getBreaksAfterPeriod: (period: number) => BreakEntry[],
): LessonEntry | null {
  const entry = getEntryFor(dayOfWeek, period);
  if (entry) return entry;

  if (prevPeriod == null) return null;
  const prev = getEntryFor(dayOfWeek, prevPeriod);
  if (
    prev?.isDoublePeriod &&
    !breakBlocksDoubleSpan(getBreaksAfterPeriod, dayOfWeek, prevPeriod)
  ) {
    return { ...prev, isDoubleContinuation: true };
  }

  return null;
}

function entryToLesson(
  entry: LessonEntry,
  dayOfWeek: number,
  periodNumber: number,
  grade: TimetableGrade | null,
): TimetableLesson {
  const teacherName =
    entry.teacher.fullName?.trim() ||
    entry.teacher.name?.trim() ||
    "Teacher";

  return {
    id: entry.id,
    periodNumber,
    dayOfWeek,
    subject: {
      id: entry.subject.id ?? entry.id,
      name: entry.subject.name,
      code: entry.subject.code,
    },
    teacher: {
      id: entry.teacher.id ?? "",
      name: teacherName,
    },
    room: entry.roomNumber?.trim() || "—",
    grade: grade ?? {
      id: entry.gradeId ?? "",
      name: "Class",
      displayName: "Class",
      level: 0,
    },
    isDoublePeriod: entry.isDoublePeriod,
    isDoubleContinuation: entry.isDoubleContinuation,
  };
}

export type BuildAdminMobileTimetableInput = {
  daysPerWeek: number;
  dayLabels: string[];
  periodNumbers: number[];
  getSlotFor: (dayIndex: number, period: number) => TimeSlotInfo | null;
  getEntryFor: (dayOfWeek: number, period: number) => LessonEntry | null;
  getBreaksAfterPeriod: (period: number) => BreakEntry[];
  getBreaksBeforeFirstPeriod: () => BreakEntry[];
  getCleanBreakName?: (name: string) => string;
  grade?: {
    id: string;
    name: string;
    displayName?: string;
    level?: number;
  } | null;
};

export type AdminMobileTimetableData = {
  days: TimetableDay[];
  timeSlots: TimetableSlot[];
  breaks: TimetableBreak[];
  weekDays: number[];
  dayShortNames: Record<number, string>;
};

export function buildAdminMobileTimetable(
  input: BuildAdminMobileTimetableInput,
): AdminMobileTimetableData | null {
  const {
    daysPerWeek,
    dayLabels,
    periodNumbers,
    getSlotFor,
    getEntryFor,
    getBreaksAfterPeriod,
    getBreaksBeforeFirstPeriod,
    getCleanBreakName = (n) => n,
    grade,
  } = input;

  if (periodNumbers.length === 0) return null;

  const weekDays = Array.from({ length: daysPerWeek }, (_, i) => i + 1);
  const dayShortNames: Record<number, string> = {};
  weekDays.forEach((d, index) => {
    dayShortNames[d] =
      DAY_SHORT_NAMES[d] ??
      dayLabels[index]?.slice(0, 3) ??
      `D${d}`;
  });

  const timetableGrade: TimetableGrade | null = grade
    ? {
        id: grade.id,
        name: grade.name,
        displayName: grade.displayName || grade.name,
        level: grade.level ?? 0,
      }
    : null;

  const timeSlots: TimetableSlot[] = periodNumbers.map((period) => {
    const base =
      weekDays.reduce<TimeSlotInfo | null>((found, _, dayIndex) => {
        if (found) return found;
        return getSlotFor(dayIndex, period);
      }, null) ??
      ({
        id: `period-${period}`,
        periodNumber: period,
        startTime: "",
        endTime: "",
        displayTime: `Period ${period}`,
      } satisfies TimeSlotInfo);

    return slotToTimetableSlot(base);
  });

  const breakByAfter = new Map<number, BreakEntry>();
  getBreaksBeforeFirstPeriod().forEach((b) => {
    if (!breakByAfter.has(b.afterPeriod)) breakByAfter.set(b.afterPeriod, b);
  });
  periodNumbers.forEach((period) => {
    getBreaksAfterPeriod(period).forEach((b) => {
      if (!breakByAfter.has(b.afterPeriod)) breakByAfter.set(b.afterPeriod, b);
    });
  });

  const breaks: TimetableBreak[] = Array.from(breakByAfter.values()).map(
    (b, index) => ({
      id: b.id ?? `break-${b.afterPeriod}-${index}`,
      name: getCleanBreakName(b.name),
      type: mapBreakType(b.type),
      afterPeriod: b.afterPeriod,
      durationMinutes: b.durationMinutes,
      dayOfWeek: b.dayOfWeek,
      applyToAllDays: b.applyToAllDays,
      icon: b.icon ?? "☕",
      color: null,
    }),
  );

  const days: TimetableDay[] = weekDays.map((dayOfWeek, dayIndex) => {
    const cells: (TimetableCell | null)[] = timeSlots.map((slot, slotIndex) => {
      const prevPeriod =
        slotIndex > 0 ? periodNumbers[slotIndex - 1] ?? null : null;
      const entry = resolveDisplayEntry(
        dayOfWeek,
        slot.periodNumber,
        prevPeriod,
        getEntryFor,
        getBreaksAfterPeriod,
      );

      if (!entry) return null;

      return {
        type: "lesson" as const,
        periodNumber: slot.periodNumber,
        dayOfWeek,
        lesson: entryToLesson(
          entry,
          dayOfWeek,
          slot.periodNumber,
          timetableGrade,
        ),
      };
    });

    return {
      dayOfWeek,
      dayName: DAY_NAMES[dayOfWeek] ?? dayLabels[dayIndex] ?? `Day ${dayOfWeek}`,
      shortName: dayShortNames[dayOfWeek] ?? `D${dayOfWeek}`,
      cells,
    };
  });

  return { days, timeSlots, breaks, weekDays, dayShortNames };
}
