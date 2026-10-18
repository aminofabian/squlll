import { graphqlFetch } from '@/app/school/[subdomain]/teacher/utils/graphqlFetch'

// ─────────────────────────────── types ────────────────────────────────────

export type LessonPlanStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RETURNED'
export type SchemeOfWorkStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
export type SchemeEntryStatus =
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COVERED'
  | 'PARTIAL'
  | 'SKIPPED'
export type LessonDeliveryStatus = 'TAUGHT' | 'PARTIAL' | 'NOT_TAUGHT'
export type LessonReviewAction = 'SUBMIT' | 'APPROVE' | 'RETURN' | 'COMMENT'

export interface LessonActivity {
  minutes: number
  title: string
  description?: string | null
}

export interface LessonPlanReview {
  id: string
  action: LessonReviewAction
  comment?: string | null
  actorName?: string | null
  createdAt: string
}

export interface LessonRecord {
  id: string
  termId: string
  lessonPlanId?: string | null
  timetableEntryId?: string | null
  schemeEntryId?: string | null
  lessonDate: string
  className: string
  subjectName: string
  status: LessonDeliveryStatus
  deliveredTopic?: string | null
  whatWasCovered?: string | null
  learnersPresent?: number | null
  learnersAchieved?: number | null
  challenges?: string | null
  followUp?: string | null
  carryForward: boolean
  coveragePercent: number
  recordedAt: string
  updatedAt: string
}

export interface LessonPlan {
  id: string
  termId: string
  teacherId: string
  teacherName: string
  timetableEntryId?: string | null
  schemeOfWorkId?: string | null
  schemeEntryId?: string | null
  gradeLevelId: string
  className: string
  streamId?: string | null
  streamName?: string | null
  subjectId: string
  subjectName: string
  lessonDate: string
  weekNumber: number
  lessonNumber: number
  durationMinutes: number
  periodNumber?: number | null
  periodTime?: string | null
  strand?: string | null
  subStrand?: string | null
  topic?: string | null
  subTopic?: string | null
  specificLearningOutcomes?: string | null
  keyInquiryQuestion?: string | null
  activities: LessonActivity[]
  resources?: string | null
  assessment?: string | null
  differentiation?: string | null
  homework?: string | null
  status: LessonPlanStatus
  submittedAt?: string | null
  reviewedAt?: string | null
  reviewComment?: string | null
  revision: number
  reviews: LessonPlanReview[]
  record?: LessonRecord | null
  updatedAt: string
  createdAt: string
}

export interface SchemeOfWorkEntry {
  id: string
  schemeOfWorkId: string
  weekNumber: number
  sequence: number
  strand?: string | null
  subStrand?: string | null
  topic: string
  specificLearningOutcomes?: string | null
  suggestedActivities?: string | null
  resources?: string | null
  assessmentMethod?: string | null
  notes?: string | null
  plannedLessons: number
  status: SchemeEntryStatus
  originalWeekNumber?: number | null
  carryOverFromEntryId?: string | null
  reason?: string | null
  deliveredLessons: number
  coveragePercent: number
}

export interface SchemeOfWork {
  id: string
  termId: string
  teacherId: string
  teacherName: string
  gradeLevelId: string
  className: string
  streamId?: string | null
  streamName?: string | null
  subjectId: string
  subjectName: string
  title?: string | null
  description?: string | null
  status: SchemeOfWorkStatus
  weekCount: number
  publishedAt?: string | null
  plannedLessons: number
  deliveredLessons: number
  coveragePercent: number
  entries: SchemeOfWorkEntry[]
  updatedAt: string
  createdAt: string
}

export interface LessonPlanPeriod {
  timetableEntryId: string
  gradeLevelId: string
  className: string
  streamId?: string | null
  streamName?: string | null
  subjectId: string
  subjectName: string
  roomName?: string | null
  periodNumber: number
  startTime: string
  endTime: string
  date: string
  plan?: LessonPlan | null
  record?: LessonRecord | null
  suggestedSchemeEntry?: SchemeOfWorkEntry | null
}

export interface LessonPlanDay {
  date: string
  dayOfWeek: number
  dayName: string
  periods: LessonPlanPeriod[]
}

