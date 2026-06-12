import { chatGraphqlFetch } from '@/lib/chat/graphql'
import type { AssessType } from '@/lib/hooks/useTeacherActivity'

export type ExamSessionStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'MARKING'
  | 'UNDER_REVIEW'
  | 'PUBLISHED'
  | 'CLOSED'

export type PublicationState = 'HIDDEN' | 'SCHEDULED' | 'PUBLISHED'

export type MarkSubmissionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'RETURNED'
  | 'APPROVED'
  | 'LOCKED'

export interface ExamTimetableSlotRecord {
  id: string
  date: string
  startTime: string
  endTime?: string | null
  durationMinutes: number
  roomName?: string | null
}

export interface ExamPaperRecord {
  id: string
  tenantSubjectId: string
  tenantGradeLevelId: string
  paperComponent?: string | null
  paperLabel?: string | null
  defaultDurationMinutes?: number | null
  maxScore?: number | null
  passMark?: number | null
  tenantSubject?: {
    id: string
    subject?: { name: string; code?: string | null } | null
    customSubject?: { name: string; code?: string | null } | null
  } | null
  tenantGradeLevel?: {
    id: string
    gradeLevel?: { name: string } | null
  } | null
  timetableSlots: ExamTimetableSlotRecord[]
  assessment?: { id: string; status: string; resultsPublished: boolean } | null
}

export interface ExamSessionRecord {
  id: string
  name: string
  description?: string | null
  type: AssessType
  academicYear: string
  term: number
  status: ExamSessionStatus
  startDate?: string | null
  endDate?: string | null
  dailyStartTime?: string | null
  dailyEndTime?: string | null
  examDaysOfWeek?: number[] | null
  defaultMaxScore?: number | null
  defaultPassMark?: number | null
  instructions?: string | null
  resultsPublished: boolean
  publicationState: PublicationState
  publishDate?: string | null
  releaseAt?: string | null
  parentVisibility: boolean
  studentVisibility: boolean
  rankingEnabled?: boolean
  hidePositionsFromParents?: boolean
  papersCount: number
  gradesCount: number
  subjectsCount: number
  scheduledSlotsCount: number
  createdAt: string
  updatedAt: string
  papers?: ExamPaperRecord[]
}

export type ExamSessionTemplate =
  | 'CAT'
  | 'QUIZ'
  | 'ASSIGNMENT'
  | 'PRACTICAL'
  | 'PROJECT'
  | 'END_OF_TERM'
  | 'MID_TERM'
  | 'MOCK_EXAM'
  | 'KCSE_TRIAL'

export interface CreateExamSessionPayload {
  name: string
  description?: string
  type: AssessType
  academicYear: string
  term: number
  tenantGradeLevelIds: string[]
  tenantSubjectIds: string[]
  defaultMaxScore?: number
  defaultPassMark?: number
  instructions?: string
  sessionTemplate?: ExamSessionTemplate
  gradingSchemeId?: string
  streamIds?: string[]
  startDate?: string
  endDate?: string
  dailyStartTime?: string
  dailyEndTime?: string
  examDaysOfWeek?: number[]
  paperSpecs?: {
    tenantSubjectId: string
    tenantGradeLevelId: string
    paperComponent: string
    paperLabel?: string
    durationMinutes?: number
    maxScore?: number
    passMark?: number
  }[]
  timetableSlots?: {
    tenantSubjectId: string
    tenantGradeLevelId: string
    date: string
    startTime: string
    endTime?: string
    durationMinutes: number
    roomName?: string
  }[]
}

const EXAM_SESSION_LIST_FIELDS = `
  id
  name
  description
  type
  academicYear
  term
  status
  startDate
  endDate
  dailyStartTime
  dailyEndTime
  examDaysOfWeek
  defaultMaxScore
  defaultPassMark
  resultsPublished
  publicationState
  releaseAt
  parentVisibility
  studentVisibility
  rankingEnabled
  hidePositionsFromParents
  papersCount
  gradesCount
  subjectsCount
  scheduledSlotsCount
  createdAt
`

const EXAM_SESSIONS_QUERY = `
  query ExamSessions($filter: ExamSessionFilterInput) {
    examSessions(filter: $filter) {
      ${EXAM_SESSION_LIST_FIELDS}
    }
  }
`

const EXAM_SESSION_QUERY = `
  query ExamSession($id: String!) {
    examSession(id: $id) {
      ${EXAM_SESSION_LIST_FIELDS}
      instructions
      publishDate
      papers {
        id
        paperComponent
        paperLabel
        defaultDurationMinutes
        maxScore
        passMark
        tenantSubject {
          id
          subject { name code }
          customSubject { name code }
        }
        tenantGradeLevel {
          id
          gradeLevel { name }
        }
        timetableSlots {
          id
          date
          startTime
          endTime
          durationMinutes
          roomName
        }
        assessment {
          id
          status
          resultsPublished
        }
      }
    }
  }
`

