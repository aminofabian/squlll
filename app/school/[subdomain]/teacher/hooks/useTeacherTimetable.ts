'use client'

import { useState, useEffect } from 'react'
import { graphqlFetch } from '../utils/graphqlFetch'
import { schoolScheduleFromWeekTemplates } from '@/lib/timetable/transformers'
import { useSelectedTerm } from '@/lib/hooks/useSelectedTerm'

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
  isDoublePeriod?: boolean
  notes?: string
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

interface TeacherTimetableEntryApi {
  id: string
  subjectName: string
  subjectColor: string
  gradeLevelName: string
  streamName: string | null
  roomName: string | null
  dayOfWeek: number
  dayName: string
  periodNumber: number
  startTime: string
  endTime: string
}

interface TeacherTimetableDayApi {
  dayOfWeek: number
  dayName: string
  entries: TeacherTimetableEntryApi[]
}

interface MyTimetableResponse {
  getMyTimetable: {
    teacherId: string
    teacherName: string
    teacherEmail: string
    termId: string
    termName: string
    totalClasses: number
    timetablePublishedAt: string | null
    generatedAt: string
    schedule: TeacherTimetableDayApi[]
  }
}

const GET_WEEK_TEMPLATES_FOR_TEACHER_QUERY = `
  query GetWeekTemplatesForTeacher($input: GetWeekTemplatesInput!) {
    getWeekTemplates(input: $input) {
      id
      termId
      dayTemplates {
        dayOfWeek
        startTime
        periods {
          id
          periodNumber
          startTime
          endTime
          label
        }
        breaks {
          id
          name
          type
          afterPeriod
          durationMinutes
          icon
          applyToAllDays
          dayTemplateId
        }
      }
    }
  }
`

interface WeekTemplatesForTeacherResponse {
  getWeekTemplates: Array<{
    id: string
    termId: string
    dayTemplates?: Array<{
      dayOfWeek: number
      startTime?: string
      periods?: Array<{
        id: string
        periodNumber: number
        startTime: string
        endTime: string
        label?: string | null
      }>
      breaks?: Array<{
        id: string
        name: string
        type: string
        afterPeriod: number
        durationMinutes: number
        icon?: string | null
        applyToAllDays?: boolean
        dayTemplateId?: string | null
      }>
    }>
  }>
}

const GET_SCHOOL_TIMETABLE_FOR_TEACHER_QUERY = `
  query GetSchoolTimetableForTeacher($input: GetSchoolTimetableInput!) {
    getSchoolTimetable(input: $input) {
      termId
      termName
      schedule {
        dayTemplate {
          dayOfWeek
          dayName
        }
        slots {
          type
          id
          periodNumber
          startTime
          endTime
          label
          name
          breakType
          afterPeriod
          durationMinutes
          icon
          entry {
            id
            isDoublePeriod
            subject {
              id
              name
            }
            teacher {
              id
              name
            }
            gradeLevel {
              id
              name
              shortName
            }
            stream {
              id
              name
            }
            room {
              id
              name
            }
          }
        }
      }
    }
  }
`

interface SchoolTimetableResponse {
  getSchoolTimetable: {
    termId: string
    termName: string
    schedule: Array<{
      dayTemplate: { dayOfWeek: number; dayName?: string }
      slots: Array<{
        type: string
        id?: string | null
        periodNumber?: number | null
        startTime: string
        endTime: string
        name?: string | null
        breakType?: string | null
        afterPeriod?: number | null
        durationMinutes?: number | null
        icon?: string | null
        entry?: {
          id: string
          isDoublePeriod?: boolean | null
          subject?: { id?: string; name?: string } | null
          teacher?: { id?: string; name?: string } | null
          gradeLevel?: { id?: string; name?: string; shortName?: string } | null
          stream?: { id?: string; name?: string } | null
          room?: { id?: string; name?: string } | null
        } | null
      }>
    }>
  }
}

