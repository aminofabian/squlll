// lib/types/timetable.ts
// NEW: Clean, normalized data structure for frontend

export interface TimeSlot {
  id: string;
  periodNumber: number;
  time: string; // "8:00 AM - 8:45 AM"
  startTime: string; // "08:00"
  endTime: string; // "08:45"
  color: string; // "border-l-primary" (for UI)
  dayOfWeek?: number; // 1-7 if tied to a day template
  label?: string; // Optional label for the period
  dayTemplateId?: string; // ID of the day template this period belongs to
}

export interface Break {
  id: string;
  name: string; // "Morning Break"
  type:
    | "short_break"
    | "long_break"
    | "lunch"
    | "afternoon_break"
    | "games"
    | "assembly"
    | "recess"
    | "snack";
  dayOfWeek: number; // 1-5 (Monday-Friday)
  afterPeriod: number; // Break comes after this period
  startTime?: string; // "10:00"
  endTime?: string; // "10:15"
  durationMinutes: number;
  icon?: string; // "☕" (optional)
  color?: string; // "bg-orange-500" (optional)
  dayTemplateId?: string | null; // ID of the day template this break belongs to
  applyToAllDays?: boolean; // Whether this break applies to all days
}

export interface Subject {
  id: string;
  name: string; // "Mathematics"
  code?: string; // "MATH101"
  color?: string; // "#3B82F6" (hex color for UI)
  department?: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Computed: "John Smith"
  email?: string;
  subjects: string[]; // Subject names they can teach
  subjectIds?: string[]; // Tenant subject assignment IDs
  gradeLevels?: string[]; // Grade level names they can teach (e.g., ["Grade 1", "Grade 2"])
  color?: string; // For UI color coding
  isActive?: boolean; // Whether the teacher is active
}

export interface GradeStream {
  tenantStreamId: string;
  /** Master Stream entity id (school config sidebar uses this). */
  streamId?: string;
  name: string;
}

export interface Grade {
  id: string;
  name: string; // "Grade 7"
  level: number; // 7 (for sorting)
  displayName?: string; // "F1" (optional display override)
  tenantGradeLevelId?: string; // Original tenant grade level ID for reference
  streams?: GradeStream[];
}

export interface TimetableEntry {
  id: string; // UUID
  gradeId: string; // Reference to Grade
  streamId?: string | null; // Tenant stream id when entry is stream-specific
  gradeName?: string; // Grade name for matching (e.g., "Grade 10")
  subjectId: string; // Reference to Subject
  teacherId: string; // Reference to Teacher
  timeSlotId: string; // Reference to TimeSlot
  periodNumber?: number; // Teaching period row (1-based), for grid matching
  dayOfWeek: number; // 1-5 (Monday-Friday)
  roomNumber?: string; // "Room 4"
  isDoublePeriod?: boolean;
  notes?: string;
}

// Full timetable data structure
export interface TimetableData {
  // Master data (loaded once, rarely changes)
  timeSlots: TimeSlot[];
  breaks: Break[];
  subjects: Subject[];
  teachers: Teacher[];
  grades: Grade[];

  // Timetable entries (the actual schedule)
  entries: TimetableEntry[];

  /** Max teaching periods per day (from templates), for grid rows when slots load partially */
  lessonPeriodsPerDay?: number;

  /** Backend-computed: ordered period numbers [1,2,3,4,5,6,7,8] */
  periodNumbers: number[];

  /** Backend-computed: number of school days per week */
  daysPerWeek: number;

  /** Backend-computed: teacher and room conflicts */
  conflicts: Conflict[];

  /** Backend-computed: known room numbers on this timetable */
  knownRoomNumbers: string[];

  /** Backend-computed: per-grade fill statistics from getSchoolTimetable */
  gradeStats?: Array<{
    gradeId: string;
    gradeName: string;
    filledSlots: number;
    totalSlots: number;
    totalLessons: number;
  }>;

  // Metadata
  lastUpdated: string;
}

// UI State (separate from data)
export interface TimetableUIState {
  selectedGradeId: string | null;
  selectedStreamId: string | null;
  selectedTermId: string | null;
  searchTerm: string;
  showConflicts: boolean;
  isSummaryMinimized: boolean;
}

// For conflict detection
export interface Conflict {
  type: "teacher_conflict" | "room_conflict";
  teacher?: {
    id: string;
    name: string;
  };
  room?: string;
  entries: Array<{
    id: string;
    grade: string;
    subject: string;
    dayOfWeek: number;
    timeSlot: string;
  }>;
}

// Request/Response types (for future API)
export interface CreateEntryRequest {
  gradeId: string;
  subjectId: string;
  teacherId: string;
  timeSlotId: string;
  dayOfWeek: number;
  roomNumber?: string;
  isDoublePeriod?: boolean;
  notes?: string;
}

export interface UpdateEntryRequest extends Partial<CreateEntryRequest> {
  id: string;
}

// Helper type for displaying full entry info
export interface EnrichedTimetableEntry extends TimetableEntry {
  subject: Subject;
  teacher: Teacher;
  timeSlot: TimeSlot;
  grade: Grade;
}
