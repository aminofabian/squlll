'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  CalendarClock,
  ChevronRight,
  Loader2,
  Printer,
  Save,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  saveExamSessionTimetable,
  removeExamSessionTimetableSlot,
  updateExamSessionSchedule,
  type ExamPaperRecord,
  type ExamSessionRecord,
} from '@/lib/exams/examSessions'
import {
  formatExamDaysLabel,
  normalizeExamDaysOfWeek,
} from '@/lib/exams/examDaysOfWeek'
import { ExamDaysSelector } from './ExamDaysSelector'
import { formatGradeDisplayName } from '@/lib/utils/grade-display'
import { formatPaperDisplayName } from '@/lib/exams/examPaperComponents'
import { ExamTimetableGrid } from './ExamTimetableGrid'
import { ExamScheduleDialog } from './ExamScheduleDialog'
import { ExamPaperPickDialog } from './ExamPaperPickDialog'
import {
  buildExamDays,
  findTimetableClashes,
  getClashesForPaper,
  getClashingPaperIds,
  isCompleteDraft,
  toDateInput,
  type ExamTimetableDraft,
} from './exam-timetable.utils'
import { cn } from '@/lib/utils'

interface SessionTimetablePanelProps {
  subdomain: string
  sessionId: string
  session: ExamSessionRecord
  gradeFilter: string
}

function draftsToSlots(rows: ExamTimetableDraft[]) {
  return rows
    .filter(isCompleteDraft)
    .map((row) => ({
      paperId: row.paperId,
      date: row.date,
      startTime: row.startTime.slice(0, 5),
      durationMinutes: Number(row.durationMinutes),
      roomName: row.roomName.trim() || undefined,
    }))
    .filter((slot) => !Number.isNaN(slot.durationMinutes) && slot.durationMinutes > 0)
}

function paperToDraft(paper: ExamPaperRecord): ExamTimetableDraft {
  const slot = paper.timetableSlots?.[0]
  const subjectName = paper.tenantSubject?.subject?.name ?? 'Subject'
  const defaultDuration =
    slot?.durationMinutes ?? paper.defaultDurationMinutes ?? 120

  return {
    paperId: paper.id,
    subject: formatPaperDisplayName(subjectName, paper.paperLabel),
    grade: formatGradeDisplayName(
      paper.tenantGradeLevel?.gradeLevel?.name ?? 'Grade',
    ),
    gradeId: paper.tenantGradeLevelId,
    date: toDateInput(slot?.date),
    startTime: slot?.startTime ?? '',
    durationMinutes: String(defaultDuration),
    roomName: slot?.roomName ?? '',
  }
}

