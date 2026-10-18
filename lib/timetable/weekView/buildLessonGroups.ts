import type { TimetableDay, TimetableLesson, TimetableSlot } from "@/lib/timetable/types";
import type { WeekViewerType } from "./weekViewerType";
import { getClassIdentity } from "./getClassIdentity";
import { getSlotMinutes } from "./getSlotMinutes";
import { LESSON_GROUP_PALETTE } from "./lessonGroupPalette";

export type LessonGroupMode = "class" | "subject";

export type LessonGroup = {
  key: string;
  label: string;
  shortLabel: string;
  badge: string;
  accent: string;
  surface: string;
  periods: number;
  minutes: number;
};

export type LessonGroups = {
  mode: LessonGroupMode;
  groups: LessonGroup[];
  groupFor: (lesson: TimetableLesson) => LessonGroup;
};

type GroupIdentity = Pick<LessonGroup, "key" | "label" | "shortLabel" | "badge">;

function identify(lesson: TimetableLesson, mode: LessonGroupMode): GroupIdentity {
  if (mode === "class") {
    const { key, fullLabel, shortLabel, badge } = getClassIdentity(lesson);
    return { key, label: fullLabel, shortLabel, badge };
  }
  const name = lesson.subject.name.trim();
  return { key: name.toLowerCase(), label: name, shortLabel: name, badge: name.charAt(0).toUpperCase() };
}

function chooseMode(days: TimetableDay[], viewType: WeekViewerType): LessonGroupMode {
  if (viewType === "student") return "subject";
  const lessons = days.flatMap((day) => day.cells.flatMap((cell) => (cell?.lesson ? [cell.lesson] : [])));
  const subjects = new Set(lessons.map((l) => identify(l, "subject").key)).size;
  const classes = new Set(lessons.map((l) => identify(l, "class").key)).size;
  return classes > subjects ? "class" : "subject";
}

function tally(days: TimetableDay[], timeSlots: TimetableSlot[], mode: LessonGroupMode) {
  const totals = new Map<string, GroupIdentity & { periods: number; minutes: number }>();
  for (const day of days) {
    day.cells.forEach((cell, slotIndex) => {
      if (cell?.type !== "lesson" || !cell.lesson) return;
      const identity = identify(cell.lesson, mode);
      const entry = totals.get(identity.key) ?? { ...identity, periods: 0, minutes: 0 };
      const slot = timeSlots[slotIndex];
      entry.periods += 1;
      entry.minutes += getSlotMinutes(slot?.startTime, slot?.endTime);
      totals.set(identity.key, entry);
    });
  }
  return [...totals.values()].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
}

/**
 * Groups the week by what tells lessons apart: classes for a teacher who
 * teaches more classes than subjects, otherwise subjects. Each group gets a
 * stable colour in label order.
 */
export function buildLessonGroups(
  days: TimetableDay[],
  timeSlots: TimetableSlot[],
  viewType: WeekViewerType,
): LessonGroups {
  const mode = chooseMode(days, viewType);
  const groups = tally(days, timeSlots, mode).map((entry, index) => ({
    ...entry,
    ...LESSON_GROUP_PALETTE[index % LESSON_GROUP_PALETTE.length],
  }));
  const byKey = new Map(groups.map((group) => [group.key, group]));
  const fallbackColors = LESSON_GROUP_PALETTE[0];

  return {
    mode,
    groups,
    groupFor: (lesson) => {
      const identity = identify(lesson, mode);
      return byKey.get(identity.key) ?? { ...identity, ...fallbackColors, periods: 0, minutes: 0 };
    },
  };
}
