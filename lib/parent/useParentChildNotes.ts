'use client'

import { useCallback, useEffect, useState } from 'react'
import { mapStudentNoteToItem } from '@/lib/student/mapStudentNote'
import type { StudentNoteItem } from '@/lib/student/types'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import { fetchChildAccessibleNotes } from './childNotes'

export function useParentChildNotes(
  subdomain: string,
  studentId: string | null,
  gradeId: string | null,
) {
  const [notes, setNotes] = useState<StudentNoteItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subdomain || !studentId || studentId.startsWith('demo-')) {
      setNotes([])
      return
    }
    setError(null)
    setLoading(true)
    try {
      const apiNotes = await fetchChildAccessibleNotes(subdomain, studentId)
      setNotes(apiNotes.map(mapStudentNoteToItem))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes')
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [subdomain, studentId])

  useEffect(() => {
    void load()
  }, [load])

  useDomainRealtime({
    onNotesPublished: (payload) => {
      const relevant =
        payload.visibility === 'SCHOOL' ||
        (payload.gradeLevelId && payload.gradeLevelId === gradeId)
      if (relevant) {
        void load()
      }
    },
  })

  return { notes, loading, error, refetch: load }
}
