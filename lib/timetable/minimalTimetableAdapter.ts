/**
 * Converts getMinimalTimetable GraphQL response into the shape expected by
 * transformStudentTimetable (formerly getCompleteTimetable).
 */

export interface StudentTimetableGraphQL {
  gradeId: string;
  gradeName: string;
  timeSlots: Array<{
    id: string;
    periodNumber: number;
    displayTime: string;
  }>;
  cells: Array<{
    dayOfWeek: number;
    periodNumber: number;
    isBreak: boolean;
    breakData: {
      id: string;
      name: string;
      type: string;
      icon: string;
      durationMinutes: number;
    } | null;
    entryData: {
      id: string;
      roomNumber: string;
      subject: { name: string };
      teacher: { user: { name: string } | null };
    } | null;
  }>;
  /** Break bands rendered as rows after periods (not as lesson cells). */
  breaks?: Array<{
    id: string;
    name: string;
    type: string;
    afterPeriod: number;
    durationMinutes: number;
    icon: string;
    dayOfWeek: number;
    startTime?: string;
    endTime?: string;
  }>;
}

interface MinimalBreak {
  id: string;
  name: string;
  type: string;
  afterPeriod: number;
  durationMinutes: number;
  icon?: string | null;
}

interface MinimalPeriod {
  id: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

interface MinimalEntry {
  id: string;
  periodNumber: number;
  roomName?: string | null;
  subjectName: string;
  teacherName: string;
}

interface MinimalDaySchedule {
  dayOfWeek: number;
  startTime: string;
  periods: MinimalPeriod[];
  breaks: MinimalBreak[];
  entries: MinimalEntry[];
}

export interface MinimalGradeTimetable {
  gradeLevelId: string;
  gradeLevelName: string;
  streamId?: string | null;
  streamName?: string | null;
  days: MinimalDaySchedule[];
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function to12h(time24: string): string {
  const [hoursRaw, minutesRaw] = time24.split(":").map(Number);
  const period = hoursRaw >= 12 ? "PM" : "AM";
  let hours = hoursRaw % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutesRaw.toString().padStart(2, "0")} ${period}`;
}

function displayRange(start: string, end: string): string {
  return `${to12h(start)} – ${to12h(end)}`;
}

function breaksAfter(
  breaks: MinimalBreak[],
  afterPeriod: number,
): MinimalBreak[] {
  return breaks
    .filter((b) => b.afterPeriod === afterPeriod)
    .sort((a, b) => a.durationMinutes - b.durationMinutes);
}

function buildSlotTemplate(day: MinimalDaySchedule): StudentTimetableGraphQL["timeSlots"] {
  const slots: StudentTimetableGraphQL["timeSlots"] = [];
  const sortedPeriods = [...day.periods].sort(
    (a, b) => a.periodNumber - b.periodNumber,
  );
  let gridPeriod = 1;
  let cursorMinutes = timeToMinutes(day.startTime);

  for (const br of breaksAfter(day.breaks, 0)) {
    const start = minutesToTime(cursorMinutes);
    cursorMinutes += br.durationMinutes;
    slots.push({
      id: br.id,
      periodNumber: gridPeriod,
      displayTime: displayRange(start, minutesToTime(cursorMinutes)),
    });
    gridPeriod++;
  }

  for (const period of sortedPeriods) {
    slots.push({
      id: period.id,
      periodNumber: gridPeriod,
      displayTime: displayRange(period.startTime, period.endTime),
    });
    gridPeriod++;
    cursorMinutes = timeToMinutes(period.endTime);

    for (const br of breaksAfter(day.breaks, period.periodNumber)) {
      const start = minutesToTime(cursorMinutes);
      cursorMinutes += br.durationMinutes;
      slots.push({
        id: br.id,
        periodNumber: gridPeriod,
        displayTime: displayRange(start, minutesToTime(cursorMinutes)),
      });
      gridPeriod++;
    }
  }

  return slots;
}

function buildDayCells(
  day: MinimalDaySchedule,
): StudentTimetableGraphQL["cells"] {
  const cells: StudentTimetableGraphQL["cells"] = [];
  const sortedPeriods = [...day.periods].sort(
    (a, b) => a.periodNumber - b.periodNumber,
  );
  let gridPeriod = 1;

  for (const br of breaksAfter(day.breaks, 0)) {
    cells.push({
      dayOfWeek: day.dayOfWeek,
      periodNumber: gridPeriod,
      isBreak: true,
      breakData: {
        id: br.id,
        name: br.name,
        type: br.type,
        icon: br.icon || "☕",
        durationMinutes: br.durationMinutes,
      },
      entryData: null,
    });
    gridPeriod++;
  }

  for (const period of sortedPeriods) {
    const entry = day.entries.find(
      (e) => e.periodNumber === period.periodNumber,
    );

    cells.push({
      dayOfWeek: day.dayOfWeek,
      periodNumber: gridPeriod,
      isBreak: false,
      breakData: null,
      entryData: entry
        ? {
            id: entry.id,
            roomNumber: entry.roomName || "",
            subject: { name: entry.subjectName },
            teacher: { user: { name: entry.teacherName } },
          }
        : null,
    });
    gridPeriod++;

    for (const br of breaksAfter(day.breaks, period.periodNumber)) {
      cells.push({
        dayOfWeek: day.dayOfWeek,
        periodNumber: gridPeriod,
        isBreak: true,
        breakData: {
          id: br.id,
          name: br.name,
          type: br.type,
          icon: br.icon || "☕",
          durationMinutes: br.durationMinutes,
        },
        entryData: null,
      });
      gridPeriod++;
    }
  }

  return cells;
}

export interface PickGradeTimetableOptions {
  tenantStreamId?: string | null;
  streamName?: string | null;
  /** Use the grade-wide template when no stream-specific one exists */
  fallbackToGradeWide?: boolean;
}

export function pickGradeTimetable(
  timetables: MinimalGradeTimetable[],
  gradeId: string,
  options?: PickGradeTimetableOptions | string | null,
): MinimalGradeTimetable | null {
  const opts: PickGradeTimetableOptions =
    typeof options === "string" || options === null || options === undefined
      ? { tenantStreamId: options ?? null }
      : options;

  const { tenantStreamId, streamName, fallbackToGradeWide } = opts;
  const forGrade = timetables.filter((t) => t.gradeLevelId === gradeId);
  if (forGrade.length === 0) return null;

  const wantsStream = Boolean(tenantStreamId || streamName);

  if (wantsStream) {
    if (tenantStreamId) {
      const byTenantStream = forGrade.find((t) => t.streamId === tenantStreamId);
      if (byTenantStream) return byTenantStream;
    }
    if (streamName) {
      const normalized = streamName.trim().toLowerCase();
      const byName = forGrade.find(
        (t) => t.streamName?.trim().toLowerCase() === normalized,
      );
      if (byName) return byName;
    }
    if (fallbackToGradeWide) {
      return forGrade.find((t) => !t.streamId) ?? null;
    }
    return null;
  }

  return forGrade.find((t) => !t.streamId) ?? forGrade[0];
}

interface SchoolTimetableSlot {
  type: string;
  id?: string | null;
  periodNumber?: number | null;
  startTime: string;
  endTime: string;
  name?: string | null;
  breakType?: string | null;
  afterPeriod?: number | null;
  durationMinutes?: number | null;
  icon?: string | null;
  entry?: {
    id: string;
    subject?: { name?: string | null } | null;
    teacher?: { name?: string | null } | null;
    room?: { name?: string | null } | null;
  } | null;
}

interface SchoolTimetableDay {
  dayTemplate: { dayOfWeek: number };
  slots: SchoolTimetableSlot[];
}

export interface SchoolTimetableByGrade {
  gradeLevel: { id: string; name: string; shortName?: string | null };
  stream?: { id: string; name: string } | null;
  days: SchoolTimetableDay[];
}

function normalizeTimeValue(time: string): string {
  const trimmed = time.trim();
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    const [h, m] = trimmed.split(":");
    return `${h.padStart(2, "0")}:${m}`;
  }
  return trimmed;
}

function schoolDayToMinimalDay(day: SchoolTimetableDay): MinimalDaySchedule {
  const periods: MinimalPeriod[] = [];
  const breaks: MinimalBreak[] = [];
  const entries: MinimalEntry[] = [];

  for (const slot of day.slots ?? []) {
    const slotType = slot.type?.toUpperCase() ?? "";

    if (slotType === "PERIOD") {
      const periodNumber = slot.periodNumber ?? periods.length + 1;
      periods.push({
        id: slot.id || `${day.dayTemplate.dayOfWeek}-p-${periodNumber}`,
        periodNumber,
        startTime: normalizeTimeValue(slot.startTime),
        endTime: normalizeTimeValue(slot.endTime),
      });

      if (slot.entry) {
        entries.push({
          id: slot.entry.id,
          periodNumber,
          roomName: slot.entry.room?.name ?? "",
          subjectName: slot.entry.subject?.name ?? "Unknown",
          teacherName: slot.entry.teacher?.name ?? "TBA",
        });
      }
      continue;
    }

    if (slotType === "BREAK") {
      breaks.push({
        id: slot.id || `${day.dayTemplate.dayOfWeek}-b-${breaks.length}`,
        name: slot.name || "Break",
        type: slot.breakType || "BREAK",
        afterPeriod: slot.afterPeriod ?? 0,
        durationMinutes: slot.durationMinutes ?? 0,
        icon: slot.icon ?? "☕",
      });
    }
  }

  return {
    dayOfWeek: day.dayTemplate.dayOfWeek,
    startTime: periods[0]?.startTime ?? "08:00",
    periods,
    breaks,
    entries,
  };
}

export function schoolBlocksToMinimalTimetables(
  blocks: SchoolTimetableByGrade[],
): MinimalGradeTimetable[] {
  return blocks.map((block) => ({
    gradeLevelId: block.gradeLevel.id,
    gradeLevelName:
      block.gradeLevel.shortName ||
      block.gradeLevel.name ||
      "Unknown grade",
    streamId: block.stream?.id ?? null,
    streamName: block.stream?.name ?? null,
    days: (block.days ?? [])
      .map(schoolDayToMinimalDay)
      .filter((day) => day.periods.length > 0)
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek),
  }));
}

export function hasTimetableTemplate(
  timetable: MinimalGradeTimetable | null | undefined,
): boolean {
  return Boolean(timetable?.days.some((day) => day.periods.length > 0));
}

export function minimalGradeTimetableToGraphQL(
  gradeTimetable: MinimalGradeTimetable,
): StudentTimetableGraphQL {
  const templateDay =
    gradeTimetable.days.find((d) => d.dayOfWeek === 1) ??
    [...gradeTimetable.days].sort((a, b) => a.dayOfWeek - b.dayOfWeek)[0];

  if (!templateDay) {
    return {
      gradeId: gradeTimetable.gradeLevelId,
      gradeName: gradeTimetable.gradeLevelName,
      timeSlots: [],
      cells: [],
      breaks: [],
    };
  }

  const sortedPeriods = [...templateDay.periods].sort(
    (a, b) => a.periodNumber - b.periodNumber,
  );

  const normalizedDays: MinimalDaySchedule[] = [1, 2, 3, 4, 5].map(
    (dayOfWeek) => {
      const existing = gradeTimetable.days.find((d) => d.dayOfWeek === dayOfWeek);
      if (existing) return existing;
      return {
        dayOfWeek,
        startTime: templateDay.startTime,
        periods: templateDay.periods,
        breaks: templateDay.breaks,
        entries: [],
      };
    },
  );

  const timeSlots = sortedPeriods.map((period) => ({
    id: period.id,
    periodNumber: period.periodNumber,
    displayTime: displayRange(period.startTime, period.endTime),
  }));

  const cells: StudentTimetableGraphQL["cells"] = [];

  for (const day of normalizedDays) {
    for (const period of sortedPeriods) {
      const entry = day.entries.find(
        (e) => e.periodNumber === period.periodNumber,
      );

      cells.push({
        dayOfWeek: day.dayOfWeek,
        periodNumber: period.periodNumber,
        isBreak: false,
        breakData: null,
        entryData: entry
          ? {
              id: entry.id,
              roomNumber: entry.roomName || "",
              subject: { name: entry.subjectName },
              teacher: { user: { name: entry.teacherName } },
            }
          : null,
      });
    }
  }

  const breaks: NonNullable<StudentTimetableGraphQL["breaks"]> = [];
  for (const day of normalizedDays) {
    for (const br of day.breaks) {
      let startMinutes = timeToMinutes(day.startTime);
      if (br.afterPeriod === 0) {
        const beforeFirst = breaksAfter(day.breaks, 0);
        const idx = beforeFirst.findIndex((b) => b.id === br.id);
        for (let i = 0; i < idx; i++) {
          startMinutes += beforeFirst[i].durationMinutes;
        }
      } else {
        const period = sortedPeriods.find(
          (p) => p.periodNumber === br.afterPeriod,
        );
        startMinutes = period
          ? timeToMinutes(period.endTime)
          : timeToMinutes(day.startTime);
      }
      const endMinutes = startMinutes + br.durationMinutes;

      breaks.push({
        id: `${br.id}-${day.dayOfWeek}`,
        name: br.name,
        type: br.type,
        afterPeriod: br.afterPeriod,
        durationMinutes: br.durationMinutes,
        icon: br.icon || "☕",
        dayOfWeek: day.dayOfWeek,
        startTime: minutesToTime(startMinutes),
        endTime: minutesToTime(endMinutes),
      });
    }
  }

  const gradeLabel = gradeTimetable.streamName
    ? `${gradeTimetable.gradeLevelName} · ${gradeTimetable.streamName}`
    : gradeTimetable.gradeLevelName;

  return {
    gradeId: gradeTimetable.gradeLevelId,
    gradeName: gradeLabel,
    timeSlots,
    cells,
    breaks,
  };
}
