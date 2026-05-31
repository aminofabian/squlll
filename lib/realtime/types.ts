export interface RealtimeEnvelope<T = Record<string, unknown>> {
  event: string
  tenantId: string
  payload: T
  timestamp: string
}

export interface TimetablePublishedPayload {
  termId: string
  termName: string
  publishedAt: string | null
}

export interface FeePaymentUpdatedPayload {
  paymentId: string
  studentId: string
  studentName?: string
  amount: number
  receiptNumber: string
  invoiceId: string
  invoiceStatus: string
}

export interface LessonCompletedPayload {
  timetableEntryId: string
  termId: string
  weekStartDate: string
  completed: boolean
  teacherId: string
  teacherUserId: string
}

export interface InvitationPayload {
  invitationId: string
  email: string
  name: string
  type: string
  role: string
}

export interface ParentInvitationAcceptedPayload {
  invitationId: string
  parentId: string
  parentName: string
  email: string
}

export interface ClassTeacherAssignedPayload {
  assignmentId: string
  teacherId: string
  teacherUserId?: string
  gradeLevelId?: string
  streamId?: string
}

export interface AssignmentPublishedPayload {
  testId: string
  title: string
  gradeLevelIds: string[]
  subjectId?: string
  teacherUserId: string
}

export interface AssignmentSubmittedPayload {
  testId: string
  title: string
  submissionId: string
  studentId: string
  studentName?: string
  teacherUserId: string
  gradeLevelIds: string[]
}

export interface AssignmentGradedPayload {
  testId: string
  title: string
  submissionId: string
  studentId: string
  studentUserId: string
  teacherUserId: string
  grade: number
  maxScore: number
  feedback?: string
}

export interface NotesPublishedPayload {
  noteId: string
  title: string
  gradeLevelId?: string
  subjectId?: string
  teacherUserId: string
  visibility: string
}

export interface AttendanceRegisterPayload {
  gradeId: string
  date: string
  recordCount: number
  presentCount: number
  absentCount: number
  teacherId: string
  teacherUserId: string
}