export interface PlanningStats {
  scheduledLessons: number
  plansPrepared: number
  drafts: number
  submitted: number
  approved: number
  returned: number
  lessonsRecorded: number
  lessonsNotRecorded: number
  preparationRate: number
}

export interface LessonPlanWeek {
  termId: string
  termName: string
  weekNumber: number
  weekStartDate: string
  weekEndDate: string
  today: string
  days: LessonPlanDay[]
  stats: PlanningStats
}

export interface TeacherPlanningSummary {
  teacherId: string
  teacherName: string
  email?: string | null
  scheduledLessons: number
  plansPrepared: number
  lessonsRecorded: number
  lessonsNotRecorded: number
  awaitingReview: number
  returnedPlans: number
  preparationRate: number
  coverageBehind: number
}

export interface CoverageGap {
  gradeLevelId: string
  className: string
  subjectId: string
  subjectName: string
  teacherId: string
  teacherName: string
  expectedLessons: number
  deliveredLessons: number
}

export interface AcademicSupervision {
  termId: string
  weekStartDate: string
  weekEndDate: string
  scheduledLessons: number
  plansPrepared: number
  preparationRate: number
  awaitingReview: number
  lessonsNotRecorded: number
  coverageBehind: number
  coverageGaps: CoverageGap[]
  teachers: TeacherPlanningSummary[]
}

export interface SupervisionFilter {
  teacherId?: string
  gradeLevelId?: string
  subjectId?: string
}

// ─────────────────────────────── fragments ────────────────────────────────

const SCHEME_ENTRY_FRAGMENT = `
  fragment SchemeEntryFields on SchemeOfWorkEntryType {
    id
    schemeOfWorkId
    weekNumber
    sequence
    strand
    subStrand
    topic
    specificLearningOutcomes
    suggestedActivities
    resources
    assessmentMethod
    notes
    plannedLessons
    status
    originalWeekNumber
    carryOverFromEntryId
    reason
    deliveredLessons
    coveragePercent
  }
`

const LESSON_RECORD_FRAGMENT = `
  fragment LessonRecordFields on LessonRecordType {
    id
    termId
    lessonPlanId
    timetableEntryId
    schemeEntryId
    lessonDate
    className
    subjectName
    status
    deliveredTopic
    whatWasCovered
    learnersPresent
    learnersAchieved
    challenges
    followUp
    carryForward
    coveragePercent
    recordedAt
    updatedAt
  }
`

const LESSON_PLAN_FRAGMENT = `
  fragment LessonPlanFields on LessonPlanType {
    id
    termId
    teacherId
    teacherName
    timetableEntryId
    schemeOfWorkId
    schemeEntryId
    gradeLevelId
    className
    streamId
    streamName
    subjectId
    subjectName
    lessonDate
    weekNumber
    lessonNumber
    durationMinutes
    periodNumber
    periodTime
    strand
    subStrand
    topic
    subTopic
    specificLearningOutcomes
    keyInquiryQuestion
    activities { minutes title description }
    resources
    assessment
    differentiation
    homework
    status
    submittedAt
    reviewedAt
    reviewComment
    revision
    reviews { id action comment actorName createdAt }
    record {
      ...LessonRecordFields
    }
    updatedAt
    createdAt
  }
  ${LESSON_RECORD_FRAGMENT}
`

const SCHEME_FRAGMENT = `
  fragment SchemeOfWorkFields on SchemeOfWorkType {
    id
    termId
    teacherId
    teacherName
    gradeLevelId
    className
    streamId
    streamName
    subjectId
    subjectName
    title
    description
    status
    weekCount
    publishedAt
    plannedLessons
    deliveredLessons
    coveragePercent
    entries { ...SchemeEntryFields }
    updatedAt
    createdAt
  }
  ${SCHEME_ENTRY_FRAGMENT}
`

// ─────────────────────────────── queries ──────────────────────────────────

