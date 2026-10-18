import { describe, expect, it } from "vitest";
import type {
  CurrentLessonStatus,
  TimetableBreak,
  TimetableDay,
  TimetableLesson,
  TimetableSlot,
} from "@/lib/timetable/types";
import { buildWeekRows } from "./buildWeekRows";
import { countPeriodsPerDay } from "./countPeriodsPerDay";
import { getWeekDayDates } from "./getWeekDayDates";
import { formatWeekRangeLabel } from "./formatWeekRangeLabel";
import { summarizeWeekSchedule } from "./summarizeWeekSchedule";
import { getGreeting } from "./getGreeting";
import { formatStartsIn } from "./formatStartsIn";
import { getLessonCardState } from "./getLessonCardState";
import { describeLiveStatus } from "./describeLiveStatus";
import { getClassIdentity } from "./getClassIdentity";
import { buildLessonGroups } from "./buildLessonGroups";
import { getDisplayWeek } from "./getDisplayWeek";
import { findBusiestDay } from "./findBusiestDay";
import { formatTimeRange } from "./formatTimeRange";
import { describeUpNext } from "./describeUpNext";
import { buildDayAgenda } from "./buildDayAgenda";
import { resolveLessonState } from "./resolveLessonState";
import { buildHeroMetrics } from "./buildHeroMetrics";
import { isSchoolOpen } from "./isSchoolOpen";
import { describeLessonCard } from "./describeLessonCard";
import { describeNextLessonStart } from "./describeNextLessonStart";

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

