/**
 * Unified Timetable Types
 *
 * Single source of truth for all timetable views (Student, Teacher, Admin).
 * These types are shared across the entire timetable ecosystem.
 */

// ─── Core Entities ────────────────────────────────────────────

export interface TimetableSubject {
  id: string;
  name: string;
  code?: string;
  color?: string;
}

export interface TimetableTeacher {
  id: string;
  name: string;
  initials?: string;
  avatarUrl?: string;
  subjects?: string[];
}

export interface TimetableGrade {
  id: string;
  name: string;
  displayName: string;
  level: number;
}

export interface TimetableRoom {
  id: string;
  name: string;
  building?: string;
  floor?: number;
}

// ─── Time Slot ─────────────────────────────────────────────────

export interface TimetableSlot {
  id: string;
  periodNumber: number;
  startTime: string;   // "08:00" (24h format)
  endTime: string;     // "08:45" (24h format)
  displayTime: string; // "8:00 AM – 8:45 AM"
  color?: string | null;
}

// ─── Break ─────────────────────────────────────────────────────

export type BreakType = 'RECESS' | 'LUNCH' | 'BREAK' | 'ASSEMBLY' | 'EXAM';

export interface TimetableBreak {
  id: string;
  name: string;
  type: BreakType;
  afterPeriod: number;
  durationMinutes: number;
  dayOfWeek?: number;  // 1-5, or undefined if applies to all days
  applyToAllDays?: boolean;
  icon: string;
  color?: string | null;
  startTime?: string;
  endTime?: string;
}

// ─── Lesson ────────────────────────────────────────────────────

export interface TimetableLesson {
  id: string;
  periodNumber: number;
  dayOfWeek: number;        // 1 = Monday, 5 = Friday
  subject: TimetableSubject;
  teacher: TimetableTeacher;
  room: string;
  grade: TimetableGrade;
  stream?: string;
  studentCount?: number;

  // Advanced flags for real-world scenarios
  isDoublePeriod?: boolean;
  isSubstitution?: boolean;
  originalTeacher?: string;
  isCancelled?: boolean;
  roomChanged?: boolean;
  notes?: string;
}

// ─── Cell (union of lesson, break, or empty) ───────────────────

export type TimetableCellType = 'lesson' | 'break' | 'empty';

export interface TimetableCell {
  type: TimetableCellType;
  periodNumber: number;
  dayOfWeek: number;

  // Only populated for 'lesson' type
  lesson?: TimetableLesson;

  // Only populated for 'break' type
  break?: TimetableBreak;
}

// ─── Day ───────────────────────────────────────────────────────

export interface TimetableDay {
  dayOfWeek: number;            // 1-5
  dayName: string;              // "Monday"
  shortName: string;            // "Mon"
  cells: (TimetableCell | null)[];
}

// ─── Statistics ─────────────────────────────────────────────────

export interface TimetableStats {
  totalLessons: number;
  completedLessons: number;
  upcomingLessons: number;
  totalSubjects: number;
  subjectDistribution: Record<string, number>;
  dayDistribution: Record<string, number>;
  teacherDistribution?: Record<string, number>;
  completionPercentage: number;
}

export interface AdminTimetableStats extends TimetableStats {
  totalTeachers: number;
  totalGrades: number;
  conflictCount: number;
  emptySlotCount: number;
  teacherWorkload?: Record<string, number>;
  roomUtilization?: Record<string, number>;
}

// ─── Complete Timetable ────────────────────────────────────────

export interface CompleteTimetable {
  gradeId: string;
  gradeName: string;
  termId: string;
  termName: string;
  timeSlots: TimetableSlot[];
  days: TimetableDay[];
  breaks: TimetableBreak[];
  stats: TimetableStats | AdminTimetableStats;
  lastUpdated: string;
  generatedAt?: string;
}

// ─── Current Status ────────────────────────────────────────────

export type LessonStatus = 'lesson' | 'break' | 'free' | 'weekend' | 'outside';

export interface CurrentLessonStatus {
  status: LessonStatus;
  message: string;
  lesson?: TimetableLesson;
  break?: TimetableBreak;
  remainingMinutes: number;
  progressPercent: number;  // 0-100
}

// ─── Next Lesson Info ──────────────────────────────────────────

export interface NextLessonInfo {
  lesson: TimetableLesson;
  startsInMinutes: number;
  startsInFormatted: string;   // "23m" or "2h 15m"
  time: string;                // "10:00 AM"
  period: string;              // "Period 4" or "P4"
  isNextDay: boolean;
}

// ─── Conflict ──────────────────────────────────────────────────

export interface TimetableConflict {
  type: 'TEACHER' | 'ROOM';
  entityName: string;
  entityId: string;
  dayOfWeek: number;
  periodNumbers: number[];
  lessons: TimetableLesson[];
  description: string;
}

// ─── View Types ────────────────────────────────────────────────

export type TimetableViewType = 'student' | 'teacher' | 'admin';

// ─── Filter State ──────────────────────────────────────────────

export interface TimetableFilters {
  subjectId?: string;
  teacherId?: string;
  roomId?: string;
  showConflictsOnly: boolean;
  showEmptySlots: boolean;
  searchTerm: string;
}