const GET_MY_LESSON_WEEK = `
  query GetMyLessonWeek($termId: ID!, $date: String) {
    getMyLessonWeek(termId: $termId, date: $date) {
      termId
      termName
      weekNumber
      weekStartDate
      weekEndDate
      today
      days {
        date
        dayOfWeek
        dayName
        periods {
          timetableEntryId
          gradeLevelId
          className
          streamId
          streamName
          subjectId
          subjectName
          roomName
          periodNumber
          startTime
          endTime
          date
          plan { ...LessonPlanFields }
          record { ...LessonRecordFields }
          suggestedSchemeEntry { ...SchemeEntryFields }
        }
      }
      stats {
        scheduledLessons
        plansPrepared
        drafts
        submitted
        approved
        returned
        lessonsRecorded
        lessonsNotRecorded
        preparationRate
      }
    }
  }
  ${LESSON_PLAN_FRAGMENT}
  ${LESSON_RECORD_FRAGMENT}
  ${SCHEME_ENTRY_FRAGMENT}
`

const GET_MY_LESSON_PLANS = `
  query GetMyLessonPlans($termId: ID!, $status: LessonPlanStatus) {
    getMyLessonPlans(termId: $termId, status: $status) {
      ...LessonPlanFields
    }
  }
  ${LESSON_PLAN_FRAGMENT}
`

const GET_LESSON_PLAN = `
  query GetLessonPlan($id: ID!) {
    getLessonPlan(id: $id) {
      ...LessonPlanFields
    }
  }
  ${LESSON_PLAN_FRAGMENT}
`

const GET_MY_SCHEMES = `
  query GetMySchemesOfWork($termId: ID!) {
    getMySchemesOfWork(termId: $termId) {
      ...SchemeOfWorkFields
    }
  }
  ${SCHEME_FRAGMENT}
`

const GET_SCHEME = `
  query GetSchemeOfWork($id: ID!) {
    getSchemeOfWork(id: $id) {
      ...SchemeOfWorkFields
    }
  }
  ${SCHEME_FRAGMENT}
`

const GET_SUPERVISION = `
  query AcademicSupervisionOverview($termId: ID!, $weekStartDate: String, $filter: AcademicSupervisionFilterInput) {
    academicSupervisionOverview(termId: $termId, weekStartDate: $weekStartDate, filter: $filter) {
      termId
      weekStartDate
      weekEndDate
      scheduledLessons
      plansPrepared
      preparationRate
      awaitingReview
      lessonsNotRecorded
      coverageBehind
      coverageGaps {
        gradeLevelId
        className
        subjectId
        subjectName
        teacherId
        teacherName
        expectedLessons
        deliveredLessons
      }
      teachers {
        teacherId
        teacherName
        email
        scheduledLessons
        plansPrepared
        lessonsRecorded
        lessonsNotRecorded
        awaitingReview
        returnedPlans
        preparationRate
        coverageBehind
      }
    }
  }
`

const GET_PLANS_FOR_REVIEW = `
  query GetLessonPlansForReview($termId: ID!, $status: LessonPlanStatus, $filter: AcademicSupervisionFilterInput) {
    getLessonPlansForReview(termId: $termId, status: $status, filter: $filter) {
      ...LessonPlanFields
    }
  }
  ${LESSON_PLAN_FRAGMENT}
`

// ─────────────────────────────── mutations ────────────────────────────────

const START_LESSON_PLAN = `
  mutation StartLessonPlan($input: StartLessonPlanInput!) {
    startLessonPlan(input: $input) { ...LessonPlanFields }
  }
  ${LESSON_PLAN_FRAGMENT}
`

const SAVE_LESSON_PLAN = `
  mutation SaveLessonPlan($input: SaveLessonPlanInput!) {
    saveLessonPlan(input: $input) { ...LessonPlanFields }
  }
  ${LESSON_PLAN_FRAGMENT}
`

const SUBMIT_LESSON_PLAN = `
  mutation SubmitLessonPlan($id: ID!, $comment: String) {
    submitLessonPlan(id: $id, comment: $comment) { ...LessonPlanFields }
  }
  ${LESSON_PLAN_FRAGMENT}
`

const DELETE_LESSON_PLAN = `
  mutation DeleteLessonPlan($id: ID!) {
    deleteLessonPlan(id: $id)
  }
`

const SAVE_LESSON_RECORD = `
  mutation SaveLessonRecord($input: SaveLessonRecordInput!) {
    saveLessonRecord(input: $input) { ...LessonRecordFields }
  }
  ${LESSON_RECORD_FRAGMENT}
`