export function SessionTimetablePanel({
  subdomain,
  sessionId,
  session,
  gradeFilter,
}: SessionTimetablePanelProps) {
  const queryClient = useQueryClient()
  const [drafts, setDrafts] = useState<ExamTimetableDraft[]>([])
  const [saving, setSaving] = useState(false)
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [placingPaperId, setPlacingPaperId] = useState<string | null>(null)
  const [pickOpen, setPickOpen] = useState(false)
  const [pendingSlot, setPendingSlot] = useState<{
    date: string
    time: string
  } | null>(null)
  const [examDaysOfWeek, setExamDaysOfWeek] = useState<number[]>(
    normalizeExamDaysOfWeek(session.examDaysOfWeek),
  )
  const [periodStart, setPeriodStart] = useState(() =>
    toDateInput(session.startDate),
  )
  const [periodEnd, setPeriodEnd] = useState(() => toDateInput(session.endDate))
  const [savingDays, setSavingDays] = useState(false)

  useEffect(() => {
    setDrafts((session.papers ?? []).map(paperToDraft))
  }, [session.papers])

  useEffect(() => {
    setExamDaysOfWeek(normalizeExamDaysOfWeek(session.examDaysOfWeek))
    setPeriodStart(toDateInput(session.startDate))
    setPeriodEnd(toDateInput(session.endDate))
  }, [session.examDaysOfWeek, session.startDate, session.endDate])

  const examDayColumns = useMemo(
    () =>
      buildExamDays(drafts, periodStart, periodEnd, examDaysOfWeek),
    [drafts, periodStart, periodEnd, examDaysOfWeek],
  )

  const periodLabel = useMemo(() => {
    const start = periodStart
      ? new Date(`${periodStart}T12:00:00`).toLocaleDateString('en-KE', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : null
    const end = periodEnd
      ? new Date(`${periodEnd}T12:00:00`).toLocaleDateString('en-KE', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : null
    if (start && end) {
      return `${start} → ${end} · ${formatExamDaysLabel(examDaysOfWeek)} (${examDayColumns.length} day${examDayColumns.length === 1 ? '' : 's'})`
    }
    if (start) return `${start} · ${formatExamDaysLabel(examDaysOfWeek)}`
    return formatExamDaysLabel(examDaysOfWeek)
  }, [periodStart, periodEnd, examDaysOfWeek, examDayColumns.length])

  const visibleDrafts = useMemo(() => {
    if (gradeFilter === 'all') return drafts
    return drafts.filter((row) => row.gradeId === gradeFilter)
  }, [drafts, gradeFilter])

  const scheduledCount = useMemo(
    () => visibleDrafts.filter(isCompleteDraft).length,
    [visibleDrafts],
  )

  const unscheduled = useMemo(
    () => visibleDrafts.filter((row) => !isCompleteDraft(row)),
    [visibleDrafts],
  )

  const editingDraft = useMemo(
    () => drafts.find((d) => d.paperId === editingPaperId) ?? null,
    [drafts, editingPaperId],
  )

  const clashIds = useMemo(() => getClashingPaperIds(drafts), [drafts])

  const editingClashes = useMemo(
    () =>
      editingDraft ? getClashesForPaper(editingDraft, drafts) : [],
    [editingDraft, drafts],
  )

  const updateRow = (paperId: string, patch: Partial<ExamTimetableDraft>) => {
    setDrafts((rows) =>
      rows.map((row) => (row.paperId === paperId ? { ...row, ...patch } : row)),
    )
  }

  const persistTimetable = async (
    rows: ExamTimetableDraft[],
    options?: { successMessage?: string; allowEmpty?: boolean },
  ): Promise<boolean> => {
    const slots = draftsToSlots(rows)

    if (slots.length === 0 && !options?.allowEmpty) {
      toast.error('Add at least one exam to the timetable', {
        description: 'Set date, start time, and duration for this paper.',
      })
      return false
    }

    const clashes = findTimetableClashes(rows)
    if (clashes.length > 0) {
      toast.error('Fix timetable overlaps before saving', {
        description: clashes[0].message,
      })
      return false
    }

    setSaving(true)
    try {
      await saveExamSessionTimetable(subdomain, sessionId, slots)
      await queryClient.invalidateQueries({
        queryKey: ['examSession', subdomain, sessionId],
      })
      if (options?.successMessage) {
        toast.success(options.successMessage)
      }
      return true
    } catch (error) {
      toast.error('Failed to save timetable', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
      return false
    } finally {
      setSaving(false)
    }
  }

  const clearRow = async (paperId: string): Promise<boolean> => {
    const previous = drafts
    const next = drafts.map((row) =>
      row.paperId === paperId
        ? {
            ...row,
            date: '',
            startTime: '',
            durationMinutes: '120',
            roomName: '',
          }
        : row,
    )
    setDrafts(next)
    setSaving(true)
    try {
      await removeExamSessionTimetableSlot(subdomain, sessionId, paperId)
      await queryClient.invalidateQueries({
        queryKey: ['examSession', subdomain, sessionId],
      })
      toast.success('Removed from timetable')
      return true
    } catch (error) {
      setDrafts(previous)
      toast.error('Failed to remove from timetable', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
      return false
    } finally {
      setSaving(false)
    }
  }

  const openEditor = (paperId: string) => {
    setEditingPaperId(paperId)
    setDialogOpen(true)
  }

  const placePaperAtSlot = (paperId: string, date: string, time: string) => {
    updateRow(paperId, { date, startTime: time })
    setPlacingPaperId(null)
    openEditor(paperId)
  }

  const handleCellClick = (date: string, time: string) => {
    if (placingPaperId) {
      placePaperAtSlot(placingPaperId, date, time)
      return
    }

    if (unscheduled.length === 0) {
      toast.message('All papers scheduled', {
        description: 'Click an exam block on the grid to edit its time.',
      })
      return
    }

    setPendingSlot({ date, time })
    setPickOpen(true)
  }

  const handlePickPaper = (paperId: string) => {
    if (!pendingSlot) return
    setPickOpen(false)
    placePaperAtSlot(paperId, pendingSlot.date, pendingSlot.time)
    setPendingSlot(null)
  }

  const saveScheduleSettings = async (patch: {
    examDaysOfWeek?: number[]
    startDate?: string
    endDate?: string
  }) => {
    if (patch.startDate && patch.endDate && patch.endDate < patch.startDate) {
      toast.error('End date must be on or after start date')
      return
    }

    setSavingDays(true)
    try {
      await updateExamSessionSchedule(subdomain, sessionId, patch)
      await queryClient.invalidateQueries({
        queryKey: ['examSession', subdomain, sessionId],
      })
    } catch (error) {
      setExamDaysOfWeek(normalizeExamDaysOfWeek(session.examDaysOfWeek))
      setPeriodStart(toDateInput(session.startDate))
      setPeriodEnd(toDateInput(session.endDate))
      toast.error('Failed to update exam schedule', {
        description: error instanceof Error ? error.message : 'Try again.',
      })
    } finally {
      setSavingDays(false)
    }
  }

  const handleExamDaysChange = async (days: number[]) => {
    const normalized = normalizeExamDaysOfWeek(days)
    setExamDaysOfWeek(normalized)
    await saveScheduleSettings({ examDaysOfWeek: normalized })
  }

  const handlePeriodDateChange = async (
    field: 'startDate' | 'endDate',
    value: string,
  ) => {
    const nextStart = field === 'startDate' ? value : periodStart
    const nextEnd = field === 'endDate' ? value : periodEnd
    if (field === 'startDate') setPeriodStart(value)
    else setPeriodEnd(value)
    await saveScheduleSettings({ startDate: nextStart, endDate: nextEnd })
  }

  const handleScheduleDone = async (): Promise<boolean> => {
    const draft = drafts.find((d) => d.paperId === editingPaperId)
    if (!draft || !isCompleteDraft(draft)) {
      toast.error('Complete the schedule', {
        description: 'Set date, start time, and duration before saving.',
      })
      return false
    }

    const slots = draftsToSlots(drafts)
    return persistTimetable(drafts, {
      successMessage: `Scheduled ${draft.subject}`,
      allowEmpty: slots.length === 0,
    })
  }

  const handleSave = async () => {
    const slots = draftsToSlots(drafts)
    await persistTimetable(drafts, {
      successMessage: `Timetable saved — ${slots.length} paper${slots.length === 1 ? '' : 's'} scheduled`,
    })
  }

  return (
    <>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Exam timetable
              </CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Select a paper, click a slot, then save in the dialog — each
                placement is stored immediately. Overlaps for the same class are
                blocked.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <Badge variant="outline" className="text-xs font-normal">
                {scheduledCount}/{visibleDrafts.length} scheduled
              </Badge>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save timetable
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent id="exam-timetable-print" className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 print:hidden dark:border-slate-700 dark:bg-slate-900/40">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Exam period &amp; days
                </p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {periodLabel}
                </p>
              </div>
              {savingDays ? (
                <span className="text-xs text-slate-400">Updating days…</span>
              ) : null}
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Period start</Label>
                <Input
                  type="date"
                  className="h-9"
                  value={periodStart}
                  disabled={savingDays}
                  onChange={(e) => handlePeriodDateChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Period end</Label>
                <Input
                  type="date"
                  className="h-9"
                  value={periodEnd}
                  disabled={savingDays}
                  onChange={(e) => handlePeriodDateChange('endDate', e.target.value)}
                />
              </div>
            </div>
            <ExamDaysSelector
              value={examDaysOfWeek}
              onChange={handleExamDaysChange}
              compact
            />
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="min-w-0 flex-1">
              <ExamTimetableGrid
                drafts={visibleDrafts}
                sessionStart={periodStart}
                sessionEnd={periodEnd}
                dailyStartTime={session.dailyStartTime}
                dailyEndTime={session.dailyEndTime}
                examDaysOfWeek={examDaysOfWeek}
                clashingPaperIds={clashIds}
                placementActive={Boolean(placingPaperId)}
                onCellClick={handleCellClick}
                onExamClick={(draft) => openEditor(draft.paperId)}
              />
            </div>

            {unscheduled.length > 0 ? (
              <aside className="w-full shrink-0 lg:w-64 print:hidden">
                <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-100">
                    <CalendarClock className="h-4 w-4" />
                    Unscheduled ({unscheduled.length})
                  </div>
                  <p className="mb-3 text-xs text-amber-800/80 dark:text-amber-200/70">
                    {placingPaperId
                      ? 'Click a time slot on the grid to place the selected paper.'
                      : 'Select a paper, then click a slot — or click a slot to pick from the list.'}
                  </p>
                  <ul className="space-y-1.5">
                    {unscheduled.map((row) => (
                      <li key={row.paperId}>
                        <button
                          type="button"
                          className={cn(
                            'flex w-full items-center justify-between rounded-md border px-2.5 py-2 text-left text-xs transition-colors',
                            placingPaperId === row.paperId
                              ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                              : 'border-amber-200/80 bg-white hover:border-primary/40 hover:bg-primary/5 dark:border-amber-800 dark:bg-slate-900',
                          )}
                          onClick={() =>
                            setPlacingPaperId((id) =>
                              id === row.paperId ? null : row.paperId,
                            )
                          }
                          onDoubleClick={() => openEditor(row.paperId)}
                        >
                          <span>
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {row.subject}
                            </span>
                            <span className="block text-slate-500">{row.grade}</span>
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <ExamPaperPickDialog
        open={pickOpen}
        onOpenChange={(open) => {
          setPickOpen(open)
          if (!open) setPendingSlot(null)
        }}
        date={pendingSlot?.date ?? ''}
        time={pendingSlot?.time ?? ''}
        papers={unscheduled}
        onPick={handlePickPaper}
      />

      <ExamScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        draft={editingDraft}
        clashMessages={editingClashes}
        saving={saving}
        onSave={updateRow}
        onDone={handleScheduleDone}
        onClear={clearRow}
      />
    </>
  )
}
