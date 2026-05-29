import type {
  Conflict,
  Grade,
  Subject,
  Teacher,
  TimetableEntry,
  TimeSlot,
} from "@/lib/types/timetable";

export function getEntryPeriodNumber(
  entry: Pick<TimetableEntry, "periodNumber" | "timeSlotId" | "dayOfWeek">,
  timeSlots: TimeSlot[],
): number | undefined {
  if (typeof entry.periodNumber === "number" && entry.periodNumber >= 1) {
    return entry.periodNumber;
  }
  const slot = timeSlots.find(
    (ts) =>
      ts.id === entry.timeSlotId &&
      (ts.dayOfWeek == null || ts.dayOfWeek === entry.dayOfWeek),
  );
  if (slot?.periodNumber) return slot.periodNumber;
  return timeSlots.find((ts) => ts.id === entry.timeSlotId)?.periodNumber;
}

export function getOccupiedPeriodNumbers(
  entry: Pick<
    TimetableEntry,
    "periodNumber" | "timeSlotId" | "dayOfWeek" | "isDoublePeriod"
  >,
  timeSlots: TimeSlot[],
): number[] {
  const base = getEntryPeriodNumber(entry, timeSlots);
  if (!base) return [];
  const periods = [base];
  if (entry.isDoublePeriod) periods.push(base + 1);
  return periods;
}

export function entriesOverlapInTime(
  a: TimetableEntry,
  b: TimetableEntry,
  timeSlots: TimeSlot[],
): boolean {
  if (a.dayOfWeek !== b.dayOfWeek) return false;
  const pa = getOccupiedPeriodNumbers(a, timeSlots);
  const pb = getOccupiedPeriodNumbers(b, timeSlots);
  return pa.some((p) => pb.includes(p));
}

export function isTeacherBusyAt(
  teacherId: string,
  dayOfWeek: number,
  targetPeriods: number[],
  entries: TimetableEntry[],
  timeSlots: TimeSlot[],
  excludeEntryId?: string,
): boolean {
  if (targetPeriods.length === 0) return false;
  return entries.some((entry) => {
    if (entry.teacherId !== teacherId) return false;
    if (excludeEntryId && entry.id === excludeEntryId) return false;
    if (entry.dayOfWeek !== dayOfWeek) return false;
    const occupied = getOccupiedPeriodNumbers(entry, timeSlots);
    return targetPeriods.some((p) => occupied.includes(p));
  });
}

export function getBusyTeacherIds(
  dayOfWeek: number,
  targetPeriods: number[],
  entries: TimetableEntry[],
  timeSlots: TimeSlot[],
  excludeEntryId?: string,
): Set<string> {
  const busy = new Set<string>();
  if (targetPeriods.length === 0) return busy;
  for (const entry of entries) {
    if (excludeEntryId && entry.id === excludeEntryId) continue;
    if (entry.dayOfWeek !== dayOfWeek) continue;
    const occupied = getOccupiedPeriodNumbers(entry, timeSlots);
    if (targetPeriods.some((p) => occupied.includes(p))) {
      busy.add(entry.teacherId);
    }
  }
  return busy;
}

export function validateScheduleConflict(params: {
  teacherId: string;
  roomNumber?: string;
  dayOfWeek: number;
  targetPeriods: number[];
  entries: TimetableEntry[];
  timeSlots: TimeSlot[];
  excludeEntryId?: string;
}): { ok: true } | { ok: false; title: string; description: string } {
  const {
    teacherId,
    roomNumber,
    dayOfWeek,
    targetPeriods,
    entries,
    timeSlots,
    excludeEntryId,
  } = params;

  if (
    isTeacherBusyAt(
      teacherId,
      dayOfWeek,
      targetPeriods,
      entries,
      timeSlots,
      excludeEntryId,
    )
  ) {
    return {
      ok: false,
      title: "Teacher already booked",
      description:
        "This teacher is already scheduled at this time in another class. Choose a different teacher or time slot.",
    };
  }

  const room = roomNumber?.trim();
  if (
    room &&
    isRoomBusyAt(
      room,
      dayOfWeek,
      targetPeriods,
      entries,
      timeSlots,
      excludeEntryId,
    )
  ) {
    return {
      ok: false,
      title: "Room already booked",
      description: `${room} is already in use at this time. Pick another room or time slot.`,
    };
  }

  return { ok: true };
}

