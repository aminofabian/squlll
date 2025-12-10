'use client'

import { useState, useEffect, useMemo } from 'react'
import { graphqlFetch } from '../utils/graphqlFetch'
import { useSelectedTerm } from '@/lib/hooks/useSelectedTerm'
import { useTeacherData } from '@/lib/hooks/useTeacherData'

// Type definitions matching the GraphQL response
export interface TimeSlot {
  id: string
  periodNumber: number
  displayTime: string
  startTime: string
  endTime: string
  color: string | null
}

export interface TimetableBreak {
  id: string
  name: string
  type: string
  dayOfWeek: number
  afterPeriod: number
  durationMinutes: number
  icon: string
  color: string | null
}

export interface TimetableGrade {
  id: string
  name: string
  displayName: string
  level: number
}

export interface TimetableEntry {
  id: string
  gradeId: string
  subjectId: string
  teacherId: string
  timeSlotId: string
  dayOfWeek: number
  roomNumber: string | null
  grade: {
    id: string
    name: string
    gradeLevel: {
      name: string
    }
  }
  subject: {
    id: string
    name: string
  }
  teacher: {
    id: string
    fullName: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    phoneNumber: string | null
    gender: string | null
    department: string | null
    role: string | null
    isActive: boolean | null
    user: {
      name: string
    } | null
  }
  timeSlot: {
    id: string
    periodNumber: number
    displayTime: string
  }
}

export interface SchoolTimetableResponse {
  getSchoolTimetable: {
    termId: string
    termName: string
    totalDays: number
    totalPeriods: number
    totalOccupiedSlots: number
    totalFreeSlots: number
    generatedAt: string
    schedule: Array<{
      dayTemplate: {
        id: string
        dayOfWeek: number
        startTime: string
        periodCount: number
        defaultPeriodDuration: number
      }
      periods: Array<{
        period: {
          id: string
          periodNumber: number
          startTime: string
          endTime: string
          label: string | null
        }
        entry: {
          id: string
          subject: { id: string; name: string }
          teacher: { id: string; user: { name: string; email: string } | null }
          room: { id: string; name: string } | null
        } | null
        isBreak: boolean
        breakInfo: {
          id: string
          name: string
          type: string
          durationMinutes: number
          icon?: string | null
          color?: string | null
        } | null
      }>
      breaks: Array<{
        id: string
        name: string
        type: string
        afterPeriod: number
        durationMinutes: number
      }>
      totalPeriods: number
      occupiedPeriods: number
      freePeriods: number
    }>
  }
}

export interface UseTeacherTimetableResult {
  data: {
    timeSlots: TimeSlot[]
    entries: TimetableEntry[]
    breaks: TimetableBreak[]
    grades: TimetableGrade[]
    lastUpdated: string
  } | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const GET_SCHOOL_TIMETABLE_QUERY = `
  query GetSchoolTimetable($input: GetSchoolTimetableInput!) {
    getSchoolTimetable(input: $input) {
      termId
      termName
      totalDays
      totalPeriods
      totalOccupiedSlots
      totalFreeSlots
      generatedAt
      schedule {
        dayTemplate {
          id
          dayOfWeek
          startTime
          periodCount
          defaultPeriodDuration
        }
        periods {
          period {
        id
        periodNumber
        startTime
        endTime
            label
          }
          entry {
            id
            subject { id name }
            teacher { id user { name email } }
            room { id name }
      }
          isBreak
          breakInfo {
        id
        name
        type
        durationMinutes
        icon
        color
      }
        }
        breaks {
          id
          name
          type
          afterPeriod
          durationMinutes
        }
        totalPeriods
        occupiedPeriods
        freePeriods
      }
    }
  }
`

export function useTeacherTimetable(subdomain: string): UseTeacherTimetableResult {
  const { selectedTerm } = useSelectedTerm()
  const { teacher } = useTeacherData()
  const [rawData, setRawData] = useState<UseTeacherTimetableResult['data']>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter entries by current teacher ID
  const data = useMemo(() => {
    if (!rawData || !teacher?.id) {
      return rawData
    }

    // Filter entries to only show current teacher's schedule
    const filteredEntries = (rawData.entries || []).filter(
      entry => entry.teacherId === teacher.id
    )

    console.log('Filtered timetable entries:', {
      totalEntries: rawData.entries?.length || 0,
      teacherEntries: filteredEntries.length,
      teacherId: teacher.id
    })

    return {
      ...rawData,
      entries: filteredEntries
    }
  }, [rawData, teacher?.id])

  const fetchTimetable = async () => {
    if (!selectedTerm?.id) {
      setError('No term selected')
      setRawData(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch whole school timetable data
      const timetableResult = await graphqlFetch<SchoolTimetableResponse>(
        GET_SCHOOL_TIMETABLE_QUERY,
        { input: { termId: selectedTerm.id } },
        subdomain
      )

      const formatTime = (timeStr: string) => {
        if (!timeStr) return ''
        // If already in HH:MM format, return as is
        if (timeStr.length === 5) return timeStr
        // If in HH:MM:SS format, remove seconds
        if (timeStr.length === 8) return timeStr.substring(0, 5)
        return timeStr
      }

      const timetableData = timetableResult.getSchoolTimetable
      const schedule = timetableData.schedule || []

      const timeSlotMap = new Map<string, TimeSlot>()
      const entries: TimetableEntry[] = []

      schedule.forEach((dayItem: any) => {
        const dayOfWeek = dayItem.dayTemplate?.dayOfWeek
        ;(dayItem.periods || []).forEach((p: any) => {
          const period = p?.period
          if (period?.id && !timeSlotMap.has(period.id)) {
            timeSlotMap.set(period.id, {
              id: period.id,
              periodNumber: period.periodNumber,
              displayTime: `${formatTime(period.startTime)} - ${formatTime(period.endTime)}`,
              startTime: formatTime(period.startTime),
              endTime: formatTime(period.endTime),
              color: null,
            })
          }

          if (p?.entry && period?.id) {
            const subjectId = p.entry.subject?.id
            const teacherId = p.entry.teacher?.id
            if (!subjectId || !teacherId) return
            entries.push({
              id: p.entry.id,
              gradeId: '', // not provided in new response
              subjectId,
              teacherId,
              timeSlotId: period.id,
              dayOfWeek: typeof dayOfWeek === 'number' ? dayOfWeek : 1,
              roomNumber: p.entry.room?.name || undefined,
              isDoublePeriod: false,
              notes: undefined,
            })
          }
        })
      })

      const formattedTimeSlots = Array.from(timeSlotMap.values())

      console.log('Fetched whole school timetable:', {
        timeSlotsCount: formattedTimeSlots.length,
        entriesCount: timetableData.entries?.length || 0,
        breaksCount: timetableData.breaks?.length || 0,
        gradesCount: timetableData.grades?.length || 0
      })

      const finalData = {
        ...timetableData,
        timeSlots: formattedTimeSlots,
        entries,
        breaks: [],
        grades: [],
        lastUpdated: timetableData.generatedAt || new Date().toISOString(),
      }

      setRawData(finalData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch timetable'
      console.error('Error fetching whole school timetable:', err)
      setError(errorMessage)
      setRawData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedTerm?.id && subdomain) {
      fetchTimetable()
    }
  }, [selectedTerm?.id, subdomain])

  return {
    data,
    loading,
    error,
    refetch: fetchTimetable,
  }
}