const CREATE_EXAM_SESSION = `
  mutation CreateExamSession($input: CreateExamSessionInput!) {
    createExamSession(input: $input) {
      ${EXAM_SESSION_LIST_FIELDS}
    }
  }
`

const PUBLISH_EXAM_SESSION = `
  mutation PublishExamSessionResults($id: String!) {
    publishExamSessionResults(id: $id) {
      id
      resultsPublished
      status
    }
  }
`

const UNPUBLISH_EXAM_SESSION = `
  mutation UnpublishExamSessionResults($id: String!) {
    unpublishExamSessionResults(id: $id) {
      id
      resultsPublished
      status
    }
  }
`

/** Keep in sync with backend MAX_ASSESSMENTS_BATCH_SIZE. */
export const MAX_ASSESSMENTS_BATCH_SIZE = 250

/** Keep in sync with backend MAX_EXAM_SESSION_PAPERS. */
export const MAX_EXAM_SESSION_PAPERS = 2000

function examSessionCreateTimeoutMs(paperCount: number): number {
  const batches = Math.max(1, Math.ceil(paperCount / MAX_ASSESSMENTS_BATCH_SIZE))
  return Math.min(300_000, Math.max(90_000, batches * 45_000))
}

const BATCH_TIMEOUT_MS = 90_000

export async function fetchExamSessions(
  subdomain: string,
  filter?: {
    academicYear?: string
    term?: number
    type?: AssessType
    status?: ExamSessionStatus
    tenantGradeLevelId?: string
  },
): Promise<ExamSessionRecord[]> {
  const data = await chatGraphqlFetch<{ examSessions: ExamSessionRecord[] }>(
    EXAM_SESSIONS_QUERY,
    { filter: filter ?? null },
    subdomain,
  )
  return data.examSessions ?? []
}

function normalizeExamPaper(paper: ExamPaperRecord): ExamPaperRecord {
  return {
    ...paper,
    tenantSubjectId: paper.tenantSubject?.id ?? paper.tenantSubjectId ?? '',
    tenantGradeLevelId:
      paper.tenantGradeLevel?.id ?? paper.tenantGradeLevelId ?? '',
  }
}

function normalizeExamSession(session: ExamSessionRecord): ExamSessionRecord {
  if (!session.papers?.length) return session
  return {
    ...session,
    papers: session.papers.map(normalizeExamPaper),
  }
}

export async function fetchExamSession(
  subdomain: string,
  id: string,
): Promise<ExamSessionRecord> {
  const data = await chatGraphqlFetch<{ examSession: ExamSessionRecord }>(
    EXAM_SESSION_QUERY,
    { id },
    subdomain,
  )
  return normalizeExamSession(data.examSession)
}

export async function createExamSession(
  subdomain: string,
  input: CreateExamSessionPayload,
  options?: { paperCount?: number },
): Promise<ExamSessionRecord> {
  const paperCount =
    options?.paperCount ??
    input.tenantGradeLevelIds.length * input.tenantSubjectIds.length
  const data = await chatGraphqlFetch<{ createExamSession: ExamSessionRecord }>(
    CREATE_EXAM_SESSION,
    { input },
    subdomain,
    { timeoutMs: examSessionCreateTimeoutMs(paperCount) },
  )
  return data.createExamSession
}

export async function publishExamSessionResults(
  subdomain: string,
  id: string,
): Promise<void> {
  await chatGraphqlFetch(PUBLISH_EXAM_SESSION, { id }, subdomain)
}

export async function unpublishExamSessionResults(
  subdomain: string,
  id: string,
): Promise<void> {
  await chatGraphqlFetch(UNPUBLISH_EXAM_SESSION, { id }, subdomain)
}

export interface ExamPaperTimetableSlotPayload {
  paperId: string
  date: string
  startTime: string
  endTime?: string
  durationMinutes: number
  roomName?: string
}

const SAVE_EXAM_SESSION_TIMETABLE = `
  mutation SaveExamSessionTimetable($input: SaveExamSessionTimetableInput!) {
    saveExamSessionTimetable(input: $input) {
      id
      status
      startDate
      endDate
      scheduledSlotsCount
    }
  }
`

export async function saveExamSessionTimetable(
  subdomain: string,
  sessionId: string,
  slots: ExamPaperTimetableSlotPayload[],
): Promise<ExamSessionRecord> {
  const data = await chatGraphqlFetch<{
    saveExamSessionTimetable: ExamSessionRecord
  }>(
    SAVE_EXAM_SESSION_TIMETABLE,
    { input: { sessionId, slots } },
    subdomain,
  )
  return data.saveExamSessionTimetable
}