export interface TeacherSchoolSchedule {
  termId: string
  termName: string
  teacherId: string
  schedule: SchoolTimetableResponse['getSchoolTimetable']['schedule']
}

export interface UseTeacherTimetableResult {
  data: {
    timeSlots: TimeSlot[]
    entries: TimetableEntry[]
    breaks: TimetableBreak[]
    grades: TimetableGrade[]
    lastUpdated: string
    teacherName: string
    teacherId: string
    totalClasses: number
    timetablePublishedAt: string | null
    mySchedule: TeacherTimetableDayApi[]
    schoolSchedule: TeacherSchoolSchedule | null
  } | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const GET_MY_TIMETABLE_QUERY = `
  query GetMyTimetable($termId: ID!) {
    getMyTimetable(termId: $termId) {
      teacherId
      teacherName
      teacherEmail
      termId
      termName
      totalClasses
      timetablePublishedAt
      generatedAt
      schedule {
        dayOfWeek
        dayName
        entries {
          id
          subjectName
          subjectColor
          gradeLevelName
          streamName
          roomName
          dayOfWeek
          dayName
          periodNumber
          startTime
          endTime
        }
      }
    }
  }
`

function myScheduleFromEntries(
  entries: TimetableEntry[],
): TeacherTimetableDayApi[] {
  const byDay = new Map<number, TeacherTimetableEntryApi[]>()
  for (const e of entries) {
    const list = byDay.get(e.dayOfWeek) ?? []
    const [start, end] = e.timeSlot.displayTime.split(' - ')
    list.push({
      id: e.id,
      subjectName: e.subject.name,
      subjectColor: '',
      gradeLevelName: e.grade.gradeLevel?.name ?? e.grade.name,
      streamName: e.grade.name.includes(' · ')
        ? e.grade.name.split(' · ')[1]
        : null,
      roomName: e.roomNumber,
      dayOfWeek: e.dayOfWeek,
      dayName: '',
      periodNumber: e.timeSlot.periodNumber,
      startTime: start?.trim() ?? '',
      endTime: end?.trim() ?? '',
    })
    byDay.set(e.dayOfWeek, list)
  }
  return [...byDay.entries()].map(([dayOfWeek, dayEntries]) => ({
    dayOfWeek,
    dayName: '',
    entries: dayEntries,
  }))
}

function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  if (timeStr.length === 5) return timeStr
  if (timeStr.length >= 8) return timeStr.substring(0, 5)
  return timeStr
}

function mapMyTimetableToHookData(
  api: MyTimetableResponse['getMyTimetable'],
): UseTeacherTimetableResult['data'] {
  const periodTimes = new Map<number, { start: string; end: string }>()
  const gradeNames = new Set<string>()
  const entries: TimetableEntry[] = []

  for (const day of api.schedule ?? []) {
    for (const e of day.entries ?? []) {
      if (!periodTimes.has(e.periodNumber)) {
        periodTimes.set(e.periodNumber, {
          start: formatTime(e.startTime),
          end: formatTime(e.endTime),
        })
      }

      const gradeLabel = e.streamName
        ? `${e.gradeLevelName} · ${e.streamName}`
        : e.gradeLevelName
      gradeNames.add(gradeLabel)

      const start = formatTime(e.startTime)
      const end = formatTime(e.endTime)
      const timeSlotId = `period-${e.periodNumber}`
      const displayTime = `${start} - ${end}`

      entries.push({
        id: e.id,
        gradeId: gradeLabel,
        subjectId: e.subjectName,
        teacherId: api.teacherId,
        timeSlotId,
        dayOfWeek: e.dayOfWeek,
        roomNumber: e.roomName,
        isDoublePeriod: false,
        grade: {
          id: gradeLabel,
          name: gradeLabel,
          gradeLevel: { name: e.gradeLevelName },
        },
        subject: {
          id: e.subjectName,
          name: e.subjectName,
        },
        teacher: {
          id: api.teacherId,
          fullName: api.teacherName,
          firstName: null,
          lastName: null,
          email: api.teacherEmail,
          phoneNumber: null,
          gender: null,
          department: null,
          role: 'teacher',
          isActive: true,
          user: { name: api.teacherName },
        },
        timeSlot: {
          id: timeSlotId,
          periodNumber: e.periodNumber,
          displayTime,
        },
      })
    }
  }

  const timeSlots: TimeSlot[] = Array.from(periodTimes.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([periodNumber, times]) => ({
      id: `period-${periodNumber}`,
      periodNumber,
      displayTime: `${times.start} - ${times.end}`,
      startTime: times.start,
      endTime: times.end,
      color: null,
    }))

  const grades: TimetableGrade[] = Array.from(gradeNames).map((name, index) => ({
    id: name,
    name,
    displayName: name,
    level: index,
  }))

  return {
    timeSlots,
    entries,
    breaks: [],
    grades,
    lastUpdated: api.generatedAt || new Date().toISOString(),
    teacherName: api.teacherName,
    teacherId: api.teacherId,
    totalClasses: api.totalClasses,
    timetablePublishedAt: api.timetablePublishedAt ?? null,
    mySchedule: api.schedule ?? [],
    schoolSchedule: null,
  }
}

