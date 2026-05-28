/**
 * Timetable Utilities
 *
 * Shared helper functions used across all timetable views.
 * Centralizes time parsing, period detection, next-lesson finding,
 * and other logic previously duplicated across Student, Teacher,
 * and Admin views.
 */

import type {
  TimetableSlot,
  TimetableLesson,
  TimetableBreak,
  TimetableDay,
  CurrentLessonStatus,
  NextLessonInfo,
  LessonStatus,
} from './types';
import { BREAK_TYPE_CONFIG, DAY_NAMES, DAY_SHORT_NAMES, WEEK_DAYS } from './constants';

// ─── Time Parsing ──────────────────────────────────────────────

/**
 * Parse "HH:MM" (24h format) to total minutes from midnight.
 * Example: "08:00" → 480, "14:30" → 870
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Parse "7:30 AM – 8:15 AM" style time slot into { start, end } in minutes.
 */
export function parseDisplayTimeSlot(displayTime: string): { start: number; end: number } {
  const parts = displayTime.split(' – ');
  if (parts.length !== 2) return { start: 0, end: 0 };

  const startTime = parts[0]; // "7:30 AM"
  const endTime = parts[1];   // "8:15 AM"

  return {
    start: parseAmPmTime(startTime),
    end: parseAmPmTime(endTime),
  };
}

/**
 * Parse "7:30 AM" or "2:15 PM" style time to total minutes from midnight.
 */
export function parseAmPmTime(timeStr: string): number {
  const [time, period] = timeStr.trim().split(' ');
  const [hours, minutes] = time.split(':').map(Number);

  let totalHours = hours;
  if (period === 'PM' && hours !== 12) {
    totalHours += 12;
  } else if (period === 'AM' && hours === 12) {
    totalHours = 0;
  }

  return totalHours * 60 + minutes;
}

/**
 * Get the current time in minutes from midnight.
 */