const REMOVE_EXAM_SESSION_TIMETABLE_SLOT = `
  mutation RemoveExamSessionTimetableSlot($sessionId: String!, $paperId: String!) {
    removeExamSessionTimetableSlot(sessionId: $sessionId, paperId: $paperId) {
      id
      status
      scheduledSlotsCount
    }
  }
`

export async function removeExamSessionTimetableSlot(
  subdomain: string,
  sessionId: string,
  paperId: string,
): Promise<void> {
  await chatGraphqlFetch(
    REMOVE_EXAM_SESSION_TIMETABLE_SLOT,
    { sessionId, paperId },
    subdomain,
  )
}

const ADD_EXAM_SESSION_PAPERS = `
  mutation AddExamSessionPapers($input: AddExamSessionPapersInput!) {
    addExamSessionPapers(input: $input) {
      id
      papersCount
      subjectsCount
      gradesCount
    }
  }
`

const REMOVE_EXAM_SESSION_PAPER = `
  mutation RemoveExamSessionPaper($sessionId: String!, $paperId: String!) {
    removeExamSessionPaper(sessionId: $sessionId, paperId: $paperId) {
      id
      papersCount
    }
  }
`

const UPDATE_EXAM_SESSION_PAPER = `
  mutation UpdateExamSessionPaper($input: UpdateExamSessionPaperInput!) {
    updateExamSessionPaper(input: $input) {
      id
    }
  }
`

export interface ExamPaperSpecPayload {
  tenantSubjectId: string
  tenantGradeLevelId: string
  paperComponent: string
  paperLabel?: string
  durationMinutes?: number
  maxScore?: number
  passMark?: number
}

export async function addExamSessionPapers(
  subdomain: string,
  sessionId: string,
  papers: ExamPaperSpecPayload[],
): Promise<void> {
  await chatGraphqlFetch(
    ADD_EXAM_SESSION_PAPERS,
    { input: { sessionId, papers } },
    subdomain,
  )
}

export async function removeExamSessionPaper(
  subdomain: string,
  sessionId: string,
  paperId: string,
): Promise<void> {
  await chatGraphqlFetch(
    REMOVE_EXAM_SESSION_PAPER,
    { sessionId, paperId },
    subdomain,
  )
}

const UPDATE_EXAM_SESSION_SCHEDULE = `
  mutation UpdateExamSessionSchedule($input: UpdateExamSessionScheduleInput!) {
    updateExamSessionSchedule(input: $input) {
      id
      examDaysOfWeek
      startDate
      endDate
    }
  }
`

export interface UpdateExamSessionSchedulePayload {
  examDaysOfWeek?: number[]
  startDate?: string
  endDate?: string
}

export async function updateExamSessionSchedule(
  subdomain: string,
  sessionId: string,
  schedule: UpdateExamSessionSchedulePayload,
): Promise<void> {
  await chatGraphqlFetch(
    UPDATE_EXAM_SESSION_SCHEDULE,
    { input: { sessionId, ...schedule } },
    subdomain,
  )
}

export async function updateExamSessionPaper(
  subdomain: string,
  input: {
    sessionId: string
    paperId: string
    paperLabel?: string
    durationMinutes?: number
    maxScore?: number
    passMark?: number
  },
): Promise<void> {
  await chatGraphqlFetch(UPDATE_EXAM_SESSION_PAPER, { input }, subdomain)
}

