'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  Calendar,
  ChevronDown,
  Loader2,
  Printer,
  Save,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StyledDatePicker } from '@/components/ui/styled-date-picker'
import {
  saveExamSessionTimetable,
  removeExamSessionTimetableSlot,
  updateExamSessionSchedule,
  getSessionGrades,
  type ExamPaperRecord,
  type ExamSessionRecord,
} from '@/lib/exams/examSessions'
import {
  formatExamDaysLabel,
  normalizeExamDaysOfWeek,
} from '@/lib/exams/examDaysOfWeek'
import { ExamDaysSelector } from './ExamDaysSelector'
import { formatGradeDisplayName } from '@/lib/utils/grade-display'
import {
  formatPaperDisplayName,
  type ExamPrintSubjectLabelMode,
} from '@/lib/exams/examPaperComponents'
import { ExamTimetableGrid } from './ExamTimetableGrid'
import { ExamSchoolTimetableGrid } from './ExamSchoolTimetableGrid'
import { ExamTimetableDesktopLayout } from './ExamTimetableDesktopLayout'
import { ExamUnscheduledPanel } from './ExamUnscheduledPanel'
import { ExamTimetablePrintView, type ExamPrintOrientation } from './ExamTimetablePrintView'
import { ExamTimetablePrintStyles } from './ExamTimetablePrintStyles'
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
import {
  examTimetableMobileEditorClass,
  examTimetableMobileStripClass,
  examTimetablePanelHeaderClass,
  examTimetablePeriodBarClass,
  examTimetablePeriodChipClass,
  examTimetableProgressPillClass,
} from './exam-session-ui'
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
  const subjectName =
    paper.tenantSubject?.subject?.name ??
    paper.tenantSubject?.customSubject?.name ??
    'Subject'
  const subjectCode =
    paper.tenantSubject?.subject?.code ??
    paper.tenantSubject?.customSubject?.code ??
    undefined
  const defaultDuration =
    slot?.durationMinutes ?? paper.defaultDurationMinutes ?? 120

  return {
    paperId: paper.id,
    subject: formatPaperDisplayName(subjectName, paper.paperLabel),
    subjectName,
    subjectCode,
    paperLabel: paper.paperLabel,
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
    gradeId?: string
  } | null>(null)
  const [examDaysOfWeek, setExamDaysOfWeek] = useState<number[]>(
    normalizeExamDaysOfWeek(session.examDaysOfWeek),
  )
  const [periodStart, setPeriodStart] = useState(() =>
    toDateInput(session.startDate),
  )
  const [periodEnd, setPeriodEnd] = useState(() => toDateInput(session.endDate))
  const [savingDays, setSavingDays] = useState(false)
  const [periodExpanded, setPeriodExpanded] = useState(false)
  const [printOrientation, setPrintOrientation] =
    useState<ExamPrintOrientation>('auto')
  const [printSubjectLabel, setPrintSubjectLabel] =
    useState<ExamPrintSubjectLabelMode>('full')

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

  const periodShortLabel = useMemo(() => {
    const fmt = (iso: string) =>
      new Date(`${iso}T12:00:00`).toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'short',
      })
    if (periodStart && periodEnd) {
      return `${fmt(periodStart)} – ${fmt(periodEnd)}`
    }
    if (periodStart) return fmt(periodStart)
    return 'Set dates'
  }, [periodStart, periodEnd])

  const isSchoolView = gradeFilter === 'all'

  const sessionGrades = useMemo(() => getSessionGrades(session), [session])

  const visibleDrafts = useMemo(() => {
    if (isSchoolView) return drafts
    return drafts.filter((row) => row.gradeId === gradeFilter)
  }, [drafts, gradeFilter, isSchoolView])

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

  const placingPaper = useMemo(
    () => drafts.find((row) => row.paperId === placingPaperId) ?? null,
    [drafts, placingPaperId],
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

  const handleSchoolCellClick = (gradeId: string, date: string, time: string) => {
    if (placingPaperId) {
      const placing = drafts.find((row) => row.paperId === placingPaperId)
      if (placing && placing.gradeId !== gradeId) {
        toast.error('Wrong grade column', {
          description: `Select a paper for ${placing.grade} or clear placement mode.`,
        })
        return
      }
      placePaperAtSlot(placingPaperId, date, time)
      return
    }

    const gradeUnscheduled = unscheduled.filter((row) => row.gradeId === gradeId)
    if (gradeUnscheduled.length === 0) {
      toast.message('Nothing to schedule here', {
        description: 'This grade has no unscheduled papers, or pick another column.',
      })
      return
    }

    if (gradeUnscheduled.length === 1) {
      placePaperAtSlot(gradeUnscheduled[0].paperId, date, time)
      return
    }

    setPendingSlot({ date, time, gradeId })
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

  const printGrades = useMemo(() => {
    if (isSchoolView) return sessionGrades
    return sessionGrades.filter((g) => g.id === gradeFilter)
  }, [isSchoolView, sessionGrades, gradeFilter])

  const sessionMetaLabel = `${session.academicYear} · Term ${session.term} · ${session.type}`

  return (
    <>
      <ExamTimetablePrintStyles />
      <div className="space-y-1.5 sm:space-y-4" data-exam-timetable-no-print>
        {/* Mobile: one-line control strip */}
        <div className={examTimetableMobileStripClass}>
          <span className={examTimetableProgressPillClass}>
            {scheduledCount}/{visibleDrafts.length}
          </span>
          <button
            type="button"
            onClick={() => setPeriodExpanded((open) => !open)}
            className={examTimetablePeriodChipClass}
          >
            <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
            <span className="min-w-0 flex-1 truncate text-[8px] text-slate-600 dark:text-slate-300">
              {periodShortLabel}
              <span className="text-slate-400"> · {formatExamDaysLabel(examDaysOfWeek)}</span>
            </span>
            <ChevronDown
              className={cn(
                'h-3 w-3 shrink-0 text-slate-400 transition-transform',
                periodExpanded && 'rotate-180',
              )}
            />
          </button>
          <Button
            size="sm"
            className="h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-[#246a59] to-[#1a4c40] p-0 text-white shadow-md shadow-[#246a59]/30 hover:from-[#1a4c40] hover:to-[#143830]"
            onClick={handleSave}
            disabled={saving}
            title="Save timetable"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {periodExpanded ? (
          <div className={examTimetableMobileEditorClass}>
            <div className="grid grid-cols-2 gap-1">
              <StyledDatePicker
                variant="inline"
                size="sm"
                label="Start"
                className="min-w-0"
                value={periodStart}
                maxDate={periodEnd || undefined}
                disabled={savingDays}
                clearable={false}
                showQuickPicks={false}
                onChange={(value) => handlePeriodDateChange('startDate', value)}
              />
              <StyledDatePicker
                variant="inline"
                size="sm"
                label="End"
                className="min-w-0"
                value={periodEnd}
                minDate={periodStart || undefined}
                disabled={savingDays}
                clearable={false}
                showQuickPicks={false}
                onChange={(value) => handlePeriodDateChange('endDate', value)}
              />
            </div>
            <ExamDaysSelector
              value={examDaysOfWeek}
              onChange={handleExamDaysChange}
              compact
              inline
            />
          </div>
        ) : null}

        {/* Desktop header */}
        <div className={cn(examTimetablePanelHeaderClass, 'hidden sm:block print:hidden')}>
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#246a59]/10 blur-2xl"
            aria-hidden
          />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#246a59]/20 to-[#0073ea]/10 ring-1 ring-[#246a59]/20">
                <BookOpen className="h-3.5 w-3.5 text-[#246a59]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Exam timetable
                </h2>
                <p className="mt-0.5 text-xs text-slate-600">
                  Click a slot to schedule — class overlaps are blocked automatically.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#246a59]/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[#246a59] ring-1 ring-[#246a59]/15">
                {scheduledCount}/{visibleDrafts.length} scheduled
              </span>
              <Select
                value={printSubjectLabel}
                onValueChange={(value) =>
                  setPrintSubjectLabel(value as ExamPrintSubjectLabelMode)
                }
              >
                <SelectTrigger
                  className="h-8 w-[7.25rem] rounded-xl border-slate-200/80 bg-white/80 text-xs"
                  aria-label="Print subject labels"
                >
                  <SelectValue placeholder="Labels" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="full">Full names</SelectItem>
                  <SelectItem value="code">Subject codes</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={printOrientation}
                onValueChange={(value) =>
                  setPrintOrientation(value as ExamPrintOrientation)
                }
              >
                <SelectTrigger
                  className="h-8 w-[6.75rem] rounded-xl border-slate-200/80 bg-white/80 text-xs"
                  aria-label="Print orientation"
                >
                  <SelectValue placeholder="Orientation" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl border-slate-200/80 bg-white/80 text-xs"
                onClick={() => window.print()}
              >
                <Printer className="mr-1.5 h-3 w-3" />
                Print
              </Button>
              <Button
                size="sm"
                className="h-8 rounded-xl bg-gradient-to-r from-[#246a59] to-[#1a4c40] text-xs text-white shadow-md shadow-[#246a59]/25 hover:from-[#1a4c40] hover:to-[#143830]"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-3 w-3" />
                )}
                Save timetable
              </Button>
            </div>
          </div>
        </div>

        <div id="exam-timetable-print" className="space-y-1.5 sm:space-y-3">
          {/* Desktop period bar */}
          <div className={cn(examTimetablePeriodBarClass, 'hidden print:hidden sm:block')}>
            <button
              type="button"
              onClick={() => setPeriodExpanded((open) => !open)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left"
            >
              <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate text-xs text-slate-600 dark:text-slate-300">
                {periodLabel}
              </span>
              {savingDays ? (
                <span className="shrink-0 text-[10px] text-slate-500">Saving…</span>
              ) : null}
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform',
                  periodExpanded && 'rotate-180',
                )}
              />
            </button>

            {periodExpanded ? (
              <div className="space-y-2 border-t border-slate-200 px-3 py-2.5 dark:border-slate-700">
                <div className="flex flex-wrap items-end gap-2">
                  <StyledDatePicker
                    variant="inline"
                    size="sm"
                    label="Start"
                    className="w-[8.5rem]"
                    value={periodStart}
                    maxDate={periodEnd || undefined}
                    disabled={savingDays}
                    clearable={false}
                    showQuickPicks={false}
                    onChange={(value) => handlePeriodDateChange('startDate', value)}
                  />
                  <span className="pb-2 text-xs text-slate-500">→</span>
                  <StyledDatePicker
                    variant="inline"
                    size="sm"
                    label="End"
                    className="w-[8.5rem]"
                    value={periodEnd}
                    minDate={periodStart || undefined}
                    disabled={savingDays}
                    clearable={false}
                    showQuickPicks={false}
                    onChange={(value) => handlePeriodDateChange('endDate', value)}
                  />
                </div>
                <ExamDaysSelector
                  value={examDaysOfWeek}
                  onChange={handleExamDaysChange}
                  compact
                  inline
                />
              </div>
            ) : null}
          </div>

          {placingPaper ? (
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-[#246a59]/30 bg-gradient-to-r from-[#246a59]/10 via-[#246a59]/5 to-transparent px-3 py-2 shadow-sm print:hidden">
              <p className="min-w-0 truncate text-xs text-[#246a59]">
                <span className="font-semibold">Placing {placingPaper.subject}</span>
                <span className="hidden sm:inline"> — click a slot on the grid</span>
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 shrink-0 px-2 text-xs text-[#246a59] hover:bg-[#246a59]/10"
                onClick={() => setPlacingPaperId(null)}
              >
                Cancel
              </Button>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:gap-4 lg:items-stretch">
            <div className="-mx-3 min-w-0 flex-1 sm:mx-0">
              {isSchoolView ? (
                <ExamSchoolTimetableGrid
                  drafts={drafts}
                  grades={sessionGrades}
                  sessionStart={periodStart}
                  sessionEnd={periodEnd}
                  dailyStartTime={session.dailyStartTime}
                  dailyEndTime={session.dailyEndTime}
                  examDaysOfWeek={examDaysOfWeek}
                  clashingPaperIds={clashIds}
                  placementActive={Boolean(placingPaperId)}
                  onCellClick={handleSchoolCellClick}
                  onExamClick={(draft) => openEditor(draft.paperId)}
                  sidePanel={
                    unscheduled.length > 0 ? (
                      <ExamUnscheduledPanel
                        papers={unscheduled}
                        placingPaperId={placingPaperId}
                        onSelectPaper={(paperId) =>
                          setPlacingPaperId((id) => (id === paperId ? null : paperId))
                        }
                        onOpenEditor={openEditor}
                      />
                    ) : undefined
                  }
                />
              ) : (
                <ExamTimetableDesktopLayout
                  table={
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
                  }
                  sidebar={
                    unscheduled.length > 0 ? (
                      <ExamUnscheduledPanel
                        papers={unscheduled}
                        placingPaperId={placingPaperId}
                        onSelectPaper={(paperId) =>
                          setPlacingPaperId((id) => (id === paperId ? null : paperId))
                        }
                        onOpenEditor={openEditor}
                      />
                    ) : undefined
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ExamTimetablePrintView
        sessionName={session.name}
        sessionMeta={sessionMetaLabel}
        periodLabel={periodLabel}
        grades={printGrades}
        drafts={visibleDrafts}
        isSchoolView={isSchoolView}
        orientation={printOrientation}
        subjectLabelMode={printSubjectLabel}
        dailyStartTime={session.dailyStartTime}
        dailyEndTime={session.dailyEndTime}
      />

      <ExamPaperPickDialog
        open={pickOpen}
        onOpenChange={(open) => {
          setPickOpen(open)
          if (!open) setPendingSlot(null)
        }}
        date={pendingSlot?.date ?? ''}
        time={pendingSlot?.time ?? ''}
        papers={
          pendingSlot?.gradeId
            ? unscheduled.filter((row) => row.gradeId === pendingSlot.gradeId)
            : unscheduled
        }
        onPick={handlePickPaper}
      />

      <ExamScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        draft={editingDraft}
        clashMessages={editingClashes}
        saving={saving}
        minDate={periodStart || undefined}
        maxDate={periodEnd || undefined}
        allowedWeekdays={examDaysOfWeek}
        onSave={updateRow}
        onDone={handleScheduleDone}
        onClear={clearRow}
      />
    </>
  )
}
