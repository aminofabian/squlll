import type { ExamSessionTemplate } from '@/lib/exams/examSessions'
import type { AssessType } from '@/lib/hooks/useTeacherActivity'

export type SessionTemplatePreset = {
  examType: AssessType
  nameSuggestion: string
  totalMarks: number
  passingMarks: number
  description: string
  /** Shown in the “template applied” banner */
  appliedSummary: string[]
}

export const SESSION_TEMPLATE_PRESETS: Record<
  ExamSessionTemplate,
  SessionTemplatePreset
> = {
  CAT: {
    examType: 'CA',
    nameSuggestion: 'Class Assessment Test',
    totalMarks: 30,
    passingMarks: 12,
    description: 'Short classroom test — typically one of several term CATs.',
    appliedSummary: ['Type: Continuous assessment'],
  },
  QUIZ: {
    examType: 'CA',
    nameSuggestion: 'Quiz',
    totalMarks: 20,
    passingMarks: 8,
    description: 'Brief in-class quiz on recent topics.',
    appliedSummary: ['Type: Continuous assessment'],
  },
  ASSIGNMENT: {
    examType: 'CA',
    nameSuggestion: 'Assignment',
    totalMarks: 30,
    passingMarks: 12,
    description: 'Take-home or class assignment marked for the grade book.',
    appliedSummary: ['Type: Continuous assessment'],
  },
  PRACTICAL: {
    examType: 'CA',
    nameSuggestion: 'Practical Assessment',
    totalMarks: 50,
    passingMarks: 20,
    description: 'Lab, workshop, or skills-based practical session.',
    appliedSummary: ['Type: Continuous assessment'],
  },
  PROJECT: {
    examType: 'CA',
    nameSuggestion: 'Project Assessment',
    totalMarks: 50,
    passingMarks: 20,
    description: 'Extended project work assessed over the term.',
    appliedSummary: ['Type: Continuous assessment'],
  },
  END_OF_TERM: {
    examType: 'EXAM',
    nameSuggestion: 'End of Term Examination',
    totalMarks: 100,
    passingMarks: 40,
    description: 'Summative end-of-term assessment for report cards.',
    appliedSummary: ['Type: End-of-term exam'],
  },
  MID_TERM: {
    examType: 'CA',
    nameSuggestion: 'Mid-Term Assessment',
    totalMarks: 100,
    passingMarks: 40,
    description: 'Mid-term progress check — continuous assessment style.',
    appliedSummary: ['Type: Continuous assessment'],
  },
  MOCK_EXAM: {
    examType: 'EXAM',
    nameSuggestion: 'Mock Examination',
    totalMarks: 100,
    passingMarks: 40,
    description: 'Full-length practice before national exams.',
    appliedSummary: ['Type: End-of-term exam'],
  },
  KCSE_TRIAL: {
    examType: 'EXAM',
    nameSuggestion: 'KCSE Trial Examination',
    totalMarks: 100,
    passingMarks: 40,
    description: 'KCSE-format trial for Form 4 candidates.',
    appliedSummary: ['Type: End-of-term exam'],
  },
}

export function buildSuggestedExamSessionName(input: {
  template: ExamSessionTemplate
  termName?: string | null
  academicYearName?: string | null
}): string {
  const templateLabel = SESSION_TEMPLATE_PRESETS[input.template].nameSuggestion
  return [input.termName?.trim(), templateLabel, input.academicYearName?.trim()]
    .filter(Boolean)
    .join(' ')
}

/** Stable display order for the quick-start grid. */
export const SESSION_TEMPLATE_ORDER: ExamSessionTemplate[] = [
  'CAT',
  'QUIZ',
  'ASSIGNMENT',
  'PRACTICAL',
  'PROJECT',
  'MID_TERM',
  'END_OF_TERM',
  'MOCK_EXAM',
  'KCSE_TRIAL',
]

export const SESSION_TEMPLATE_LABELS: Record<ExamSessionTemplate, string> = {
  CAT: 'CAT',
  QUIZ: 'Quiz',
  ASSIGNMENT: 'Assignment',
  PRACTICAL: 'Practical',
  PROJECT: 'Project',
  END_OF_TERM: 'End of term',
  MID_TERM: 'Mid-term',
  MOCK_EXAM: 'Mock exam',
  KCSE_TRIAL: 'KCSE trial',
}

export const SESSION_TEMPLATE_HINTS: Record<ExamSessionTemplate, string> = {
  CAT: 'Class assessment test',
  QUIZ: 'Short in-class quiz',
  ASSIGNMENT: 'Marked take-home work',
  PRACTICAL: 'Lab or skills session',
  PROJECT: 'Extended project work',
  END_OF_TERM: 'Full term assessment for report cards',
  MID_TERM: 'Half-term progress check',
  MOCK_EXAM: 'Practice run before national exams',
  KCSE_TRIAL: 'KCSE-style trial for Form 4',
}