export function getSessionGrades(
  session: ExamSessionRecord,
): Array<{ id: string; name: string }> {
  const map = new Map<string, string>()
  for (const paper of session.papers ?? []) {
    const id = paper.tenantGradeLevel?.id ?? paper.tenantGradeLevelId
    const name =
      paper.tenantGradeLevel?.gradeLevel?.name ?? paper.tenantGradeLevelId
    if (id) map.set(id, name)
  }
  return Array.from(map.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function formatExamSessionLabel(session: ExamSessionRecord): string {
  return `${session.name} · ${session.academicYear} · Term ${session.term}`
}

export interface ExamPaperMarkProgress {
  paperId: string
  assessmentId: string
  subjectName: string
  gradeName: string
  maxScore: number
  marksEntered: number
  totalStudents: number
}

export interface ExamPaperMarkStudent {
  id: string
  admissionNumber: string
  name: string
  score?: number | null
}

export interface ExamSessionPaperMarkEntry {
  paperId: string
  assessmentId: string
  subjectName: string
  gradeName: string
  maxScore: number
  marksEntered: number
  totalStudents: number
  students: ExamPaperMarkStudent[]
}

export interface ExamSessionResultRow {
  studentId: string
  studentName: string
  admissionNumber: string
  gradeName: string
  subjectName: string
  paperId: string
  assessmentId: string
  score?: number | null
  maxScore: number
  percentage?: number | null
}

const EXAM_SESSION_MARK_PROGRESS = `
  query ExamSessionMarkProgress($sessionId: String!) {
    examSessionMarkProgress(sessionId: $sessionId) {
      paperId
      assessmentId
      subjectName
      gradeName
      maxScore
      marksEntered
      totalStudents
    }
  }
`

const EXAM_SESSION_PAPER_MARK_ENTRY = `
  query ExamSessionPaperMarkEntry($sessionId: String!, $paperId: String!) {
    examSessionPaperMarkEntry(sessionId: $sessionId, paperId: $paperId) {
      paperId
      assessmentId
      subjectName
      gradeName
      maxScore
      marksEntered
      totalStudents
      students {
        id
        admissionNumber
        name
        score
      }
    }
  }
`

const EXAM_SESSION_RESULTS = `
  query ExamSessionResults($sessionId: String!, $filter: ExamSessionResultsFilterInput) {
    examSessionResults(sessionId: $sessionId, filter: $filter) {
      studentId
      studentName
      admissionNumber
      gradeName
      subjectName
      paperId
      assessmentId
      score
      maxScore
      percentage
    }
  }
`

export async function fetchExamSessionMarkProgress(
  subdomain: string,
  sessionId: string,
): Promise<ExamPaperMarkProgress[]> {
  const data = await chatGraphqlFetch<{
    examSessionMarkProgress: ExamPaperMarkProgress[]
  }>(EXAM_SESSION_MARK_PROGRESS, { sessionId }, subdomain)
  return data.examSessionMarkProgress ?? []
}

export async function fetchExamSessionPaperMarkEntry(
  subdomain: string,
  sessionId: string,
  paperId: string,
): Promise<ExamSessionPaperMarkEntry> {
  const data = await chatGraphqlFetch<{
    examSessionPaperMarkEntry: ExamSessionPaperMarkEntry
  }>(EXAM_SESSION_PAPER_MARK_ENTRY, { sessionId, paperId }, subdomain)
  return data.examSessionPaperMarkEntry
}

export async function fetchExamSessionResults(
  subdomain: string,
  sessionId: string,
  filter?: {
    tenantGradeLevelId?: string
    tenantSubjectId?: string
    studentId?: string
  },
): Promise<ExamSessionResultRow[]> {
  const data = await chatGraphqlFetch<{
    examSessionResults: ExamSessionResultRow[]
  }>(EXAM_SESSION_RESULTS, { sessionId, filter: filter ?? null }, subdomain)
  return data.examSessionResults ?? []
}

export type CandidateStatus = 'REGISTERED' | 'EXCLUDED'

export type ExclusionReason =
  | 'LEFT_SCHOOL'
  | 'SUSPENDED'
  | 'DEFERRED'
  | 'TRANSFERRED'
  | 'NOT_ELIGIBLE'

export type ExamAttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'SICK'
  | 'EXCUSED'
  | 'SUSPENDED'
  | 'SPECIAL_CONSIDERATION'

export interface ExamSessionCandidateRecord {
  id: string
  status: CandidateStatus
  exclusionReason?: ExclusionReason | null
  notes?: string | null
  knecCandidateNumber?: string | null
  tenantGradeLevelId: string
  streamId?: string | null
  student: {
    id: string
    admission_number: string
    user: { name: string }
    grade?: { gradeLevel?: { name: string } | null } | null
    stream?: { id: string; name: string } | null
  }
}

export interface ExamSessionCandidateSummary {
  tenantGradeLevelId: string
  gradeName: string
  streamName?: string | null
  expected: number
  registered: number
  excluded: number
}

export interface ExamAttendanceSheetRow {
  studentId: string
  studentName: string
  admissionNumber: string
  status?: ExamAttendanceStatus | null
  notes?: string | null
  attendanceId?: string | null
}

export interface ExamAttendanceSheet {
  paperId: string
  subjectName: string
  gradeName: string
  rows: ExamAttendanceSheetRow[]
}

const EXAM_SESSION_CANDIDATES = `
  query ExamSessionCandidates($sessionId: String!) {
    examSessionCandidates(sessionId: $sessionId) {
      id
      status
      exclusionReason
      notes
      knecCandidateNumber
      tenantGradeLevelId
      streamId
      student {
        id
        admission_number
        user { name }
        grade { gradeLevel { name } }
        stream { id name }
      }
    }
  }
`

const EXAM_SESSION_CANDIDATE_SUMMARY = `
  query ExamSessionCandidateSummary($sessionId: String!) {
    examSessionCandidateSummary(sessionId: $sessionId) {
      tenantGradeLevelId
      gradeName
      streamName
      expected
      registered
      excluded
    }
  }
`

const SYNC_EXAM_SESSION_CANDIDATES = `
  mutation SyncExamSessionCandidates($sessionId: String!) {
    syncExamSessionCandidates(sessionId: $sessionId) {
      id
      status
    }
  }
`

const UPDATE_EXAM_SESSION_CANDIDATE = `
  mutation UpdateExamSessionCandidate($input: UpdateExamSessionCandidateInput!) {
    updateExamSessionCandidate(input: $input) {
      id
      status
      exclusionReason
      notes
      knecCandidateNumber
    }
  }
`

const EXAM_SESSION_ATTENDANCE_SHEET = `
  query ExamSessionAttendanceSheet($sessionId: String!, $paperId: String!) {
    examSessionAttendanceSheet(sessionId: $sessionId, paperId: $paperId) {
      paperId
      subjectName
      gradeName
      rows {
        studentId
        studentName
        admissionNumber
        status
        notes
        attendanceId
      }
    }
  }
`

const BULK_RECORD_EXAM_ATTENDANCE = `
  mutation BulkRecordExamAttendance($input: BulkRecordExamAttendanceInput!) {
    bulkRecordExamAttendance(input: $input) {
      id
      status
      studentId
    }
  }
`

export async function fetchExamSessionCandidates(
  subdomain: string,
  sessionId: string,
): Promise<ExamSessionCandidateRecord[]> {
  const data = await chatGraphqlFetch<{
    examSessionCandidates: ExamSessionCandidateRecord[]
  }>(EXAM_SESSION_CANDIDATES, { sessionId }, subdomain)
  return data.examSessionCandidates ?? []
}

export async function fetchExamSessionCandidateSummary(
  subdomain: string,
  sessionId: string,
): Promise<ExamSessionCandidateSummary[]> {
  const data = await chatGraphqlFetch<{
    examSessionCandidateSummary: ExamSessionCandidateSummary[]
  }>(EXAM_SESSION_CANDIDATE_SUMMARY, { sessionId }, subdomain)
  return data.examSessionCandidateSummary ?? []
}

export async function syncExamSessionCandidates(
  subdomain: string,
  sessionId: string,
): Promise<void> {
  await chatGraphqlFetch(SYNC_EXAM_SESSION_CANDIDATES, { sessionId }, subdomain)
}

export async function updateExamSessionCandidate(
  subdomain: string,
  input: {
    candidateId: string
    status: CandidateStatus
    exclusionReason?: ExclusionReason
    notes?: string
    knecCandidateNumber?: string
  },
): Promise<void> {
  await chatGraphqlFetch(UPDATE_EXAM_SESSION_CANDIDATE, { input }, subdomain)
}

export async function fetchExamSessionAttendanceSheet(
  subdomain: string,
  sessionId: string,
  paperId: string,
): Promise<ExamAttendanceSheet> {
  const data = await chatGraphqlFetch<{
    examSessionAttendanceSheet: ExamAttendanceSheet
  }>(EXAM_SESSION_ATTENDANCE_SHEET, { sessionId, paperId }, subdomain)
  return data.examSessionAttendanceSheet
}

export async function bulkRecordExamAttendance(
  subdomain: string,
  input: {
    examSessionId: string
    examPaperId: string
    rows: { studentId: string; status: ExamAttendanceStatus; notes?: string }[]
  },
): Promise<void> {
  await chatGraphqlFetch(BULK_RECORD_EXAM_ATTENDANCE, { input }, subdomain)
}

export const EXCLUSION_REASON_LABELS: Record<ExclusionReason, string> = {
  LEFT_SCHOOL: 'Left school',
  SUSPENDED: 'Suspended',
  DEFERRED: 'Deferred',
  TRANSFERRED: 'Transferred',
  NOT_ELIGIBLE: 'Not eligible',
}

export const ATTENDANCE_STATUS_LABELS: Record<ExamAttendanceStatus, string> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  SICK: 'Sick',
  EXCUSED: 'Excused',
  SUSPENDED: 'Suspended',
  SPECIAL_CONSIDERATION: 'Special consideration',
}

export function statusLabel(status: ExamSessionStatus): string {
  const labels: Record<ExamSessionStatus, string> = {
    DRAFT: 'Draft',
    SCHEDULED: 'Scheduled',
    IN_PROGRESS: 'In progress',
    MARKING: 'Marking',
    UNDER_REVIEW: 'Under review',
    PUBLISHED: 'Published',
    CLOSED: 'Closed',
  }
  return labels[status] ?? status
}

/** Share of exam papers that have at least one timetable slot. */
export function examTimetableFill(
  session: Pick<ExamSessionRecord, 'papersCount' | 'scheduledSlotsCount'>,
) {
  const total = session.papersCount ?? 0
  const scheduled = Math.min(session.scheduledSlotsCount ?? 0, total)
  const percent = total > 0 ? Math.round((scheduled / total) * 100) : 0
  return { scheduled, total, percent }
}

export function publicationStateLabel(state: PublicationState): string {
  const labels: Record<PublicationState, string> = {
    HIDDEN: 'Hidden',
    SCHEDULED: 'Scheduled release',
    PUBLISHED: 'Published',
  }
  return labels[state] ?? state
}

export const MARK_SUBMISSION_STATUS_LABELS: Record<MarkSubmissionStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under review',
  RETURNED: 'Returned',
  APPROVED: 'Approved',
  LOCKED: 'Locked',
}

