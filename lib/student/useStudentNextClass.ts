'use client'

import { useCallback, useMemo } from 'react'
import { useActiveTerm } from '@/lib/hooks/useActiveTerm'
import { useCurrentStudent } from '@/lib/hooks/useCurrentStudent'
import { useStudentTimetable } from '@/lib/hooks/useStudentTimetable'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import {
  transformStudentTimetable,
  useTimetableCore,
  type CurrentLessonStatus,
  type NextLessonInfo,
} from '@/lib/timetable'

export function useStudentNextClass(): {
  nextLesson: NextLessonInfo | null
  currentStatus: CurrentLessonStatus
  formattedTime: string
  loading: boolean
  error: string | null
} {
  const { student, loading: studentLoading, error: studentError } =
    useCurrentStudent()
  const {
    activeTerm,
    loading: termLoading,
    error: termError,
    refetch: refetchTerm,
  } = useActiveTerm()
  const {
    timetable: rawTimetable,
    loading: timetableLoading,
    error: timetableError,
    refetch: refetchTimetable,
  } = useStudentTimetable(
    activeTerm?.id || null,
    student?.gradeId || null,
    student?.tenantStreamId || null,
    student?.streamName || null,
  )

  const unifiedTimetable = useMemo(() => {
    if (!rawTimetable) return null
    return transformStudentTimetable(
      rawTimetable,
      activeTerm?.id || '',
      activeTerm?.name || '',
      [],
    )
  }, [rawTimetable, activeTerm?.id, activeTerm?.name])

  const refetchAll = useCallback(() => {
    refetchTerm()
    refetchTimetable()
  }, [refetchTerm, refetchTimetable])

  useDomainRealtime({
    onTimetablePublished: refetchAll,
    onTimetableUnpublished: refetchAll,
  })

  const core = useTimetableCore({
    viewType: 'student',
    timetableData: unifiedTimetable,
    isLoading: studentLoading || termLoading || timetableLoading,
    error: studentError || termError || timetableError || null,
    refetch: refetchTimetable,
  })

  return {
    nextLesson: core.nextLesson,
    currentStatus: core.currentStatus,
    formattedTime: core.formattedTime,
    loading: core.isLoading,
    error: core.error,
  }
}