export function isRoomBusyAt(
  roomNumber: string,
  dayOfWeek: number,
  targetPeriods: number[],
  entries: TimetableEntry[],
  timeSlots: TimeSlot[],
  excludeEntryId?: string,
): boolean {
  const room = roomNumber.trim();
  if (!room) return false;
  const normalized = room.toLowerCase();
  return entries.some((entry) => {
    if (!entry.roomNumber) return false;
    if (entry.roomNumber.trim().toLowerCase() !== normalized) return false;
    if (excludeEntryId && entry.id === excludeEntryId) return false;
    if (entry.dayOfWeek !== dayOfWeek) return false;
    const occupied = getOccupiedPeriodNumbers(entry, timeSlots);
    return targetPeriods.some((p) => occupied.includes(p));
  });
}

function conflictTimeLabel(
  entry: TimetableEntry,
  timeSlots: TimeSlot[],
): string {
  const slot = timeSlots.find(
    (ts) =>
      ts.id === entry.timeSlotId &&
      (ts.dayOfWeek == null || ts.dayOfWeek === entry.dayOfWeek),
  );
  if (slot?.time) return slot.time;
  const period = getEntryPeriodNumber(entry, timeSlots);
  if (period) return `Period ${period}`;
  return "Unknown time";
}

function buildConflictEntry(
  entry: TimetableEntry,
  grades: Grade[],
  subjects: Subject[],
  timeSlots: TimeSlot[],
): Conflict["entries"][number] {
  const grade = grades.find((g) => g.id === entry.gradeId);
  const subject = subjects.find((s) => s.id === entry.subjectId);
  return {
    id: entry.id,
    grade: grade?.displayName || grade?.name || entry.gradeName || "Unknown",
    subject: subject?.name || "Unknown",
    dayOfWeek: entry.dayOfWeek,
    timeSlot: conflictTimeLabel(entry, timeSlots),
  };
}

function dedupeEntries(entries: TimetableEntry[]): TimetableEntry[] {
  return Array.from(new Map(entries.map((e) => [e.id, e])).values());
}

function conflictSignature(type: string, entries: TimetableEntry[]): string {
  return `${type}:${entries
    .map((e) => e.id)
    .sort()
    .join(",")}`;
}

/**
 * Detect teacher and room scheduling clashes across all grades.
 * Matches by day + period number (and double-period span), not timeSlotId alone.
 */
export function computeTimetableConflicts(
  entries: TimetableEntry[],
  timeSlots: TimeSlot[],
  teachers: Teacher[],
  grades: Grade[],
  subjects: Subject[],
): Conflict[] {
  const conflicts: Conflict[] = [];
  const seen = new Set<string>();

  const teacherSlotMap = new Map<string, TimetableEntry[]>();
  for (const entry of entries) {
    for (const period of getOccupiedPeriodNumbers(entry, timeSlots)) {
      const key = `${entry.teacherId}|${entry.dayOfWeek}|${period}`;
      const list = teacherSlotMap.get(key) ?? [];
      if (!list.some((e) => e.id === entry.id)) list.push(entry);
      teacherSlotMap.set(key, list);
    }
  }

  for (const group of teacherSlotMap.values()) {
    const uniqueEntries = dedupeEntries(group);
    if (uniqueEntries.length < 2) continue;

    const sig = conflictSignature("teacher", uniqueEntries);
    if (seen.has(sig)) continue;
    seen.add(sig);

    const teacher = teachers.find((t) => t.id === uniqueEntries[0].teacherId);
    conflicts.push({
      type: "teacher_conflict",
      teacher: teacher
        ? { id: teacher.id, name: teacher.name }
        : { id: uniqueEntries[0].teacherId, name: "Unknown teacher" },
      entries: uniqueEntries.map((entry) =>
        buildConflictEntry(entry, grades, subjects, timeSlots),
      ),
    });
  }

  const roomSlotMap = new Map<string, TimetableEntry[]>();
  for (const entry of entries) {
    const room = entry.roomNumber?.trim();
    if (!room) continue;
    for (const period of getOccupiedPeriodNumbers(entry, timeSlots)) {
      const key = `${room.toLowerCase()}|${entry.dayOfWeek}|${period}`;
      const list = roomSlotMap.get(key) ?? [];
      if (!list.some((e) => e.id === entry.id)) list.push(entry);
      roomSlotMap.set(key, list);
    }
  }

  for (const group of roomSlotMap.values()) {
    const uniqueEntries = dedupeEntries(group);
    if (uniqueEntries.length < 2) continue;

    const sig = conflictSignature("room", uniqueEntries);
    if (seen.has(sig)) continue;
    seen.add(sig);

    conflicts.push({
      type: "room_conflict",
      room: uniqueEntries[0].roomNumber,
      entries: uniqueEntries.map((entry) =>
        buildConflictEntry(entry, grades, subjects, timeSlots),
      ),
    });
  }

  return conflicts;
}