export interface MarkSubmissionRecord {
  id: string
  status: MarkSubmissionStatus
  reviewNotes?: string | null
  submittedAt?: string | null
  reviewedAt?: string | null
  approvedAt?: string | null
  examPaper: {
    id: string
    tenantSubject?: { subject?: { name: string } | null } | null
    tenantGradeLevel?: { gradeLevel?: { name: string } | null } | null
  }
}

const EXAM_SESSION_MARK_SUBMISSIONS = `
  query ExamSessionMarkSubmissions($sessionId: String!) {
    examSessionMarkSubmissions(sessionId: $sessionId) {
      id
      status
      reviewNotes
      submittedAt
      reviewedAt
      approvedAt
      examPaper {
        id
        tenantSubject { subject { name } }
        tenantGradeLevel { gradeLevel { name } }
      }
    }
  }
`

const SUBMIT_EXAM_PAPER_MARKS = `
  mutation SubmitExamPaperMarks($submissionId: String!) {
    submitExamPaperMarks(submissionId: $submissionId) {
      id
      status
      submittedAt
    }
  }
`

const REVIEW_EXAM_PAPER_MARKS = `
  mutation ReviewExamPaperMarks($input: ReviewMarkSubmissionInput!) {
    reviewExamPaperMarks(input: $input) {
      id
      status
      reviewNotes
      reviewedAt
    }
  }
`

