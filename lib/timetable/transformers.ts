/**
 * Timetable Data Transformers
 *
 * Converts GraphQL responses from different timetable endpoints
 * into the unified CompleteTimetable format.
 */

import type {
  CompleteTimetable,
  TimetableSlot,
  TimetableDay,
  TimetableBreak,
  TimetableCell,
  TimetableLesson,
  TimetableStats,
  BreakType,
} from "@/lib/timetable/types";
import { getSubjectPaletteColor, normalizeSubjectName } from "@/lib/timetable/constants";

interface GraphQLTimeSlot {
  id: string;
  periodNumber: number;
  displayTime: string;
}

interface GraphQLBreakData {
  id: string;
  name: string;
  type: string;
  icon: string;
  durationMinutes: number;
}

interface GraphQLEntryData {
  id: string;
  roomNumber: string;
  subject: { name: string };
  teacher: { user: { name: string } | null };
}

interface GraphQLCell {
  dayOfWeek: number;
  periodNumber: number;
  isBreak: boolean;
  breakData: GraphQLBreakData | null;
  entryData: GraphQLEntryData | null;
}

interface GraphQLTimetable {
  gradeId: string;
  gradeName: string;
  timeSlots: GraphQLTimeSlot[];
  cells: GraphQLCell[];
}

