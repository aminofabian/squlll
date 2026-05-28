/**
 * Timetable Library
 *
 * Barrel export for all shared timetable types, utilities, constants, and hooks.
 * Import from '@lib/timetable' to get everything you need for any timetable view.
 */

// Types
export type {
  // Core entities
  TimetableSubject,
  TimetableTeacher,
  TimetableGrade,
  TimetableRoom,
  // Time
  TimetableSlot,
  // Breaks
  TimetableBreak,
  BreakType,
  // Lessons
  TimetableLesson,
  // Cells
  TimetableCell,
  TimetableCellType,
  // Days
  TimetableDay,
  // Stats
  TimetableStats,
  AdminTimetableStats,
  // Complete
  CompleteTimetable,
  // Status
  LessonStatus,
  CurrentLessonStatus,
  NextLessonInfo,
  // Conflicts
  TimetableConflict,
  // View config
  TimetableViewType,
  TimetableFilters,
} from "./types";

// Constants
export {
  WEEK_DAYS,
  WEEK_DAYS_FULL,
  DAY_NAMES,
  DAY_SHORT_NAMES,
  BREAK_TYPE_CONFIG,
  SUBJECT_COLOR_PALETTE,
  STATUS_COLORS,
  DEFAULT_PERIOD_DURATION,
  DEFAULT_BREAK_DURATION,
  CURRENT_TIME_REFRESH_MS,
  MIN_CELL_HEIGHT,
  TIME_COLUMN_WIDTH,
  MOBILE_BREAKPOINT,
  jsDayToDayOfWeek,
  dayOfWeekToJsDay,
  getSubjectPaletteColor,
} from "./constants";
export type { WeekDay } from "./constants";

// Utilities
export {
  timeToMinutes,
  parseDisplayTimeSlot,
  parseAmPmTime,
  getCurrentTimeInMinutes,
  formatDuration,
  formatCurrentTime,
  formatFullDate,
  getCurrentPeriodIndex,
  getCurrentPeriodNumber,
  getCurrentDayOfWeek,
  getCurrentDayName,
  getCurrentLessonStatus,
  getNextLesson,
  getLessonCellStyles,
  buildTimetableDay,
  getJsDayString,
  hasLessonConflict,
  hasRoomConflict,
} from "./utils";
export type { LessonStyleClasses } from "./utils";

// Hooks
export { useTimetableCore } from "./useTimetableCore";

// Transformers
export {
  transformStudentTimetable,
  transformTeacherTimetable,
} from "./transformers";
