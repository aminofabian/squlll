'use client'

import { useMemo } from 'react'
import { useActiveTerm } from '@/lib/hooks/useActiveTerm'
import { useStudentTimetable } from '@/lib/hooks/useStudentTimetable'
import {
  transformStudentTimetable,
  getCurrentDayOfWeek,
  type TimetableLesson,
  type TimetableCell,
} from '@/lib/timetable'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'

export function useParentChildSchedule(gradeId: string | null) {
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
  } = useStudentTimetable(activeTerm?.id || null, gradeId || null)

  const unifiedTimetable = useMemo(() => {
    if (!rawTimetable) return null
    return transformStudentTimetable(
      rawTimetable,
      activeTerm?.id || '',
      activeTerm?.name || '',
      [],
    )
  }, [rawTimetable, activeTerm?.id, activeTerm?.name])

  const todayLessons = useMemo((): TimetableLesson[] => {
    if (!unifiedTimetable) return []
    const dayOfWeek = getCurrentDayOfWeek(new Date())
    if (dayOfWeek === null) return []
    const day = unifiedTimetable.days.find((d) => d.dayOfWeek === dayOfWeek)
    if (!day) return []
    return day.cells
      .filter(
        (cell): cell is TimetableCell =>
          cell !== null && cell.type === 'lesson' && Boolean(cell.lesson),
      )
      .map((cell) => cell.lesson!)
      .sort((a, b) => a.periodNumber - b.periodNumber)
  }, [unifiedTimetable])

  const refetchAll = () => {
    refetchTerm()
    refetchTimetable()
  }

  useDomainRealtime({
    onTimetablePublished: () => refetchAll(),
    onTimetableUnpublished: () => refetchAll(),
  })

  return {
    todayLessons,
    timeSlots: unifiedTimetable?.timeSlots ?? [],
    termName: activeTerm?.name ?? null,
    loading: termLoading || timetableLoading,
    error: termError || timetableError,
    refetch: refetchAll,
  }
}
