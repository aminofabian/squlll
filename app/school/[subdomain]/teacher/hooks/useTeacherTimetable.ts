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

export interface WholeSchoolTimetableResponse {
  getWholeSchoolTimetable: {
    timeSlots: TimeSlot[]
    breaks: TimetableBreak[]
    entries: TimetableEntry[]
    grades: TimetableGrade[]
    lastUpdated: string
  }
}

export interface UseTeacherTimetableResult {
  data: WholeSchoolTimetableResponse['getWholeSchoolTimetable'] | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const GET_WHOLE_SCHOOL_TIMETABLE_QUERY = `
  query GetWholeSchoolTimetable($termId: ID!) {
    getWholeSchoolTimetable(termId: $termId) {
      timeSlots {
        id
        periodNumber
        displayTime
        startTime
        endTime
        color
      }
      breaks {
        id
        name
        type
        dayOfWeek
        afterPeriod
        durationMinutes
        icon
        color
      }
      entries {
        id
        gradeId
        subjectId
        teacherId
        timeSlotId
        dayOfWeek
        roomNumber
        grade {
          id
          name
          gradeLevel {
            name
          }
        }
        subject {
          id
          name
        }
        teacher {
          id
          fullName
          firstName
          lastName
          email
          phoneNumber
          gender
          department
          role
          isActive
          user {
            name
          }
        }
        timeSlot {
          id
          periodNumber
          displayTime
        }
      }
      grades {
        id
        name
        displayName
        level
      }
      lastUpdated
    }
  }
`

export function useTeacherTimetable(subdomain: string): UseTeacherTimetableResult {
  const { selectedTerm } = useSelectedTerm()
  const { teacher } = useTeacherData()
  const [rawData, setRawData] = useState<WholeSchoolTimetableResponse['getWholeSchoolTimetable'] | null>(null)
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
      const timetableResult = await graphqlFetch<WholeSchoolTimetableResponse>(
        GET_WHOLE_SCHOOL_TIMETABLE_QUERY,
        { termId: selectedTerm.id },
        subdomain
      )

      // Format time helper (same as admin store)
      const formatTime = (timeStr: string) => {
        if (!timeStr) return ''
        // If already in HH:MM format, return as is
        if (timeStr.length === 5) return timeStr
        // If in HH:MM:SS format, remove seconds
        if (timeStr.length === 8) return timeStr.substring(0, 5)
        return timeStr
      }

      const timetableData = timetableResult.getWholeSchoolTimetable

      // Format time slots to ensure consistent format
      const formattedTimeSlots = (timetableData.timeSlots || []).map((slot: any) => ({
        id: slot.id,
        periodNumber: slot.periodNumber,
        displayTime: slot.displayTime || `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
        startTime: formatTime(slot.startTime),
        endTime: formatTime(slot.endTime),
        color: slot.color || null
      }))

      console.log('Fetched whole school timetable:', {
        timeSlotsCount: formattedTimeSlots.length,
        entriesCount: timetableData.entries?.length || 0,
        breaksCount: timetableData.breaks?.length || 0,
        gradesCount: timetableData.grades?.length || 0
      })

      const finalData = {
        ...timetableData,
        timeSlots: formattedTimeSlots
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

