'use client'

import { useMemo } from 'react'
import { getCookie } from '@/lib/utils'
import { useParentChildMarks } from './useParentChildMarks'
import { useParentChildSchedule } from './useParentChildSchedule'
import type { ParentPortalChild } from './types'
import {
  averageGpaFromSessions,
  mapLessonsToDashboardSchedule,
  mapMarksToDashboardGrades,
  type DashboardGradeItem,
  type DashboardScheduleItem,
} from './mapDashboardData'

export function useParentDashboardData(
  subdomain: string,
  child: ParentPortalChild | undefined,
  enabled: boolean,
) {
  const studentId =
    enabled && child?.studentId ? child.studentId : null
  const gradeId = enabled && child?.gradeId ? child.gradeId : null

  const {
    todayLessons,
    timeSlots,
    loading: scheduleLoading,
  } = useParentChildSchedule(gradeId)
  const { sessions, loading: marksLoading } = useParentChildMarks(
    subdomain,
    studentId,
  )

  const todaySchedule = useMemo((): DashboardScheduleItem[] => {
    if (!studentId) return []
    return mapLessonsToDashboardSchedule(todayLessons, timeSlots)
  }, [studentId, todayLessons, timeSlots])

  const recentGrades = useMemo((): DashboardGradeItem[] => {
    if (!studentId) return []
    return mapMarksToDashboardGrades(sessions)
  }, [studentId, sessions])

  const averageGpa = useMemo(() => {
    if (!studentId) return null
    return averageGpaFromSessions(sessions)
  }, [studentId, sessions])

  const parentName = useMemo(() => {
    const name = getCookie('userName')
    return name?.split(' ')[0] ?? 'Parent'
  }, [])

  return {
    todaySchedule,
    recentGrades,
    averageGpa,
    parentName,
    loading: scheduleLoading || marksLoading,
    hasRealData: Boolean(studentId),
  }
}