const LOCK_EXAM_PAPER_MARKS = `
  mutation LockExamPaperMarks($submissionId: String!) {
    lockExamPaperMarks(submissionId: $submissionId) {
      id
      status
      approvedAt
    }
  }
`

const RETURN_EXAM_PAPER_MARKS = `
  mutation ReturnExamPaperMarks($submissionId: String!, $notes: String) {
    returnExamPaperMarks(submissionId: $submissionId, notes: $notes) {
      id
      status
      reviewNotes
      reviewedAt
    }
  }
`

const LOCK_ALL_EXAM_SESSION_MARKS = `
  mutation LockAllExamSessionMarks($sessionId: String!) {
    lockAllExamSessionMarks(sessionId: $sessionId) {
      id
      status
    }
  }
`

const APPROVE_ALL_EXAM_SESSION_MARKS = `
  mutation ApproveAllExamSessionMarks($sessionId: String!) {
    approveAllExamSessionMarks(sessionId: $sessionId) {
      id
      status
    }
  }
`

const SCHEDULE_EXAM_SESSION_PUBLICATION = `
  mutation ScheduleExamSessionPublication($input: ScheduleExamSessionPublicationInput!) {
    scheduleExamSessionPublication(input: $input) {
      id
      publicationState
      releaseAt
      parentVisibility
      studentVisibility
      resultsPublished
    }
  }
`

export async function fetchExamSessionMarkSubmissions(
  subdomain: string,
  sessionId: string,
): Promise<MarkSubmissionRecord[]> {
  const data = await chatGraphqlFetch<{
    examSessionMarkSubmissions: MarkSubmissionRecord[]
  }>(EXAM_SESSION_MARK_SUBMISSIONS, { sessionId }, subdomain)
  return data.examSessionMarkSubmissions ?? []
}

export async function submitExamPaperMarks(
  subdomain: string,
  submissionId: string,
): Promise<void> {
  await chatGraphqlFetch(SUBMIT_EXAM_PAPER_MARKS, { submissionId }, subdomain)
}

export async function reviewExamPaperMarks(
  subdomain: string,
  input: { submissionId: string; approve: boolean; reviewNotes?: string },
): Promise<void> {
  await chatGraphqlFetch(REVIEW_EXAM_PAPER_MARKS, { input }, subdomain)
}

export async function lockExamPaperMarks(
  subdomain: string,
  submissionId: string,
): Promise<void> {
  await chatGraphqlFetch(LOCK_EXAM_PAPER_MARKS, { submissionId }, subdomain)
}

export async function returnExamPaperMarks(
  subdomain: string,
  submissionId: string,
  notes?: string,
): Promise<void> {
  await chatGraphqlFetch(RETURN_EXAM_PAPER_MARKS, { submissionId, notes }, subdomain)
}

