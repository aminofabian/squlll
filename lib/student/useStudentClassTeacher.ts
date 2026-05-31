'use client'

import { useCallback, useEffect, useState } from 'react'
import { useCurrentStudent } from '@/lib/hooks/useCurrentStudent'
import { fetchClassTeacherForGrade } from './studentClassTeacher'
import type { ClassTeacherInfo } from './types'

export function useStudentClassTeacher(subdomain: string) {
  const { student, loading: studentLoading, error: studentError } =
    useCurrentStudent()
  const [classTeacher, setClassTeacher] = useState<ClassTeacherInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subdomain || !student?.gradeId) {
      setClassTeacher(null)
      return
    }
    setError(null)
    try {
      const teacher = await fetchClassTeacherForGrade(subdomain, student.gradeId)
      setClassTeacher(teacher)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load class teacher')
      setClassTeacher(null)
    }
  }, [subdomain, student?.gradeId])

  useEffect(() => {
    if (studentLoading) return
    let cancelled = false
    setLoading(true)
    void load().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [load, studentLoading])

  return {
    classTeacher,
    loading: studentLoading || loading,
    error: studentError ?? error,
    refetch: load,
  }
}
