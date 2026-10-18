import type { LessonActivity } from '@/lib/lesson-planning/api'
import type { EDITOR_SECTIONS } from './constants/editorSections'

export type EditorNavItem = (typeof EDITOR_SECTIONS)[number] & { complete: boolean }

export type LessonPlanForm = {
  durationMinutes: number
  strand: string
  subStrand: string
  topic: string
  subTopic: string
  specificLearningOutcomes: string
  keyInquiryQuestion: string
  activities: LessonActivity[]
  resources: string
  assessment: string
  differentiation: string
  homework: string
}