export async function lockAllExamSessionMarks(
  subdomain: string,
  sessionId: string,
): Promise<void> {
  await chatGraphqlFetch(LOCK_ALL_EXAM_SESSION_MARKS, { sessionId }, subdomain)
}

export async function approveAllExamSessionMarks(
  subdomain: string,
  sessionId: string,
): Promise<void> {
  await chatGraphqlFetch(APPROVE_ALL_EXAM_SESSION_MARKS, { sessionId }, subdomain)
}

export interface ProcessedSubjectScore {
  paperId: string
  subjectName: string
  score?: number | null
  maxScore: number
  percentage?: number | null
  grade: string
  points?: number | null
}

export interface ProcessedResultRecord {
  id: string
  studentId: string
  tenantGradeLevelId: string
  streamId?: string | null
  subjectScores: ProcessedSubjectScore[]
  totalScore: number
  totalMaxScore: number
  meanPercentage: number
  overallGrade: string
  totalPoints: number
  meanPoints?: number | null
  gradePosition?: number | null
  streamPosition?: number | null
  totalStudentsInGrade: number
  processedAt: string
  student?: {
    id: string
    admission_number: string
    user: { name: string }
    stream?: { name: string } | null
  } | null
}

export interface ExamSessionRankingRow {
  studentId: string
  studentName: string
  admissionNumber: string
  gradeName: string
  streamName?: string | null
  meanPercentage: number
  overallGrade: string
  gradePosition?: number | null
  streamPosition?: number | null
  subjectsCount: number
  totalPoints?: number | null
  meanPoints?: number | null
}

export interface ExamSessionAnalytics {
  sessionMean: number
  passRate: number
  totalStudents: number
  studentsWithMarks: number
  gradeMeans: {
    gradeName: string
    tenantGradeLevelId: string
    meanPercentage: number
    studentCount: number
  }[]
  subjectMeans: {
    subjectName: string
    paperId: string
    meanPercentage: number
    studentsWithMarks: number
    totalStudents: number
  }[]
}

const PROCESS_EXAM_SESSION_RESULTS = `
  mutation ProcessExamSessionResults($sessionId: String!) {
    processExamSessionResults(sessionId: $sessionId) {
      processedCount
      processedAt
    }
  }
`

const EXAM_SESSION_PROCESSED_RESULTS = `
  query ExamSessionProcessedResults($sessionId: String!, $filter: ProcessedResultsFilterInput) {
    examSessionProcessedResults(sessionId: $sessionId, filter: $filter) {
      id
      studentId
      tenantGradeLevelId
      streamId
      subjectScores {
        paperId
        subjectName
        score
        maxScore
        percentage
        grade
        points
      }
      totalScore
      totalMaxScore
      meanPercentage
      overallGrade
      totalPoints
      meanPoints
      gradePosition
      streamPosition
      totalStudentsInGrade
      processedAt
      student {
        id
        admission_number
        user { name }
        stream { name }
      }
    }
  }
`

const EXAM_SESSION_RANKINGS = `
  query ExamSessionRankings($sessionId: String!, $filter: ProcessedResultsFilterInput) {
    examSessionRankings(sessionId: $sessionId, filter: $filter) {
      studentId
      studentName
      admissionNumber
      gradeName
      streamName
      meanPercentage
      overallGrade
      gradePosition
      streamPosition
      subjectsCount
      totalPoints
      meanPoints
    }
  }
`

const EXAM_SESSION_ANALYTICS = `
  query ExamSessionAnalytics($sessionId: String!) {
    examSessionAnalytics(sessionId: $sessionId) {
      sessionMean
      passRate
      totalStudents
      studentsWithMarks
      gradeMeans {
        gradeName
        tenantGradeLevelId
        meanPercentage
        studentCount
      }
      subjectMeans {
        subjectName
        paperId
        meanPercentage
        studentsWithMarks
        totalStudents
      }
    }
  }
`

export async function processExamSessionResults(
  subdomain: string,
  sessionId: string,
): Promise<{ processedCount: number; processedAt: string }> {
  const data = await chatGraphqlFetch<{
    processExamSessionResults: { processedCount: number; processedAt: string }
  }>(PROCESS_EXAM_SESSION_RESULTS, { sessionId }, subdomain)
  return data.processExamSessionResults
}

export async function fetchExamSessionProcessedResults(
  subdomain: string,
  sessionId: string,
  filter?: { tenantGradeLevelId?: string; streamId?: string; studentId?: string },
): Promise<ProcessedResultRecord[]> {
  const data = await chatGraphqlFetch<{
    examSessionProcessedResults: ProcessedResultRecord[]
  }>(EXAM_SESSION_PROCESSED_RESULTS, { sessionId, filter: filter ?? null }, subdomain)
  return data.examSessionProcessedResults ?? []
}

