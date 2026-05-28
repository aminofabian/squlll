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

/**
 * Transform teacher timetable data (from useTeacherTimetable hook)
 * into the unified CompleteTimetable format.
 */
export function transformTeacherTimetable(
  timeSlots: TeacherTimeSlotInput[],
  entries: TeacherEntryInput[],
  termId: string,
  termName: string,
  completedLessonIds: string[] = [],
): CompleteTimetable {
  // 1. Transform time slots
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

      const lesson: TimetableLesson = {
        id: entry.id,
        periodNumber: sortedSlots[si].periodNumber,
        dayOfWeek: d,
        subject: {
          id: entry.subject.id,
          name: entry.subject.name,
        },
        teacher: {
          id: entry.teacher.id,
          name: entry.teacher.fullName || entry.teacher.user?.name || "Unknown",
        },
        room: entry.roomNumber || "",
        grade: {
          id: entry.grade.id,
          name: entry.grade.name,
          displayName: entry.grade.gradeLevel?.name || entry.grade.name,
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
