'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import {
  fetchExamSession,
  fetchExamSessions,
  type ExamSessionRecord,
  type ExamSessionStatus,
} from '@/lib/exams/examSessions'
import type { AssessType } from '@/lib/hooks/useTeacherActivity'

export function useExamSessions(
  filter?: {
    academicYear?: string
    term?: number
    type?: AssessType
    status?: ExamSessionStatus
    tenantGradeLevelId?: string
  },
  options?: { enabled?: boolean },
) {
  const params = useParams()
  const subdomain = params.subdomain as string

  return useQuery({
    queryKey: ['examSessions', subdomain, filter],
    queryFn: () => fetchExamSessions(subdomain, filter),
    enabled: options?.enabled !== false && Boolean(subdomain),
    staleTime: 30_000,
  })
}

export function useExamSession(sessionId: string | undefined) {
  const params = useParams()
  const subdomain = params.subdomain as string

  return useQuery({
    queryKey: ['examSession', subdomain, sessionId],
    queryFn: (): Promise<ExamSessionRecord> =>
      fetchExamSession(subdomain, sessionId!),
    enabled: Boolean(subdomain && sessionId),
    staleTime: 15_000,
  })
}