/** Parse "7:30 AM – 8:15 AM" into { startTime: "07:30", endTime: "08:15" } */
function displayTimeToRange(displayTime: string): {
  startTime: string;
  endTime: string;
} {
  const parts = displayTime.split(" – ");
  if (parts.length !== 2) return { startTime: "00:00", endTime: "00:00" };

  function to24h(timeStr: string): string {
    const [time, period] = timeStr.trim().split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    let h = hours;
    if (period === "PM" && hours !== 12) h += 12;
    if (period === "AM" && hours === 12) h = 0;

    return `${h.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }

  return {
    startTime: to24h(parts[0]),
    endTime: to24h(parts[1]),
  };
}

/** Map GraphQL break type string to our BreakType */
function normalizeBreakType(type: string): BreakType {
  const upper = type.toUpperCase();
  if (upper === "RECESS") return "RECESS";
  if (upper === "LUNCH") return "LUNCH";
  if (upper === "BREAK") return "BREAK";
  if (upper === "ASSEMBLY") return "ASSEMBLY";
  if (upper === "EXAM") return "EXAM";
  return "BREAK";
}

const DAY_NAMES: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
};

const DAY_SHORT_NAMES: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
};

/**
 * Transform the GraphQL timetable response into the unified CompleteTimetable format.
 */
export function transformStudentTimetable(
  graphqlData: GraphQLTimetable,
  termId: string,
  termName: string,
  completedLessonIds: string[] = [],
): CompleteTimetable {
  // 1. Transform time slots
  const sortedSlots = [...graphqlData.timeSlots].sort(
    (a, b) => a.periodNumber - b.periodNumber,
  );

  const timeSlots: TimetableSlot[] = sortedSlots.map((slot) => {
    const { startTime, endTime } = displayTimeToRange(slot.displayTime);
    return {
      id: slot.id,
      periodNumber: slot.periodNumber,
      startTime,
      endTime,
      displayTime: slot.displayTime,
    };
  });

  // 2. Collect all breaks
  const breaksMap = new Map<string, TimetableBreak>();
  const breakCellPositions: Map<
    string,
    { dayOfWeek: number; periodNumber: number }
  > = new Map();

  // 3. Group cells by day
  const dayCellsMap = new Map<number, Map<number, GraphQLCell>>();
  for (const cell of graphqlData.cells) {
    if (!dayCellsMap.has(cell.dayOfWeek)) {
      dayCellsMap.set(cell.dayOfWeek, new Map());
    }
    dayCellsMap.get(cell.dayOfWeek)!.set(cell.periodNumber, cell);
  }

  // 4. Stats accumulators
  let totalLessons = 0;
  let completedCount = 0;
  const subjectDistribution: Record<string, number> = {};
  const dayDistribution: Record<string, number> = {};
  const teacherDistribution: Record<string, number> = {};

  // 5. Build days
  const days: TimetableDay[] = [];

  for (let d = 1; d <= 5; d++) {
    const dayCellMap = dayCellsMap.get(d) || new Map();
    const cells: (TimetableCell | null)[] = [];

    for (const slot of sortedSlots) {
      const gqlCell = dayCellMap.get(slot.periodNumber);

      if (!gqlCell) {
        cells.push(null);
        continue;
      }

      if (gqlCell.isBreak && gqlCell.breakData) {
        // Break
        const breakType = normalizeBreakType(gqlCell.breakData.type);
        const breakId = gqlCell.breakData.id;

        if (!breaksMap.has(breakId)) {
          breaksMap.set(breakId, {
            id: breakId,
            name: gqlCell.breakData.name || "Break",
            type: breakType,
            afterPeriod: gqlCell.periodNumber,
            durationMinutes: gqlCell.breakData.durationMinutes,
            dayOfWeek: gqlCell.dayOfWeek,
            applyToAllDays: false,
            icon: gqlCell.breakData.icon || "☕",
          });
        }

        cells.push({
          type: "break",
          periodNumber: slot.periodNumber,
          dayOfWeek: d,
          break: breaksMap.get(breakId)!,
        });
      } else if (gqlCell.entryData) {
        // Lesson
        const lesson: TimetableLesson = {
          id: gqlCell.entryData.id,
          periodNumber: slot.periodNumber,
          dayOfWeek: d,
          subject: {
            id: "",
            name: gqlCell.entryData.subject.name,
          },
          teacher: {
            id: "",
            name: gqlCell.entryData.teacher?.user?.name || "TBA",
          },
          room: gqlCell.entryData.roomNumber || "",
          grade: {
            id: graphqlData.gradeId,
            name: graphqlData.gradeName,
            displayName: graphqlData.gradeName,
            level: 0,
          },
        };

        cells.push({
          type: "lesson",
          periodNumber: slot.periodNumber,
          dayOfWeek: d,
          lesson,
        });

        // Stats
        totalLessons++;
        subjectDistribution[lesson.subject.name] =
          (subjectDistribution[lesson.subject.name] || 0) + 1;
        dayDistribution[DAY_NAMES[d]] =
          (dayDistribution[DAY_NAMES[d]] || 0) + 1;
        if (lesson.teacher.name !== "TBA") {
          teacherDistribution[lesson.teacher.name] =
            (teacherDistribution[lesson.teacher.name] || 0) + 1;
        }
        if (completedLessonIds.includes(lesson.id)) {
          completedCount++;
        }
      } else {
        cells.push(null);
      }
    }

    days.push({
      dayOfWeek: d,
      dayName: DAY_NAMES[d],
      shortName: DAY_SHORT_NAMES[d],
      cells,
    });
  }

  // 6. Build stats
  const stats: TimetableStats = {
    totalLessons,
    completedLessons: completedCount,
    upcomingLessons: totalLessons - completedCount,
    totalSubjects: Object.keys(subjectDistribution).length,
    subjectDistribution,
    dayDistribution,
    teacherDistribution,
    completionPercentage:
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
  };

  return {
    gradeId: graphqlData.gradeId,
    gradeName: graphqlData.gradeName,
    termId,
    termName,
    timeSlots,
    days,
    breaks: Array.from(breaksMap.values()),
    stats,
    lastUpdated: new Date().toISOString(),
  };
}

// ─── Teacher Timetable Types ──────────────────────────────────

interface TeacherTimeSlotInput {
  id: string;
  periodNumber: number;
  displayTime: string;
  startTime: string;
  endTime: string;
  color?: string | null;
}

interface TeacherEntryInput {
  id: string;
  gradeId: string;
  subjectId: string;
  teacherId: string;
  timeSlotId: string;
  dayOfWeek: number;
  roomNumber: string | null;
  grade: { id: string; name: string; gradeLevel: { name: string } };
  subject: { id: string; name: string };
  teacher: {
    id: string;
    fullName: string | null;
    user: { name: string } | null;
  };
  timeSlot: { id: string; periodNumber: number; displayTime: string };
}

function formatSlotTime(timeStr?: string): string {
  if (!timeStr) return "";
  if (timeStr.length === 5) return timeStr;
  if (timeStr.length >= 8) return timeStr.substring(0, 5);
  return timeStr;
}

function slotTimeFields(start?: string, end?: string) {
  const startTime = formatSlotTime(start);
  const endTime = formatSlotTime(end);
  return {
    startTime,
    endTime,
    displayTime:
      startTime && endTime ? `${startTime} - ${endTime}` : startTime || endTime,
  };
}

function addMinutesToTime(timeStr: string, minutes: number): string {
  const normalized = formatSlotTime(timeStr);
  if (!normalized) return "";
  const [h, m] = normalized.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export interface WeekTemplateDayApi {
  dayOfWeek: number;
  startTime?: string;
  periods?: Array<{
    id: string;
    periodNumber: number;
    startTime: string;
    endTime: string;
    label?: string | null;
  }>;
  breaks?: Array<{
    id: string;
    name: string;
    type: string;
    afterPeriod: number;
    durationMinutes: number;
    icon?: string | null;
    applyToAllDays?: boolean;
    dayTemplateId?: string | null;
  }>;
}

export interface WeekTemplateScheduleApi {
  id: string;
  dayTemplates?: WeekTemplateDayApi[];
}

/** Build school schedule shape from week templates when getSchoolTimetable returns empty. */
export function schoolScheduleFromWeekTemplates(
  weekTemplates: WeekTemplateScheduleApi[],
): SchoolScheduleDayApi[] {
  if (!weekTemplates.length) return [];

  const week = weekTemplates[0];
  const days = (week.dayTemplates ?? []).filter(
    (d) => d.dayOfWeek >= 1 && d.dayOfWeek <= 5,
  );
  if (!days.length) return [];

  const globalBreaks = days.flatMap((d) =>
    (d.breaks ?? []).filter((b) => b.applyToAllDays),
  );

  return days
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((day) => {
      const periods = [...(day.periods ?? [])]
        .filter((p) => p.periodNumber > 0)
        .sort((a, b) => a.periodNumber - b.periodNumber);

      const dayBreaks = [...(day.breaks ?? []), ...globalBreaks];
      const breaksByAfter = new Map<number, (typeof dayBreaks)[number]>();
      for (const b of dayBreaks) {
        const existing = breaksByAfter.get(b.afterPeriod);
        if (!existing || (existing.applyToAllDays && !b.applyToAllDays)) {
          breaksByAfter.set(b.afterPeriod, b);
        }
      }

      const slots: SchoolScheduleSlotApi[] = [];
      const breakBefore = breaksByAfter.get(0);
      if (breakBefore && periods[0]) {
        const start = formatSlotTime(periods[0].startTime);
        slots.push({
          type: "BREAK",
          id: breakBefore.id,
          startTime: start,
          endTime: addMinutesToTime(start, breakBefore.durationMinutes),
          name: breakBefore.name,
          breakType: breakBefore.type,
          afterPeriod: 0,
          durationMinutes: breakBefore.durationMinutes,
          icon: breakBefore.icon ?? undefined,
        });
      }

      for (const period of periods) {
        slots.push({
          type: "PERIOD",
          id: period.id,
          periodNumber: period.periodNumber,
          startTime: period.startTime,
          endTime: period.endTime,
          label: period.label ?? undefined,
        });

        const br = breaksByAfter.get(period.periodNumber);
        if (br) {
          const start = formatSlotTime(period.endTime);
          slots.push({
            type: "BREAK",
            id: br.id,
            startTime: start,
            endTime: addMinutesToTime(start, br.durationMinutes),
            name: br.name,
            breakType: br.type,
            afterPeriod: br.afterPeriod,
            durationMinutes: br.durationMinutes,
            icon: br.icon ?? undefined,
          });
        }
      }

      return {
        dayTemplate: { dayOfWeek: day.dayOfWeek },
        slots,
      };
    });
}

// ─── Teacher timetable from getSchoolTimetable (real breaks + periods) ───

export interface SchoolScheduleSlotApi {
  type: string;
  id?: string | null;
  periodNumber?: number | null;
  startTime: string;
  endTime: string;
  label?: string | null;
  name?: string | null;
  breakType?: string | null;
  afterPeriod?: number | null;
  durationMinutes?: number | null;
  icon?: string | null;
  entry?: {
    id: string;
    subject?: { id?: string; name?: string } | null;
    teacher?: { id?: string; name?: string } | null;
    gradeLevel?: { id?: string; name?: string; shortName?: string } | null;
    stream?: { id?: string; name?: string } | null;
    room?: { id?: string; name?: string } | null;
    isDoublePeriod?: boolean | null;
  } | null;
}

export interface SchoolScheduleDayApi {
  dayTemplate: {
    dayOfWeek: number;
    dayName?: string;
  };
  slots: SchoolScheduleSlotApi[];
}

export interface MyTimetableLessonApi {
  id: string;
  subjectName: string;
  gradeLevelName: string;
  streamName?: string | null;
  roomName?: string | null;
  dayOfWeek: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

function buildMyLessonLookup(
  mySchedule: { dayOfWeek: number; entries: MyTimetableLessonApi[] }[],
): Map<string, MyTimetableLessonApi> {
  const map = new Map<string, MyTimetableLessonApi>();
  for (const day of mySchedule) {
    for (const e of day.entries ?? []) {
      map.set(`${e.dayOfWeek}-${e.periodNumber}`, e);
    }
  }
  return map;
}

function lessonFromMyEntry(
  my: MyTimetableLessonApi,
  dayOfWeek: number,
  periodNumber: number,
  teacherId: string,
  teacherName: string,
): TimetableLesson {
  const subjectPalette = getSubjectPaletteColor(my.subjectName);
  const gradeLabel = my.streamName
    ? `${my.gradeLevelName} · ${my.streamName}`
    : my.gradeLevelName;

  return {
    id: my.id,
    periodNumber,
    dayOfWeek,
    subject: {
      id: my.subjectName,
      name: my.subjectName,
      color: subjectPalette.accent,
    },
    teacher: { id: teacherId, name: teacherName },
    room: my.roomName || "",
    grade: {
      id: gradeLabel,
      name: gradeLabel,
      displayName: gradeLabel,
      level: 0,
    },
    stream: my.streamName ?? undefined,
    isDoublePeriod: false,
  };
}

/**
 * Merge getMyTimetable lessons (source of truth) with getSchoolTimetable
 * structure (period times + break rows). Works even when school entry.teacher.id is missing.
 */
export function transformTeacherTimetableMerged(
  mySchedule: { dayOfWeek: number; entries: MyTimetableLessonApi[] }[],
  teacherId: string,
  teacherName: string,
  termId: string,
  termName: string,
  completedLessonIds: string[] = [],
  schoolSchedule?: SchoolScheduleDayApi[] | null,
): CompleteTimetable {
  const myByDayPeriod = buildMyLessonLookup(mySchedule);

  const periodNumberSet = new Set<number>();
  for (const my of myByDayPeriod.values()) {
    periodNumberSet.add(my.periodNumber);
  }

  let breaks: TimetableBreak[] = [];
  let timeSlots: TimetableSlot[] = [];
  const schoolDays =
    schoolSchedule?.filter(
      (d) => d.dayTemplate.dayOfWeek >= 1 && d.dayTemplate.dayOfWeek <= 5,
    ) ?? [];

  if (schoolDays.length > 0) {
    const refDay =
      schoolDays.find((d) => d.dayTemplate.dayOfWeek === 1) ?? schoolDays[0];

    for (const s of refDay?.slots ?? []) {
      if (s.type === "PERIOD" && s.periodNumber != null) {
        periodNumberSet.add(s.periodNumber);
      }
    }

    const periodNumbers = [...periodNumberSet].sort((a, b) => a - b);
    const refPeriodSlots =
      refDay?.slots.filter((s) => s.type === "PERIOD") ?? [];

    timeSlots = periodNumbers.map((periodNumber) => {
      const ref = refPeriodSlots.find((s) => s.periodNumber === periodNumber);
      const times = slotTimeFields(ref?.startTime, ref?.endTime);
      const mySample = [...myByDayPeriod.values()].find(
        (m) => m.periodNumber === periodNumber,
      );
      const myTimes = mySample
        ? slotTimeFields(mySample.startTime, mySample.endTime)
        : null;
      return {
        id: ref?.id ?? `period-${periodNumber}`,
        periodNumber,
        startTime: times.startTime || myTimes?.startTime || "",
        endTime: times.endTime || myTimes?.endTime || "",
        displayTime:
          times.displayTime || myTimes?.displayTime || `Period ${periodNumber}`,
        color: null,
      };
    });

    for (const day of schoolDays) {
      const dayOfWeek = day.dayTemplate.dayOfWeek;
      for (const slot of day.slots) {
        if (slot.type !== "BREAK") continue;
        const times = slotTimeFields(slot.startTime, slot.endTime);
        breaks.push({
          id: `${slot.id ?? "break"}-${dayOfWeek}`,
          name: slot.name || "Break",
          type: normalizeBreakType(slot.breakType || "BREAK"),
          afterPeriod: slot.afterPeriod ?? 0,
          dayOfWeek,
          durationMinutes: slot.durationMinutes ?? 0,
          icon: slot.icon || "☕",
          color: null,
          startTime: times.startTime,
          endTime: times.endTime,
        });
      }
    }
  } else {
    const periodNumbers = [...periodNumberSet].sort((a, b) => a - b);
    const periodTimes = new Map<number, { start: string; end: string }>();
    for (const my of myByDayPeriod.values()) {
      if (!periodTimes.has(my.periodNumber)) {
        periodTimes.set(my.periodNumber, {
          start: formatSlotTime(my.startTime),
          end: formatSlotTime(my.endTime),
        });
      }
    }
    timeSlots = periodNumbers.map((periodNumber) => {
      const times = periodTimes.get(periodNumber);
      const startTime = times?.start ?? "";
      const endTime = times?.end ?? "";
      return {
        id: `period-${periodNumber}`,
        periodNumber,
        startTime,
        endTime,
        displayTime:
          startTime && endTime ? `${startTime} - ${endTime}` : `Period ${periodNumber}`,
        color: null,
      };
    });
  }

  const periodNumbers = timeSlots
    .map((s) => s.periodNumber)
    .sort((a, b) => a - b);

  let totalLessons = 0;
  let completedCount = 0;
  const subjectDistribution: Record<string, number> = {};
  const dayDistribution: Record<string, number> = {};
  const teacherDistribution: Record<string, number> = {};

  const days: TimetableDay[] = [];

  for (let d = 1; d <= 5; d++) {
    const cells: (TimetableCell | null)[] = [];

    for (const periodNumber of periodNumbers) {
      const myLesson = myByDayPeriod.get(`${d}-${periodNumber}`);

      if (myLesson) {
        const lesson = lessonFromMyEntry(
          myLesson,
          d,
          periodNumber,
          teacherId,
          teacherName,
        );
        cells.push({ type: "lesson", periodNumber, dayOfWeek: d, lesson });
        totalLessons++;
        subjectDistribution[myLesson.subjectName] =
          (subjectDistribution[myLesson.subjectName] || 0) + 1;
        dayDistribution[DAY_NAMES[d]] = (dayDistribution[DAY_NAMES[d]] || 0) + 1;
        teacherDistribution[teacherName] =
          (teacherDistribution[teacherName] || 0) + 1;
        if (completedLessonIds.includes(lesson.id)) completedCount++;
      } else {
        cells.push(null);
      }
    }

    days.push({
      dayOfWeek: d,
      dayName: DAY_NAMES[d],
      shortName: DAY_SHORT_NAMES[d],
      cells,
    });
  }

  const stats: TimetableStats = {
    totalLessons,
    completedLessons: completedCount,
    upcomingLessons: totalLessons - completedCount,
    totalSubjects: Object.keys(subjectDistribution).length,
    subjectDistribution,
    dayDistribution,
    teacherDistribution,
    completionPercentage:
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
  };

  return {
    gradeId: "",
    gradeName: "My Classes",
    termId,
    termName,
    timeSlots,
    days,
    breaks,
    stats,
    lastUpdated: new Date().toISOString(),
  };
}

/** @deprecated Use transformTeacherTimetableMerged */
export function transformTeacherTimetableFromSchoolSchedule(
  schedule: SchoolScheduleDayApi[],
  teacherId: string,
  termId: string,
  termName: string,
  completedLessonIds: string[] = [],
): CompleteTimetable {
  return transformTeacherTimetableMerged(
    [],
    teacherId,
    "",
    termId,
    termName,
    completedLessonIds,
    schedule,
  );
}

/**
 * Fallback transform from getMyTimetable only (no break rows).
 */
export function transformTeacherTimetable(
  timeSlots: TeacherTimeSlotInput[],
  entries: TeacherEntryInput[],
  termId: string,
  termName: string,
  completedLessonIds: string[] = [],
): CompleteTimetable {
  const sortedSlots: TimetableSlot[] = [...timeSlots]
    .sort((a, b) => a.periodNumber - b.periodNumber)
    .map((slot) => ({
      id: slot.id,
      periodNumber: slot.periodNumber,
      startTime: slot.startTime,
      endTime: slot.endTime,
      displayTime: slot.displayTime,
      color: slot.color || null,
    }));

  // 2. Build slot ID → index map
  const slotIndexMap = new Map<string, number>();
  sortedSlots.forEach((slot, idx) => {
    slotIndexMap.set(slot.id, idx);
    slotIndexMap.set(`period-${slot.periodNumber}`, idx);
  });

  // 3. Group entries by day
  const dayEntriesMap = new Map<number, Map<number, TeacherEntryInput[]>>();
  for (const entry of entries) {
    if (!dayEntriesMap.has(entry.dayOfWeek)) {
      dayEntriesMap.set(entry.dayOfWeek, new Map());
    }
    const slotIdx = slotIndexMap.get(entry.timeSlotId);
    if (slotIdx === undefined) continue;

    if (!dayEntriesMap.get(entry.dayOfWeek)!.has(slotIdx)) {
      dayEntriesMap.get(entry.dayOfWeek)!.set(slotIdx, []);
    }
    dayEntriesMap.get(entry.dayOfWeek)!.get(slotIdx)!.push(entry);
  }

  // 4. Stats accumulators
  let totalLessons = 0;
  let completedCount = 0;
  const subjectDistribution: Record<string, number> = {};
  const dayDistribution: Record<string, number> = {};
  const teacherDistribution: Record<string, number> = {};

  // 5. Build days
  const days: TimetableDay[] = [];

  for (let d = 1; d <= 5; d++) {
    const dayEntryMap = dayEntriesMap.get(d) || new Map();
    const cells: (TimetableCell | null)[] = [];

    for (let si = 0; si < sortedSlots.length; si++) {
      const slotEntryList = dayEntryMap.get(si);

      if (!slotEntryList || slotEntryList.length === 0) {
        cells.push(null);
        continue;
      }

      // Take the first entry for this slot (teacher teaches one class per period)
      const entry = slotEntryList[0];
      const subjectPalette = getSubjectPaletteColor(entry.subject.name);

      const lesson: TimetableLesson = {
        id: entry.id,
        periodNumber: slot.periodNumber,
        dayOfWeek: d,
        subject: {
          id: entry.subject.id,
          name: entry.subject.name,
          color: subjectPalette.accent,
        },
        teacher: {
          id: entry.teacher.id,
          name: entry.teacher.fullName || entry.teacher.user?.name || "Unknown",
        },
        room: entry.roomNumber || "",
        grade: {
          id: entry.grade.id,
          name: entry.grade.name,
          displayName: entry.grade.name,
          level: 0,
        },
      };

      cells.push({
        type: "lesson",
        periodNumber: sortedSlots[si].periodNumber,
        dayOfWeek: d,
        lesson,
      });

      // Stats
      totalLessons++;
      subjectDistribution[lesson.subject.name] =
        (subjectDistribution[lesson.subject.name] || 0) + 1;
      dayDistribution[DAY_NAMES[d]] = (dayDistribution[DAY_NAMES[d]] || 0) + 1;
      teacherDistribution[lesson.teacher.name] =
        (teacherDistribution[lesson.teacher.name] || 0) + 1;
      if (completedLessonIds.includes(lesson.id)) {
        completedCount++;
      }
    }

    days.push({
      dayOfWeek: d,
      dayName: DAY_NAMES[d],
      shortName: DAY_SHORT_NAMES[d],
      cells,
    });
  }

  // 6. Stats
  const stats: TimetableStats = {
    totalLessons,
    completedLessons: completedCount,
    upcomingLessons: totalLessons - completedCount,
    totalSubjects: Object.keys(subjectDistribution).length,
    subjectDistribution,
    dayDistribution,
    teacherDistribution,
    completionPercentage:
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
  };

  return {
    gradeId: "",
    gradeName: "All Classes",
    termId,
    termName,
    timeSlots: sortedSlots,
    days,
    breaks: [],
    stats,
    lastUpdated: new Date().toISOString(),
  };
}
