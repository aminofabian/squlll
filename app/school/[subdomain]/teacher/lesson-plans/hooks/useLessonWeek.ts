import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchMyLessonWeek, type LessonPlanWeek } from '@/lib/lesson-planning/api'
import { addDays } from '../utils/addDays'
import { pickDefaultDate } from '../utils/pickDefaultDate'

const DAYS_PER_WEEK = 7

export function useLessonWeek(subdomain: string, termId: string | undefined, termsLoading: boolean) {
  const [anchor, setAnchor] = useState<string | undefined>(undefined)
  const [week, setWeek] = useState<LessonPlanWeek | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState('')

  const loadWeek = useCallback(
    async (signal?: { cancelled: boolean }) => {
      if (!subdomain || !termId) return
      setLoading(true)
      setError(null)
      try {
        const data = await fetchMyLessonWeek(subdomain, termId, anchor)
        if (signal?.cancelled) return
        setWeek(data)
        setSelectedDate((current) => pickDefaultDate(data.days, data.today, current))
      } catch (err) {
        if (signal?.cancelled) return
        setError(err instanceof Error ? err.message : 'Could not load your timetable')
        setWeek(null)
      } finally {
        if (!signal?.cancelled) setLoading(false)
      }
    },
    [subdomain, termId, anchor],
  )

  useEffect(() => {
    if (termsLoading) return
    if (!termId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWeek(null)
      setLoading(false)
      return
    }
    const signal = { cancelled: false }
    void loadWeek(signal)
    return () => {
      signal.cancelled = true
    }
  }, [loadWeek, termId, termsLoading])

  const shiftWeek = (direction: 1 | -1) => {
    if (week) setAnchor(addDays(week.weekStartDate, direction * DAYS_PER_WEEK))
  }

  const weekPeriods = useMemo(() => week?.days.flatMap((day) => day.periods) ?? [], [week])

  return {
    week,
    weekPeriods,
    loading,
    error,
    setError,
    selectedDate,
    setSelectedDate,
    reloadWeek: loadWeek,
    previousWeek: () => shiftWeek(-1),
    nextWeek: () => shiftWeek(1),
    thisWeek: () => setAnchor(undefined),
  }
}