export function useTeacherTimetable(subdomain: string): UseTeacherTimetableResult {
  const { selectedTerm } = useSelectedTerm()
  const [data, setData] = useState<UseTeacherTimetableResult['data']>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTimetable = async () => {
    if (!selectedTerm?.id) {
      setError('No term selected')
      setData(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const myResult = await graphqlFetch<MyTimetableResponse>(
        GET_MY_TIMETABLE_QUERY,
        { termId: selectedTerm.id },
        subdomain,
      )
      const my = myResult.getMyTimetable
      const mapped = mapMyTimetableToHookData(my)

      if (
        mapped.mySchedule.length === 0 &&
        mapped.entries.length > 0
      ) {
        mapped.mySchedule = myScheduleFromEntries(mapped.entries)
      }

      let structureTermId = selectedTerm.id
      let structureTermName = selectedTerm.name
      let schedule: SchoolTimetableResponse['getSchoolTimetable']['schedule'] = []

      try {
        const schoolResult = await graphqlFetch<SchoolTimetableResponse>(
          GET_SCHOOL_TIMETABLE_FOR_TEACHER_QUERY,
          {
            input: { termId: selectedTerm.id },
          },
          subdomain,
        )
        structureTermId = schoolResult.getSchoolTimetable.termId
        structureTermName = schoolResult.getSchoolTimetable.termName
        schedule = schoolResult.getSchoolTimetable.schedule ?? []
      } catch (schoolErr) {
        console.warn('School timetable structure unavailable:', schoolErr)
      }

      if (schedule.length === 0) {
        try {
          const weekResult = await graphqlFetch<WeekTemplatesForTeacherResponse>(
            GET_WEEK_TEMPLATES_FOR_TEACHER_QUERY,
            {
              input: {
                termId: selectedTerm.id,
                includeDetails: true,
              },
            },
            subdomain,
          )
          schedule = schoolScheduleFromWeekTemplates(
            weekResult.getWeekTemplates ?? [],
          )
        } catch (weekErr) {
          console.warn('Week templates (periods/breaks) unavailable:', weekErr)
        }
      }

      if (schedule.length > 0) {
        mapped.schoolSchedule = {
          termId: structureTermId,
          termName: structureTermName,
          teacherId: my.teacherId,
          schedule,
        }
      }

      setData(mapped)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch timetable'
      console.error('Error fetching teacher timetable:', err)
      setError(errorMessage)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedTerm?.id && subdomain) {
      void fetchTimetable()
    }
  }, [selectedTerm?.id, subdomain])

  return {
    data,
    loading,
    error,
    refetch: fetchTimetable,
  }
}