export async function fetchExamSessionRankings(
  subdomain: string,
  sessionId: string,
  filter?: { tenantGradeLevelId?: string; streamId?: string },
): Promise<ExamSessionRankingRow[]> {
  const data = await chatGraphqlFetch<{
    examSessionRankings: ExamSessionRankingRow[]
  }>(EXAM_SESSION_RANKINGS, { sessionId, filter: filter ?? null }, subdomain)
  return data.examSessionRankings ?? []
}

export async function fetchExamSessionAnalytics(
  subdomain: string,
  sessionId: string,
): Promise<ExamSessionAnalytics> {
  const data = await chatGraphqlFetch<{
    examSessionAnalytics: ExamSessionAnalytics
  }>(EXAM_SESSION_ANALYTICS, { sessionId }, subdomain)
  return data.examSessionAnalytics
}

const BULK_IMPORT_EXAM_PAPER_MARKS = `
  mutation BulkImportExamPaperMarks($input: BulkImportExamPaperMarksInput!) {
    bulkImportExamPaperMarks(input: $input) {
      importedCount
      skippedCount
      errors
    }
  }
`

const UPDATE_EXAM_SESSION_SETTINGS = `
  mutation UpdateExamSessionSettings($input: UpdateExamSessionSettingsInput!) {
    updateExamSessionSettings(input: $input) {
      id
      rankingEnabled
      hidePositionsFromParents
      parentVisibility
      studentVisibility
    }
  }
`

export interface BulkImportMarksResult {
  importedCount: number
  skippedCount: number
  errors: string[]
}

export async function bulkImportExamPaperMarks(
  subdomain: string,
  input: {
    sessionId: string
    paperId: string
    rows: { admissionNumber?: string; studentId?: string; score: number }[]
  },
): Promise<BulkImportMarksResult> {
  const data = await chatGraphqlFetch<{
    bulkImportExamPaperMarks: BulkImportMarksResult
  }>(BULK_IMPORT_EXAM_PAPER_MARKS, { input }, subdomain, { timeoutMs: 90_000 })
  return data.bulkImportExamPaperMarks
}

export async function updateExamSessionSettings(
  subdomain: string,
  input: {
    sessionId: string
    rankingEnabled?: boolean
    hidePositionsFromParents?: boolean
    parentVisibility?: boolean
    studentVisibility?: boolean
    gradingSchemeId?: string
  },
): Promise<void> {
  await chatGraphqlFetch(UPDATE_EXAM_SESSION_SETTINGS, { input }, subdomain)
}

export async function scheduleExamSessionPublication(
  subdomain: string,
  input: {
    sessionId: string
    releaseAt: string
    parentVisibility?: boolean
    studentVisibility?: boolean
  },
): Promise<void> {
  await chatGraphqlFetch(SCHEDULE_EXAM_SESSION_PUBLICATION, { input }, subdomain)
}


const TEACHER_EXAM_ASSIGNMENTS_QUERY = `
  query TeacherExamAssignments {
    teacherExamAssignments {
      teacherId
      subjectIds
      gradeLevelIds
      streamIds
      hodSubjectIds
      classTeacherStreamIds
    }
  }
`

export interface TeacherExamAssignments {
  teacherId?: string | null
  subjectIds: string[]
  gradeLevelIds: string[]
  streamIds: string[]
  hodSubjectIds: string[]
  classTeacherStreamIds: string[]
}

export interface MarkSubmissionAuditLogRecord {
  id: string
  markSubmissionId: string
  actorId: string
  action: 'SUBMIT' | 'RETURN' | 'APPROVE' | 'LOCK'
  oldStatus: MarkSubmissionStatus
  newStatus: MarkSubmissionStatus
  notes?: string | null
  createdAt: string
}

const MARK_SUBMISSION_AUDIT_LOG_QUERY = `
  query MarkSubmissionAuditLog($submissionId: String!) {
    markSubmissionAuditLog(submissionId: $submissionId) {
      id
      markSubmissionId
      actorId
      action
      oldStatus
      newStatus
      notes
      createdAt
    }
  }
`

export async function fetchMarkSubmissionAuditLog(
  subdomain: string,
  submissionId: string,
): Promise<MarkSubmissionAuditLogRecord[]> {
  const data = await chatGraphqlFetch<{
    markSubmissionAuditLog: MarkSubmissionAuditLogRecord[]
  }>(MARK_SUBMISSION_AUDIT_LOG_QUERY, { submissionId }, subdomain)
  return data.markSubmissionAuditLog ?? []
}

export async function fetchTeacherExamAssignments(
  subdomain: string,
): Promise<TeacherExamAssignments> {
  const data = await chatGraphqlFetch<{
    teacherExamAssignments: TeacherExamAssignments
  }>(TEACHER_EXAM_ASSIGNMENTS_QUERY, {}, subdomain)
  return data.teacherExamAssignments
}
