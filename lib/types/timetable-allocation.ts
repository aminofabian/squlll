export interface TeacherLessonAllocation {
  id: string;
  termId: string;
  teacherId: string;
  subjectId: string;
  gradeLevelId: string;
  streamId?: string | null;
  lessonsPerWeek: number;
  preferredDoubleLessons?: number | null;
}

export interface UnavailableSlot {
  dayOfWeek: number;
  periodNumber: number;
}

export type PreferredTimeOfDay = "ANY" | "MORNING" | "EVENING";

export interface TeacherWorkloadRules {
  id: string;
  termId: string;
  teacherId: string;
  totalLessonsPerWeek?: number | null;
  maxLessonsPerDay?: number | null;
  minLessonsPerDay?: number | null;
  doubleLessonsPerWeek?: number | null;
  maxConsecutiveLessons?: number | null;
  minFreePeriodsPerDay?: number | null;
  preferredDays?: number[] | null;
  avoidDays?: number[] | null;
  preferredPeriodNumbers?: number[] | null;
  avoidPeriodNumbers?: number[] | null;
  preferredTimeOfDay?: PreferredTimeOfDay | null;
  unavailableSlots?: UnavailableSlot[] | null;
}

export interface TimetablePreflightIssue {
  code: string;
  severity: "error" | "warning" | string;
  message: string;
  teacherId?: string;
  gradeLevelId?: string;
}

export interface TimetablePreflightResult {
  ok: boolean;
  totalAllocatedLessons: number;
  totalAvailableSlots: number;
  issues: TimetablePreflightIssue[];
}

export interface GenerateTimetableResult {
  createdCount: number;
  unresolvedCount: number;
  warnings: string[];
  entries?: Array<{
    id: string;
    subjectId: string;
    teacherId: string;
    dayTemplatePeriodId: string;
    streamId?: string | null;
    gradeLevelId?: string;
    isDoublePeriod?: boolean;
    termId?: string;
  }>;
}

export type TimetableCreationMode = "manual" | "automatic" | null;

export interface AllocationQuotaIssue {
  type: "under" | "over";
  teacherId: string;
  subjectId: string;
  gradeLevelId: string;
  streamId?: string | null;
  required: number;
  placed: number;
  message: string;
}

export interface WorkloadRuleBreach {
  teacherId: string;
  code: string;
  message: string;
}
