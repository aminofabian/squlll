import { describe, expect, it } from "vitest";
import type {
  CurrentLessonStatus,
  TimetableBreak,
  TimetableDay,
  TimetableLesson,
  TimetableSlot,
} from "@/lib/timetable/types";
import { buildTeacherWeekRows } from "./buildTeacherWeekRows";
import { countLessonsPerDay } from "./countLessonsPerDay";
import { getWeekDayDates } from "./getWeekDayDates";
import { formatWeekRangeLabel } from "./formatWeekRangeLabel";
import { summarizeTeachingWeek } from "./summarizeTeachingWeek";
import { getGreeting } from "./getGreeting";
import { formatStartsIn } from "./formatStartsIn";
import { getLessonCardState } from "./getLessonCardState";
import { describeLiveStatus } from "./describeLiveStatus";

const WEEKDAYS = [1, 2, 3, 4, 5] as const;

function slot(periodNumber: number, startTime: string, endTime: string): TimetableSlot {
  return {
    id: `slot-${periodNumber}`,
    periodNumber,
    startTime,
    endTime,
    displayTime: `${startTime} – ${endTime}`,
  };
}

function lesson(overrides: Partial<TimetableLesson> = {}): TimetableLesson {
  return {
    id: "lesson-1",
    periodNumber: 1,
    dayOfWeek: 1,
    subject: { id: "math", name: "Mathematics" },
    teacher: { id: "t1", name: "Jane Doe" } as TimetableLesson["teacher"],
    room: "4B",
    grade: { id: "g7", name: "Grade 7", displayName: "Grade 7", level: 7 },
    ...overrides,
  };
}

function day(dayOfWeek: number, lessons: (TimetableLesson | null)[]): TimetableDay {
  return {
    dayOfWeek,
    dayName: "Monday",
    shortName: "Mon",
    cells: lessons.map((item, index) =>
      item
        ? { type: "lesson", periodNumber: index + 1, dayOfWeek, lesson: item }
        : null,
    ),
  };
}

function breakAfter(afterPeriod: number, extra: Partial<TimetableBreak> = {}): TimetableBreak {
  return {
    id: `break-${afterPeriod}`,
    name: "Short break",
    type: "BREAK",
    afterPeriod,
    durationMinutes: 20,
    icon: "",
    ...extra,
  };
}

const SLOTS = [slot(1, "08:00", "08:40"), slot(2, "08:40", "09:20"), slot(3, "09:20", "10:00")];

describe("buildTeacherWeekRows", () => {
  it("merges an unbroken double period into one two-row cell", () => {
    const first = lesson({ isDoublePeriod: true });
    const second = lesson({ isDoublePeriod: true, isDoubleContinuation: true });
    const rows = buildTeacherWeekRows({
      days: [day(1, [first, second, null])],
      timeSlots: SLOTS,
      breaks: [],
      dayNumbers: [1],
    });

    expect(rows[0]).toMatchObject({ kind: "period", cells: [{ kind: "lesson", rowSpan: 2 }] });
    expect(rows[1]).toMatchObject({ kind: "period", cells: [{ kind: "covered" }] });
    expect(rows[2]).toMatchObject({ kind: "period", cells: [{ kind: "free" }] });
  });

  it("keeps a double period split when a break falls between its halves", () => {
    const first = lesson({ isDoublePeriod: true });
    const second = lesson({ isDoublePeriod: true, isDoubleContinuation: true });
    const rows = buildTeacherWeekRows({
      days: [day(1, [first, second, null])],
      timeSlots: SLOTS,
      breaks: [breakAfter(1, { dayOfWeek: 1 })],
      dayNumbers: [1],
    });

    expect(rows.map((row) => row.kind)).toEqual(["period", "break", "period", "period"]);
    expect(rows[0]).toMatchObject({ cells: [{ kind: "lesson", rowSpan: 1 }] });
    expect(rows[2]).toMatchObject({ cells: [{ kind: "lesson", rowSpan: 1 }] });
  });

  it("marks a break row uniform only when every day shares the same break", () => {
    const allDays = buildTeacherWeekRows({
      days: [],
      timeSlots: SLOTS,
      breaks: [breakAfter(2)],
      dayNumbers: WEEKDAYS,
    });
    const mondayOnly = buildTeacherWeekRows({
      days: [],
      timeSlots: SLOTS,
      breaks: [breakAfter(2, { dayOfWeek: 1 })],
      dayNumbers: WEEKDAYS,
    });

    expect(allDays[2]).toMatchObject({ kind: "break", isUniform: true });
    expect(mondayOnly[2]).toMatchObject({ kind: "break", isUniform: false });
  });

  it("places breaks scheduled before the first period at the top", () => {
    const rows = buildTeacherWeekRows({
      days: [],
      timeSlots: SLOTS,
      breaks: [breakAfter(0, { type: "ASSEMBLY", name: "Assembly" })],
      dayNumbers: WEEKDAYS,
    });
    expect(rows[0]).toMatchObject({ kind: "break", afterPeriod: 0 });
  });
});

