'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { formatExamDayHeader } from './exam-timetable.utils'
import type { ExamTimetableDraft } from './exam-timetable.utils'

interface ExamPaperPickDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: string
  time: string
  papers: ExamTimetableDraft[]
  onPick: (paperId: string) => void
}

export function ExamPaperPickDialog({
  open,
  onOpenChange,
  date,
  time,
  papers,
  onPick,
}: ExamPaperPickDialogProps) {
  const [search, setSearch] = useState('')

  const { weekday, label } = formatExamDayHeader(date)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = papers
    if (!q) return list
    return list.filter(
      (p) =>
        p.subject.toLowerCase().includes(q) ||
        p.grade.toLowerCase().includes(q),
    )
  }, [papers, search])

  const grouped = useMemo(() => {
    const map = new Map<string, ExamTimetableDraft[]>()
    for (const paper of filtered) {
      const key = paper.grade
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(paper)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSearch('')
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose exam paper</DialogTitle>
          <DialogDescription>
            Schedule at {weekday} {label} · {time.slice(0, 5)}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search subject or grade…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="max-h-[min(50vh,320px)] space-y-3 overflow-y-auto pr-1">
          {grouped.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No matching unscheduled papers.
            </p>
          ) : (
            grouped.map(([grade, gradePapers]) => (
              <div key={grade}>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {grade}
                </p>
                <ul className="space-y-1">
                  {gradePapers.map((paper) => (
                    <li key={paper.paperId}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-900"
                        onClick={() => {
                          onPick(paper.paperId)
                          setSearch('')
                        }}
                      >
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {paper.subject}
                        </span>
                        <span className="text-xs text-slate-500">
                          {paper.durationMinutes} min
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
