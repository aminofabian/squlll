'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { fetchAssessments } from '@/lib/exams/assessments'
import { mapAssessmentToExamListItem, type ExamListItem } from '@/lib/exams/mapAssessment'
import type { AssessType } from '@/lib/hooks/useTeacherActivity'

export function useAssessments(filter?: {
  type?: AssessType
  tenantGradeLevelId?: string
  tenantSubjectId?: string
  term?: number
  academicYear?: string
}) {
  const params = useParams()
  const subdomain = params.subdomain as string

  return useQuery({
    queryKey: ['assessments', subdomain, filter],
    queryFn: async (): Promise<ExamListItem[]> => {
      const records = await fetchAssessments(subdomain, filter)
      return records.map(mapAssessmentToExamListItem)
    },
    enabled: Boolean(subdomain),
    staleTime: 30_000,
  })
}