const SAVE_SCHEME = `
  mutation SaveSchemeOfWork($input: SaveSchemeOfWorkInput!) {
    saveSchemeOfWork(input: $input) { ...SchemeOfWorkFields }
  }
  ${SCHEME_FRAGMENT}
`

const SAVE_SCHEME_ENTRY = `
  mutation SaveSchemeEntry($input: SaveSchemeEntryInput!) {
    saveSchemeEntry(input: $input) { ...SchemeOfWorkFields }
  }
  ${SCHEME_FRAGMENT}
`

const DELETE_SCHEME_ENTRY = `
  mutation DeleteSchemeEntry($id: ID!) {
    deleteSchemeEntry(id: $id) { ...SchemeOfWorkFields }
  }
  ${SCHEME_FRAGMENT}
`

const GENERATE_PLANS = `
  mutation GenerateLessonPlansFromScheme($input: GeneratePlansFromSchemeInput!) {
    generateLessonPlansFromScheme(input: $input)
  }
`

const REVIEW_LESSON_PLAN = `
  mutation ReviewLessonPlan($input: ReviewLessonPlanInput!) {
    reviewLessonPlan(input: $input) { ...LessonPlanFields }
  }
  ${LESSON_PLAN_FRAGMENT}
`

// ─────────────────────────────── api calls ────────────────────────────────

export async function fetchMyLessonWeek(
  subdomain: string,
  termId: string,
  date?: string,
): Promise<LessonPlanWeek> {
  const result = await graphqlFetch<{ getMyLessonWeek: LessonPlanWeek }>(
    GET_MY_LESSON_WEEK,
    { termId, date },
    subdomain,
  )
  return result.getMyLessonWeek
}

export async function fetchMyLessonPlans(
  subdomain: string,
  termId: string,
  status?: LessonPlanStatus,
): Promise<LessonPlan[]> {
  const result = await graphqlFetch<{ getMyLessonPlans: LessonPlan[] }>(
    GET_MY_LESSON_PLANS,
    { termId, status },
    subdomain,
  )
  return result.getMyLessonPlans ?? []
}

export async function fetchLessonPlan(
  subdomain: string,
  id: string,
): Promise<LessonPlan> {
  const result = await graphqlFetch<{ getLessonPlan: LessonPlan }>(
    GET_LESSON_PLAN,
    { id },
    subdomain,
  )
  return result.getLessonPlan
}

export async function startLessonPlan(
  subdomain: string,
  input: { timetableEntryId: string; termId: string; date: string },
): Promise<LessonPlan> {
  const result = await graphqlFetch<{ startLessonPlan: LessonPlan }>(
    START_LESSON_PLAN,
    { input },
    subdomain,
  )
  return result.startLessonPlan
}

export type SaveLessonPlanInput = Omit<
  Partial<LessonPlan>,
  'activities' | 'reviews' | 'record'
> & {
  termId: string
  gradeLevelId: string
  subjectId: string
  lessonDate: string
  activities?: LessonActivity[]
}

export async function saveLessonPlan(
  subdomain: string,
  input: SaveLessonPlanInput,
): Promise<LessonPlan> {
  const result = await graphqlFetch<{ saveLessonPlan: LessonPlan }>(
    SAVE_LESSON_PLAN,
    { input },
    subdomain,
  )
  return result.saveLessonPlan
}

export async function submitLessonPlan(
  subdomain: string,
  id: string,
  comment?: string,
): Promise<LessonPlan> {
  const result = await graphqlFetch<{ submitLessonPlan: LessonPlan }>(
    SUBMIT_LESSON_PLAN,
    { id, comment },
    subdomain,
  )
  return result.submitLessonPlan
}

export async function deleteLessonPlan(
  subdomain: string,
  id: string,
): Promise<boolean> {
  const result = await graphqlFetch<{ deleteLessonPlan: boolean }>(
    DELETE_LESSON_PLAN,
    { id },
    subdomain,
  )
  return result.deleteLessonPlan
}

export interface SaveLessonRecordInput {
  id?: string
  lessonPlanId?: string
  timetableEntryId?: string
  termId: string
  lessonDate: string
  status: LessonDeliveryStatus
  deliveredTopic?: string
  whatWasCovered?: string
  learnersPresent?: number
  learnersAchieved?: number
  challenges?: string
  followUp?: string
  carryForward?: boolean
  coveragePercent?: number
}