describe("buildWeekRows", () => {
  it("merges an unbroken double period into one two-row cell", () => {
    const first = lesson({ isDoublePeriod: true });
    const second = lesson({ isDoublePeriod: true, isDoubleContinuation: true });
    const rows = buildWeekRows({
      days: [day(1, [first, second, null])],
      timeSlots: SLOTS,
      breaks: [],
      dayNumbers: [1],
    });

    expect(rows[0]).toMatchObject({ kind: "period", cells: [{ kind: "lesson", rowSpan: 2 }] });
    expect(rows[1]).toMatchObject({ kind: "period", cells: [{ kind: "covered" }] });
    expect(rows[2]).toMatchObject({ kind: "period", cells: [{ kind: "free" }], isEmpty: true });
    expect(rows[0]).toMatchObject({ isEmpty: false });
  });

  it("keeps a double period split when a break falls between its halves", () => {
    const first = lesson({ isDoublePeriod: true });
    const second = lesson({ isDoublePeriod: true, isDoubleContinuation: true });
    const rows = buildWeekRows({
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
    const allDays = buildWeekRows({
      days: [],
      timeSlots: SLOTS,
      breaks: [breakAfter(2)],
      dayNumbers: WEEKDAYS,
    });
    const mondayOnly = buildWeekRows({
      days: [],
      timeSlots: SLOTS,
      breaks: [breakAfter(2, { dayOfWeek: 1 })],
      dayNumbers: WEEKDAYS,
    });

    expect(allDays[2]).toMatchObject({ kind: "break", isUniform: true });
    expect(mondayOnly[2]).toMatchObject({ kind: "break", isUniform: false });
  });

  it("places breaks scheduled before the first period at the top", () => {
    const rows = buildWeekRows({
      days: [],
      timeSlots: SLOTS,
      breaks: [breakAfter(0, { type: "ASSEMBLY", name: "Assembly" })],
      dayNumbers: WEEKDAYS,
    });
    expect(rows[0]).toMatchObject({ kind: "break", afterPeriod: 0 });
  });
});

describe("countPeriodsPerDay", () => {
  it("counts a merged double period as two periods", () => {
    const first = lesson({ isDoublePeriod: true });
    const second = lesson({ isDoublePeriod: true, isDoubleContinuation: true });
    const rows = buildWeekRows({
      days: [day(1, [first, second, lesson({ id: "l9" })]), day(2, [null, null, null])],
      timeSlots: SLOTS,
      breaks: [],
      dayNumbers: [1, 2],
    });
    expect(countPeriodsPerDay(rows, [1, 2])).toEqual({ 1: 3, 2: 0 });
  });
});

describe("findBusiestDay", () => {
  it("names a single leader and ignores ties or empty weeks", () => {
    expect(findBusiestDay({ 1: 3, 2: 6, 3: 3 })).toBe(2);
    expect(findBusiestDay({ 1: 3, 2: 3 })).toBeNull();
    expect(findBusiestDay({ 1: 0, 2: 0 })).toBeNull();
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

describe("summarizeWeekSchedule", () => {
  it("adds up contact time and counts distinct classes", () => {
    const other = lesson({ id: "l2", grade: { id: "g8", name: "Grade 8", displayName: "Grade 8", level: 8 } });
    const summary = summarizeWeekSchedule(
      [day(1, [lesson(), lesson({ id: "l3" }), other])],
      SLOTS,
    );
    expect(summary.contactMinutes).toBe(120);
    expect(summary.contactTimeLabel).toBe("2h");
    expect(summary.distinctClasses).toBe(2);
  });

  it("formats partial hours", () => {
    const summary = summarizeWeekSchedule([day(1, [lesson()])], SLOTS);
    expect(summary.contactTimeLabel).toBe("40m");
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
    const result = describeLiveStatus({ ...base, lesson: lesson() }, "teacher");
    expect(result).toMatchObject({
      eyebrow: "Teaching now",
      headline: "Mathematics",
      detail: "Grade 7 · Room 4B · 12 min left",
      tone: "live",
      showProgress: true,
    });
  });

  it("names the class without repeating its stream", () => {
    const grade = { id: "g10", name: "Grade 10", displayName: "Grade 10 · A", level: 10 };
    const result = describeLiveStatus({ ...base, lesson: lesson({ grade, stream: "A" }) }, "teacher");
    expect(result.detail).toBe("Grade 10A · Room 4B · 12 min left");
  });

  it("shows the teacher's name to students", () => {
    const result = describeLiveStatus({ ...base, lesson: lesson() }, "student");
    expect(result).toMatchObject({
      eyebrow: "In class now",
      detail: "Jane Doe · Room 4B · 12 min left",
    });
  });

  it("hides progress outside school hours", () => {
    const result = describeLiveStatus({ ...base, status: "outside", message: "See you tomorrow" }, "teacher");
    expect(result).toMatchObject({ showProgress: false, detail: "See you tomorrow" });
  });
});

describe("getClassIdentity", () => {
  const grade10 = { id: "g10", name: "Grade 10", displayName: "Grade 10 · A", level: 10 };

  it("names a class without repeating its stream", () => {
    expect(getClassIdentity(lesson({ grade: grade10, stream: "A" }))).toMatchObject({
      fullLabel: "Grade 10A",
      shortLabel: "10A",
      badge: "A",
    });
  });

  it("strips a stream already baked into the grade name", () => {
    const baked = { ...grade10, name: "Grade 10 · A" };
    expect(getClassIdentity(lesson({ grade: baked, stream: "A" })).fullLabel).toBe("Grade 10A");
  });

  it("spaces out long stream names and copes without a stream", () => {
    expect(getClassIdentity(lesson({ stream: "East" }))).toMatchObject({ fullLabel: "Grade 7 East", shortLabel: "7 East", badge: "E" });
    expect(getClassIdentity(lesson({ stream: undefined }))).toMatchObject({ fullLabel: "Grade 7", shortLabel: "7", badge: "7" });
  });
});

describe("buildLessonGroups", () => {
  const classB = { id: "g7", name: "Grade 7", displayName: "Grade 7", level: 7 };
  const oneSubjectTwoClasses = [
    day(1, [lesson({ id: "a", stream: "A" }), lesson({ id: "b", grade: classB, stream: "B" }), lesson({ id: "c", stream: "A" })]),
  ];

  it("groups a single-subject teacher by class with totals and distinct colours", () => {
    const { mode, groups } = buildLessonGroups(oneSubjectTwoClasses, SLOTS, "teacher");
    expect(mode).toBe("class");
    expect(groups.map((g) => [g.label, g.periods, g.minutes])).toEqual([
      ["Grade 7A", 2, 80],
      ["Grade 7B", 1, 40],
    ]);
    expect(groups[0].accent).not.toBe(groups[1].accent);
  });

  it("always groups by subject for students", () => {
    const { mode, groups } = buildLessonGroups(oneSubjectTwoClasses, SLOTS, "student");
    expect(mode).toBe("subject");
    expect(groups).toHaveLength(1);
  });
});

describe("describeLessonCard", () => {
  const item = lesson({ stream: "A" });
  const classGroups = buildLessonGroups([day(1, [item, lesson({ id: "b", stream: "B" })])], SLOTS, "teacher");

  it("leads with the short class name when grouped by class", () => {
    expect(describeLessonCard(item, "teacher", "class", classGroups.groupFor(item))).toEqual({ title: "7A", detail: "Mathematics" });
  });

  it("leads with the subject otherwise", () => {
    const group = classGroups.groupFor(item);
    expect(describeLessonCard(item, "teacher", "subject", group)).toEqual({ title: "Mathematics", detail: "7A" });
    expect(describeLessonCard(item, "student", "subject", group)).toEqual({ title: "Mathematics", detail: "Jane Doe" });
  });
});

describe("getDisplayWeek", () => {
  it("shows the current week on weekdays with today highlighted", () => {
    expect(getDisplayWeek("2026-10-21")).toEqual({
      weekStartYmd: "2026-10-19", focusDayOfWeek: 3, focusLabel: "Today", isUpcomingWeek: false,
    });
  });

  it("previews the coming week at the weekend", () => {
    expect(getDisplayWeek("2026-10-18")).toMatchObject({ weekStartYmd: "2026-10-19", focusDayOfWeek: 1, focusLabel: "Tomorrow", isUpcomingWeek: true });
    expect(getDisplayWeek("2026-10-17")).toMatchObject({ weekStartYmd: "2026-10-19", focusLabel: "Up next" });
  });
});

describe("formatTimeRange", () => {
  it("drops leading zeros", () => {
    expect(formatTimeRange("08:00", "08:40")).toBe("8:00–8:40");
    expect(formatTimeRange("11:25", "12:05", " – ")).toBe("11:25 – 12:05");
  });
});

describe("describeUpNext", () => {
  it("reads the time from the slot and builds a date line", () => {
    const next = {
      lesson: lesson({ periodNumber: 2 }),
      startsAt: "2026-10-19T05:40:00.000Z",
      startsInMinutes: 0,
      startsInFormatted: "",
      time: "8:40 AM – 9:20 AM",
      period: "Period 2",
      isNextDay: true,
      dayLabel: "Tomorrow",
    };
    expect(describeUpNext(next, SLOTS)).toEqual({ timeRange: "8:40 – 9:20", detail: "Mon 19 Oct · Period 2 · 40 min" });
  });
});

describe("describeNextLessonStart", () => {
  it("counts down when the lesson is later today", () => {
    expect(describeNextLessonStart(18 * 60 + 5, "10:20 – 11:00", null)).toEqual({
      caption: "Starts in", value: "18m 05s", isCountdown: true,
    });
  });

  it("names the day once the lesson is on another day", () => {
    expect(describeNextLessonStart(86_400, "11:25 – 12:05", "Tomorrow")).toEqual({
      caption: "Starts", value: "Tomorrow, 11:25", isCountdown: false,
    });
  });
});

describe("buildDayAgenda", () => {
  const FOUR_SLOTS = [...SLOTS, slot(4, "10:20", "11:00")];

  it("collapses free runs and keeps breaks and double periods in order", () => {
    const first = lesson({ id: "d", isDoublePeriod: true });
    const second = lesson({ id: "d", isDoublePeriod: true, isDoubleContinuation: true });
    const rows = buildWeekRows({
      days: [day(1, [null, null, first, second])],
      timeSlots: FOUR_SLOTS,
      breaks: [breakAfter(1)],
      dayNumbers: [1],
    });
    const agenda = buildDayAgenda(rows, 0);
    expect(agenda.map((item) => item.kind)).toEqual(["free", "break", "free", "lesson"]);
    expect(agenda[3]).toMatchObject({ rowSpan: 2, startTime: "09:20", endTime: "11:00" });
  });

  it("merges consecutive free periods into one stretch", () => {
    const rows = buildWeekRows({ days: [day(1, [null, null, lesson()])], timeSlots: SLOTS, breaks: [], dayNumbers: [1] });
    expect(buildDayAgenda(rows, 0)[0]).toMatchObject({ kind: "free", startTime: "08:00", endTime: "09:20", periodCount: 2 });
  });
});

describe("resolveLessonState", () => {
  const context = { isUpcomingWeek: false, currentDayOfWeek: 1, currentPeriodIndex: 1, completedLessonIds: ["done"], nextLesson: { id: "n", dayOfWeek: 2 } };

  it("marks a double period current while either half is running", () => {
    expect(resolveLessonState({ lesson: lesson(), dayOfWeek: 1, slotIndex: 0, rowSpan: 2 }, context)).toBe("current");
  });

  it("ignores live and completed state when previewing next week", () => {
    const upcoming = { ...context, isUpcomingWeek: true };
    expect(resolveLessonState({ lesson: lesson({ id: "done" }), dayOfWeek: 1, slotIndex: 1, rowSpan: 1 }, upcoming)).toBe("scheduled");
    expect(resolveLessonState({ lesson: lesson({ id: "n" }), dayOfWeek: 2, slotIndex: 0, rowSpan: 1 }, upcoming)).toBe("next");
  });
});

describe("buildHeroMetrics", () => {
  it("shows classes to teachers and subjects to students", () => {
    const summary = { contactMinutes: 720, contactTimeLabel: "12h", distinctClasses: 3 };
    expect(buildHeroMetrics("teacher", undefined, summary).map((m) => m.label)).toEqual(["Periods", "Contact time", "Classes"]);
    expect(buildHeroMetrics("student", undefined, null)).toEqual([
      { label: "Periods", value: "0" },
      { label: "In class", value: "—" },
      { label: "Subjects", value: "0" },
    ]);
  });
});

describe("isSchoolOpen", () => {
  it("is closed at weekends and outside hours only", () => {
    const status = (value: CurrentLessonStatus["status"]): CurrentLessonStatus => ({ status: value, message: "", remainingMinutes: 0, progressPercent: 0 });
    expect(isSchoolOpen(status("lesson"))).toBe(true);
    expect(isSchoolOpen(status("free"))).toBe(true);
    expect(isSchoolOpen(status("weekend"))).toBe(false);
    expect(isSchoolOpen(status("outside"))).toBe(false);
  });
});
