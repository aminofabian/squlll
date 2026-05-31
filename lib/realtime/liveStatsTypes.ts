export interface TenantLiveStatsSnapshot {
  onlineTeachers: number
  onlineStudents: number
  onlineAdmins: number
  onlineParents: number
  onlineStaff: number
  onlineTotal: number
  lessonsCompletedToday: number
}

export interface PresenceUpdatedPayload {
  onlineByRole: Record<string, number>
  onlineTotal: number
}

export interface ExamPublishedPayload {
  assessmentId: string
  title: string
  gradeLevelId: string
  subjectId: string
  term: number
  academicYear: string
  type: string
}

export interface ExamResultsReleasedPayload {
  assessmentId: string
  title: string
  studentId: string
  studentUserId: string
  gradeLevelId: string
  score: number
  maxScore: number
}
