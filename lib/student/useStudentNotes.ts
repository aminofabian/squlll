'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import { mapStudentNoteToItem } from './mapStudentNote'
import { fetchStudentAccessibleNotes } from './studentNotes'
import type { StudentNoteItem } from './types'

export function useStudentNotes(subdomain: string) {
  const [notes, setNotes] = useState<StudentNoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subdomain) {
      setNotes([])
      return
    }
    setError(null)
    try {
      const apiNotes = await fetchStudentAccessibleNotes(subdomain)
      setNotes(apiNotes.map(mapStudentNoteToItem))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes')
      setNotes([])
    }
  }, [subdomain])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void load().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [load])

  useDomainRealtime({
    onNotesPublished: () => {
      void load()
    },
  })

  const subjects = useMemo(() => {
    const names = new Set(notes.map((n) => n.subject))
    return ['All Subjects', ...Array.from(names).sort()]
  }, [notes])

  return { notes, subjects, loading, error, refetch: load }
}
