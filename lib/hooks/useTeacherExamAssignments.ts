'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import {
  fetchTeacherExamAssignments,
  type TeacherExamAssignments,
} from '@/lib/exams/examSessions'

export function useTeacherExamAssignments(
  options?: { enabled?: boolean },
) {
  const params = useParams()
  const subdomain = params.subdomain as string

  return useQuery<TeacherExamAssignments, Error>({
    queryKey: ['teacherExamAssignments', subdomain],
    queryFn: () => fetchTeacherExamAssignments(subdomain),
    enabled: options?.enabled !== false && Boolean(subdomain),
    staleTime: 60_000,
  })
}