export function getCurrentTimeInMinutes(now: Date = new Date()): number {
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Format a duration in minutes to a human-readable string.
 * Example: 23 → "23m", 135 → "2h 15m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format a Date to 12-hour time string.
 * Example: "10:30 AM"
 */
export function formatCurrentTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a Date to a full date string.
 * Example: "Wednesday, May 15, 2024"
 */
export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Period Detection ──────────────────────────────────────────

/**
 * Find the current period index based on sorted time slots.
 * Returns -1 if outside all periods, or the index into the sorted slots array.
 */
export function getCurrentPeriodIndex(
  timeSlots: TimetableSlot[],
  now: Date = new Date()
): number {
  if (!timeSlots || timeSlots.length === 0) return -1;

  const currentMinutes = getCurrentTimeInMinutes(now);
  const sorted = [...timeSlots].sort((a, b) => a.periodNumber - b.periodNumber);

  for (let i = 0; i < sorted.length; i++) {
    const slot = sorted[i];
    const start = timeToMinutes(slot.startTime);
    const end = timeToMinutes(slot.endTime);

    if (currentMinutes >= start && currentMinutes < end) {
      return i;
    }
  }

  return -1;
}

/**
 * Get the current period number.
 */
export function getCurrentPeriodNumber(
  timeSlots: TimetableSlot[],
  now: Date = new Date()
): number | null {
  const idx = getCurrentPeriodIndex(timeSlots, now);
  if (idx === -1) return null;

  const sorted = [...timeSlots].sort((a, b) => a.periodNumber - b.periodNumber);
  return sorted[idx].periodNumber;
}

/**
 * Get the current day of week (1=Monday, 5=Friday) or null if weekend.
 */
export function getCurrentDayOfWeek(now: Date = new Date()): number | null {
  const jsDay = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  if (jsDay === 0 || jsDay === 6) return null;
  return jsDay;
}

/**
 * Get the current day name or "Weekend" / "Outside".
 */
export function getCurrentDayName(now: Date = new Date()): string {
  const dayOfWeek = getCurrentDayOfWeek(now);
  if (dayOfWeek === null) return 'Weekend';
  return DAY_NAMES[dayOfWeek] || 'Unknown';
}

// ─── Current Lesson Status ─────────────────────────────────────

/**
 * Determine the current lesson status (lesson/break/free/weekend/outside).
 */
export function getCurrentLessonStatus(
  day: TimetableDay | null,
  timeSlots: TimetableSlot[],
  now: Date = new Date()
): CurrentLessonStatus {
  const dayOfWeek = getCurrentDayOfWeek(now);

  // Weekend
  if (dayOfWeek === null) {
    return {
      status: 'weekend',
      message: 'Weekend — No classes scheduled',
      remainingMinutes: 0,
      progressPercent: 0,
    };
  }

  const periodIdx = getCurrentPeriodIndex(timeSlots, now);

  // Outside school hours
  if (periodIdx === -1) {
    return {
      status: 'outside',
      message: 'Outside school hours',
      remainingMinutes: 0,
      progressPercent: 0,
    };
  }

  // No timetable data
  if (!day || !day.cells) {
    return {
      status: 'free',
      message: 'Free period',
      remainingMinutes: 0,
      progressPercent: 0,
    };
  }

  const cell = day.cells[periodIdx];
  const sortedSlots = [...timeSlots].sort((a, b) => a.periodNumber - b.periodNumber);
  const currentSlot = sortedSlots[periodIdx];

  if (!currentSlot) {
    return {
      status: 'free',
      message: 'Free period',
      remainingMinutes: 0,
      progressPercent: 0,
    };
  }

  const currentMinutes = getCurrentTimeInMinutes(now);
  const slotStart = timeToMinutes(currentSlot.startTime);
  const slotEnd = timeToMinutes(currentSlot.endTime);
  const remainingMinutes = Math.max(0, slotEnd - currentMinutes);
  const totalDuration = slotEnd - slotStart;
  const progressPercent = totalDuration > 0
    ? Math.round(((currentMinutes - slotStart) / totalDuration) * 100)
    : 0;

  // Break cell
  if (cell?.type === 'break' && cell.break) {
    const breakConfig = BREAK_TYPE_CONFIG[cell.break.type] || BREAK_TYPE_CONFIG.BREAK;
    return {
      status: 'break',
      message: `${breakConfig.icon} ${cell.break.name}`,
      break: cell.break,
      remainingMinutes,
      progressPercent,
    };
  }

  // Lesson cell
  if (cell?.type === 'lesson' && cell.lesson) {
    return {
      status: 'lesson',
      message: `${cell.lesson.subject.name} — ${cell.lesson.teacher.name}`,
      lesson: cell.lesson,
      remainingMinutes,
      progressPercent,
    };
  }

  // Empty cell
  return {
    status: 'free',
    message: 'Free period',
    remainingMinutes,
    progressPercent,
  };
}

// ─── Next Lesson ───────────────────────────────────────────────

/**
 * Find the next non-break lesson across days.
 * Returns null if no upcoming lessons this week.
 */
export function getNextLesson(
  days: TimetableDay[],
  timeSlots: TimetableSlot[],
  now: Date = new Date()
): NextLessonInfo | null {
  const currentDayOfWeek = getCurrentDayOfWeek(now);
  const currentPeriodIdx = getCurrentPeriodIndex(timeSlots, now);
  const currentMinutes = getCurrentTimeInMinutes(now);

  if (currentDayOfWeek === null || currentPeriodIdx === -1) {
    // Try finding the first lesson of the current/next day
    return findFirstLessonInWeek(days, timeSlots, currentDayOfWeek ?? 1, 0, currentMinutes);
  }

  const sortedSlots = [...timeSlots].sort((a, b) => a.periodNumber - b.periodNumber);

  // Search remaining periods today
  const todayDay = days.find(d => d.dayOfWeek === currentDayOfWeek);
  if (todayDay) {
    for (let i = currentPeriodIdx + 1; i < todayDay.cells.length; i++) {
      const cell = todayDay.cells[i];
      if (cell?.type === 'lesson' && cell.lesson) {
        const slot = sortedSlots[i];
        if (!slot) continue;
        const slotStart = timeToMinutes(slot.startTime);
        const minutesUntil = slotStart - currentMinutes;
        return buildNextLessonInfo(cell.lesson, slot, minutesUntil, false);
      }
    }
  }

  // Search next days
  for (let d = currentDayOfWeek + 1; d <= 5; d++) {
    const nextDay = days.find(day => day.dayOfWeek === d);
    if (!nextDay) continue;

    const result = findFirstLessonInWeek(
      days, timeSlots, d,
      (24 * 60 - currentMinutes) + (d - currentDayOfWeek) * 24 * 60,
      currentMinutes
    );
    if (result) return result;
  }

  return null;
}

function findFirstLessonInWeek(
  days: TimetableDay[],
  timeSlots: TimetableSlot[],
  startDayOfWeek: number,
  baseOffset: number,
  currentMinutes: number
): NextLessonInfo | null {
  const sortedSlots = [...timeSlots].sort((a, b) => a.periodNumber - b.periodNumber);

  for (let d = startDayOfWeek; d <= 5; d++) {
    const day = days.find(dd => dd.dayOfWeek === d);
    if (!day) continue;

    for (let i = 0; i < day.cells.length; i++) {
      const cell = day.cells[i];
      if (cell?.type === 'lesson' && cell.lesson) {
        const slot = sortedSlots[i];
        if (!slot) continue;
        const slotStart = timeToMinutes(slot.startTime);
        const dayOffset = (d - startDayOfWeek) * 24 * 60;
        const minutesUntil = baseOffset + dayOffset + slotStart;
        return buildNextLessonInfo(cell.lesson, slot, minutesUntil, d !== startDayOfWeek);
      }
    }
  }

  return null;
}

function buildNextLessonInfo(
  lesson: TimetableLesson,
  slot: TimetableSlot,
  minutesUntil: number,
  isNextDay: boolean
): NextLessonInfo {
  return {
    lesson,
    startsInMinutes: Math.max(0, minutesUntil),
    startsInFormatted: formatDuration(Math.max(0, minutesUntil)),
    time: slot.displayTime,
    period: `Period ${slot.periodNumber}`,
    isNextDay,
  };
}

// ─── Lesson Styling ────────────────────────────────────────────

export interface LessonStyleClasses {
  container: string;
  isCurrent: boolean;
  isCompleted: boolean;
  isBreak: boolean;
  isNext: boolean;
}

/**
 * Get consistent CSS classes for a lesson cell based on its state.
 */
export function getLessonCellStyles(
  cellType: 'lesson' | 'break' | 'empty',
  isCurrentLesson: boolean,
  isCompleted: boolean,
  isNextLesson: boolean,
  breakType?: string
): LessonStyleClasses {
  const result: LessonStyleClasses = {
    container: '',
    isCurrent: isCurrentLesson,
    isCompleted,
    isBreak: cellType === 'break',
    isNext: isNextLesson,
  };

  if (cellType === 'break') {
    const config = breakType ? BREAK_TYPE_CONFIG[breakType as keyof typeof BREAK_TYPE_CONFIG] : null;
    if (config) {
      result.container = `${config.bgClass} ${config.borderClass} border-2 shadow-sm`;
    } else {
      result.container = 'bg-gray-50 border-2 border-gray-200 text-gray-700 shadow-sm';
    }
  } else if (isCurrentLesson) {
    result.container = 'bg-primary text-white shadow-lg border-2 border-primary ring-2 ring-primary/20 scale-[1.02]';
  } else if (isCompleted) {
    result.container = 'bg-gray-100 border-2 border-gray-200 text-gray-600 opacity-75';
  } else if (isNextLesson) {
    result.container = 'bg-white border-2 border-primary/40 shadow-md';
  } else {
    result.container = 'bg-white border border-gray-200 hover:border-primary/30 hover:shadow-sm';
  }

  return result;
}

// ─── Timetable Transformers ────────────────────────────────────

/**
 * Build a full TimetableDay from a list of cells and time slots.
 */
export function buildTimetableDay(
  dayOfWeek: number,
  cells: (TimetableLesson | TimetableBreak | null)[],
  timeSlots: TimetableSlot[]
): TimetableDay {
  return {
    dayOfWeek,
    dayName: DAY_NAMES[dayOfWeek] || `Day ${dayOfWeek}`,
    shortName: DAY_SHORT_NAMES[dayOfWeek] || `D${dayOfWeek}`,
    cells: cells.map((c, i) => {
      if (!c) return null;
      if ('type' in c) {
        // Already a TimetableBreak
        return {
          type: 'break' as const,
          periodNumber: timeSlots[i]?.periodNumber ?? i + 1,
          dayOfWeek,
          break: c as TimetableBreak,
        };
      }
      // TimetableLesson
      return {
        type: 'lesson' as const,
        periodNumber: timeSlots[i]?.periodNumber ?? i + 1,
        dayOfWeek,
        lesson: c as TimetableLesson,
      };
    }),
  };
}

/**
 * Get the JavaScript day-of-week string from a day index.
 */
export function getJsDayString(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek]?.toUpperCase() || 'UNKNOWN';
}

/**
 * Check if two lessons have a scheduling conflict.
 */
export function hasLessonConflict(a: TimetableLesson, b: TimetableLesson): boolean {
  return (
    a.dayOfWeek === b.dayOfWeek &&
    a.periodNumber === b.periodNumber &&
    a.teacher.id === b.teacher.id &&
    a.id !== b.id
  );
}

/**
 * Check if two lessons have a room conflict.
 */
export function hasRoomConflict(a: TimetableLesson, b: TimetableLesson): boolean {
  return (
    a.dayOfWeek === b.dayOfWeek &&
    a.periodNumber === b.periodNumber &&
    a.room === b.room &&
    a.room !== '' &&
    a.id !== b.id
  );
}