describe("countLessonsPerDay", () => {
  it("counts a merged double period as one lesson", () => {
    const first = lesson({ isDoublePeriod: true });
    const second = lesson({ isDoublePeriod: true, isDoubleContinuation: true });
    const rows = buildTeacherWeekRows({
      days: [day(1, [first, second, lesson({ id: "l9" })]), day(2, [null, null, null])],
      timeSlots: SLOTS,
      breaks: [],
      dayNumbers: [1, 2],
    });
    expect(countLessonsPerDay(rows, [1, 2])).toEqual({ 1: 2, 2: 0 });
  });
});

describe("week dates", () => {
  it("resolves weekday dates from the Monday of the week", () => {
    const dates = getWeekDayDates("2026-10-19", WEEKDAYS);
    expect(dates.map((d) => d.dayOfMonth)).toEqual([19, 20, 21, 22, 23]);
    expect(formatWeekRangeLabel(dates)).toBe("19 – 23 Oct");
  });

  it("labels weeks that cross a month boundary with both months", () => {
    const dates = getWeekDayDates("2026-09-28", WEEKDAYS);
    expect(formatWeekRangeLabel(dates)).toBe("28 Sep – 2 Oct");
  });
});

describe("summarizeTeachingWeek", () => {
  it("adds up contact time and counts distinct classes", () => {
    const other = lesson({ id: "l2", grade: { id: "g8", name: "Grade 8", displayName: "Grade 8", level: 8 } });
    const summary = summarizeTeachingWeek(
      [day(1, [lesson(), lesson({ id: "l3" }), other])],
      SLOTS,
    );
    expect(summary.teachingMinutes).toBe(120);
    expect(summary.teachingTimeLabel).toBe("2h");
    expect(summary.distinctClasses).toBe(2);
  });

  it("formats partial hours", () => {
    const summary = summarizeTeachingWeek([day(1, [lesson()])], SLOTS);
    expect(summary.teachingTimeLabel).toBe("40m");
  });
});

describe("getGreeting", () => {
  it("greets by part of day and first name", () => {
    expect(getGreeting(8, "Jane Wanjiru Doe")).toBe("Good morning, Jane");
    expect(getGreeting(14, "Jane")).toBe("Good afternoon, Jane");
    expect(getGreeting(19)).toBe("Good evening");
  });
});

describe("formatStartsIn", () => {
  it("picks the two most useful units", () => {
    expect(formatStartsIn(2 * 86_400 + 4 * 3600)).toBe("2d 4h");
    expect(formatStartsIn(3600 + 5 * 60)).toBe("1h 05m");
    expect(formatStartsIn(12 * 60 + 8)).toBe("12m 08s");
  });
});

describe("getLessonCardState", () => {
  const none = { isCancelled: false, isCurrent: false, isCompleted: false, isNext: false };

  it("prioritises cancelled, then current, completed, next", () => {
    expect(getLessonCardState({ ...none, isCancelled: true, isCurrent: true })).toBe("cancelled");
    expect(getLessonCardState({ ...none, isCurrent: true, isCompleted: true })).toBe("current");
    expect(getLessonCardState({ ...none, isCompleted: true, isNext: true })).toBe("completed");
    expect(getLessonCardState({ ...none, isNext: true })).toBe("next");
    expect(getLessonCardState(none)).toBe("scheduled");
  });
});

describe("describeLiveStatus", () => {
  const base: CurrentLessonStatus = {
    status: "lesson",
    message: "",
    remainingMinutes: 12,
    progressPercent: 70,
  };

  it("describes a live lesson with class, room and time left", () => {
    const result = describeLiveStatus({ ...base, lesson: lesson() });
    expect(result).toMatchObject({
      eyebrow: "Teaching now",
      headline: "Mathematics",
      detail: "Grade 7 · Room 4B · 12 min left",
      tone: "live",
      showProgress: true,
    });
  });

  it("hides progress outside school hours", () => {
    const result = describeLiveStatus({ ...base, status: "outside", message: "See you tomorrow" });
    expect(result).toMatchObject({ showProgress: false, detail: "See you tomorrow" });
  });
});