export async function saveLessonRecord(
  subdomain: string,
  input: SaveLessonRecordInput,
): Promise<LessonRecord> {
  const result = await graphqlFetch<{ saveLessonRecord: LessonRecord }>(
    SAVE_LESSON_RECORD,
    { input },
    subdomain,
  )
  return result.saveLessonRecord
}

export async function fetchMySchemesOfWork(
  subdomain: string,
  termId: string,
): Promise<SchemeOfWork[]> {
  const result = await graphqlFetch<{ getMySchemesOfWork: SchemeOfWork[] }>(
    GET_MY_SCHEMES,
    { termId },
    subdomain,
  )
  return result.getMySchemesOfWork ?? []
}

export async function fetchSchemeOfWork(
  subdomain: string,
  id: string,
): Promise<SchemeOfWork> {
  const result = await graphqlFetch<{ getSchemeOfWork: SchemeOfWork }>(
    GET_SCHEME,
    { id },
    subdomain,
  )
  return result.getSchemeOfWork
}

export async function saveSchemeOfWork(
  subdomain: string,
  input: {
    id?: string
    termId: string
    gradeLevelId: string
    streamId?: string
    subjectId: string
    title?: string
    description?: string
    status?: SchemeOfWorkStatus
    weekCount?: number
  },
): Promise<SchemeOfWork> {
  const result = await graphqlFetch<{ saveSchemeOfWork: SchemeOfWork }>(
    SAVE_SCHEME,
    { input },
    subdomain,
  )
  return result.saveSchemeOfWork
}

export async function saveSchemeEntry(
  subdomain: string,
  input: {
    id?: string
    schemeOfWorkId: string
    weekNumber: number
    sequence?: number
    strand?: string
    subStrand?: string
    topic: string
    specificLearningOutcomes?: string
    suggestedActivities?: string
    resources?: string
    assessmentMethod?: string
    notes?: string
    plannedLessons?: number
    status?: SchemeEntryStatus
    reason?: string
  },
): Promise<SchemeOfWork> {
  const result = await graphqlFetch<{ saveSchemeEntry: SchemeOfWork }>(
    SAVE_SCHEME_ENTRY,
    { input },
    subdomain,
  )
  return result.saveSchemeEntry
}

export async function deleteSchemeEntry(
  subdomain: string,
  id: string,
): Promise<SchemeOfWork> {
  const result = await graphqlFetch<{ deleteSchemeEntry: SchemeOfWork }>(
    DELETE_SCHEME_ENTRY,
    { id },
    subdomain,
  )
  return result.deleteSchemeEntry
}

export async function generatePlansFromScheme(
  subdomain: string,
  input: { schemeOfWorkId: string; fromWeek?: number; limit?: number },
): Promise<number> {
  const result = await graphqlFetch<{ generateLessonPlansFromScheme: number }>(
    GENERATE_PLANS,
    { input },
    subdomain,
  )
  return result.generateLessonPlansFromScheme
}

export async function fetchAcademicSupervision(
  subdomain: string,
  termId: string,
  weekStartDate?: string,
  filter?: SupervisionFilter,
): Promise<AcademicSupervision> {
  const result = await graphqlFetch<{
    academicSupervisionOverview: AcademicSupervision
  }>(GET_SUPERVISION, { termId, weekStartDate, filter }, subdomain)
  return result.academicSupervisionOverview
}

export async function fetchLessonPlansForReview(
  subdomain: string,
  termId: string,
  status?: LessonPlanStatus,
  filter?: SupervisionFilter,
): Promise<LessonPlan[]> {
  const result = await graphqlFetch<{ getLessonPlansForReview: LessonPlan[] }>(
    GET_PLANS_FOR_REVIEW,
    { termId, status, filter },
    subdomain,
  )
  return result.getLessonPlansForReview ?? []
}

export async function reviewLessonPlan(
  subdomain: string,
  input: {
    lessonPlanId: string
    action: LessonReviewAction
    comment?: string
  },
): Promise<LessonPlan> {
  const result = await graphqlFetch<{ reviewLessonPlan: LessonPlan }>(
    REVIEW_LESSON_PLAN,
    { input },
    subdomain,
  )
  return result.reviewLessonPlan
}
