'use client'

import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  BookCopy,
  CalendarClock,
  Clock,
  Copy,
  Layers,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  addExamSessionPapers,
  removeExamSessionPaper,
  updateExamSessionPaper,
  type ExamPaperRecord,
  type ExamPaperSpecPayload,
  type ExamSessionRecord,
} from '@/lib/exams/examSessions'
import {
  buildGradeOrderMap,
  organizeSessionPapers,
  sessionScopeStats,
} from '@/lib/exams/examSessionOrganize'
import { formatGradeDisplayName } from '@/lib/utils/grade-display'
import {
  allTemplatesForSubject,
  formatPaperDisplayName,
  paperExistsInSession,
  type PaperComponentSelection,
} from '@/lib/exams/examPaperComponents'
import { subjectsForGrade } from '@/lib/exams/examPaperPairs'
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import { useTenantSubjects } from '@/lib/hooks/useTenantSubjects'
import { SubjectPaperConfigurator } from './SubjectPaperConfigurator'
import {
  SessionClassSection,
  SessionClassTable,
  SessionClassTableCell,
  SessionClassTableRow,
  SessionOrganizerEmpty,
  SessionScopeStrip,
} from './SessionClassOrganizer'
interface SessionPapersPanelProps {
  subdomain: string
  sessionId: string
  session: ExamSessionRecord
  gradeFilter: string
}

type SuggestedPaper = ExamPaperSpecPayload & {
  subjectName: string
  gradeName: string
}

function paperKey(p: {
  tenantGradeLevelId: string
  tenantSubjectId: string
  paperComponent?: string | null
}) {
  return `${p.tenantGradeLevelId}:${p.tenantSubjectId}:${p.paperComponent ?? 'PAPER_1'}`
}

export function SessionPapersPanel({
  subdomain,
  sessionId,
  session,
  gradeFilter,
}: SessionPapersPanelProps) {
  const queryClient = useQueryClient()
  const { getGradeById, getSubjectsByLevelId } = useSchoolConfigStore()
  const { data: tenantSubjects = [] } = useTenantSubjects(true)

  const [addOpen, setAddOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<ExamPaperRecord | null>(null)

  const [addGradeId, setAddGradeId] = useState('')
  const [addSubjectId, setAddSubjectId] = useState('')
  const [addComponents, setAddComponents] = useState<PaperComponentSelection[]>([])

  const papers = session.papers ?? []

  const grades = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of papers) {
      const id = p.tenantGradeLevelId
      const name = p.tenantGradeLevel?.gradeLevel?.name ?? id
      map.set(id, name)
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [papers])

  const gradeOrder = useMemo(() => buildGradeOrderMap(session), [session])

  const classGroups = useMemo(
    () => organizeSessionPapers(papers, { gradeFilter, gradeOrder }),
    [papers, gradeFilter, gradeOrder],
  )

  const scopeStats = useMemo(() => sessionScopeStats(session), [session])

  const suggested = useMemo((): SuggestedPaper[] => {
    const list: SuggestedPaper[] = []
    const gradeIds = grades.map((g) => g.id)

    for (const gradeId of gradeIds) {
      const subjectsInGrade = new Map<string, string>()
      for (const p of papers.filter((x) => x.tenantGradeLevelId === gradeId)) {
        const sid = p.tenantSubjectId
        const name = p.tenantSubject?.subject?.name ?? 'Subject'
        subjectsInGrade.set(sid, name)
      }

      for (const [subjectId, subjectName] of subjectsInGrade) {
        const ts = tenantSubjects.find((s) => s.id === subjectId)
        const code = ts?.subject?.code ?? ts?.customSubject?.code
        for (const template of allTemplatesForSubject(subjectName, code)) {
          if (
            !paperExistsInSession(papers, gradeId, subjectId, template.id)
          ) {
            list.push({
              tenantGradeLevelId: gradeId,
              tenantSubjectId: subjectId,
              paperComponent: template.id,
              paperLabel: template.label,
              durationMinutes: template.defaultDurationMinutes,
              subjectName,
              gradeName: formatGradeDisplayName(
                papers.find((p) => p.tenantGradeLevelId === gradeId)
                  ?.tenantGradeLevel?.gradeLevel?.name ?? gradeId,
              ),
            })
          }
        }
      }
    }
    return list.slice(0, 12)
  }, [papers, grades, tenantSubjects])

  const suggestedByClass = useMemo(() => {
    const map = new Map<string, SuggestedPaper[]>()
    for (const item of suggested) {
      const list = map.get(item.gradeName) ?? []
      list.push(item)
      map.set(item.gradeName, list)
    }
    return Array.from(map.entries())
  }, [suggested])

  const subjectsForAddGrade = useMemo(() => {
    if (!addGradeId) return []
    return subjectsForGrade({
      gradeId: addGradeId,
      tenantSubjects,
      getGradeById,
      getSubjectsByLevelId,
    })
  }, [addGradeId, tenantSubjects, getGradeById, getSubjectsByLevelId])

  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['examSession', subdomain, sessionId],
    })
  }

  const openAddSheet = (prefill?: Partial<SuggestedPaper>) => {
    const gradeId = prefill?.tenantGradeLevelId ?? grades[0]?.id ?? ''
    const subjectId = prefill?.tenantSubjectId ?? ''
    setAddGradeId(gradeId)
    setAddSubjectId(subjectId)
    if (subjectId) {
      const subject = subjectsForGrade({
        gradeId,
        tenantSubjects,
        getGradeById,
        getSubjectsByLevelId,
      }).find((s) => s.id === subjectId)
      if (subject) {
        const ts = tenantSubjects.find((s) => s.id === subjectId)
        const templates = allTemplatesForSubject(
          subject.name,
          subject.code ?? ts?.subject?.code,
        )
        const prefillTemplate = prefill?.paperComponent
          ? templates.find((t) => t.id === prefill.paperComponent)
          : templates.find(
              (t) =>
                !paperExistsInSession(papers, gradeId, subjectId, t.id),
            )
        setAddComponents(
          prefillTemplate
            ? [
                {
                  id: prefillTemplate.id,
                  label: prefillTemplate.label,
                  enabled: true,
                  durationMinutes:
                    prefill?.durationMinutes ??
                    prefillTemplate.defaultDurationMinutes,
                },
              ]
            : [],
        )
      }
    } else {
      setAddComponents([])
    }
    setAddOpen(true)
  }

  const onAddSubjectChange = (subjectId: string) => {
    setAddSubjectId(subjectId)
    const subject = subjectsForAddGrade.find((s) => s.id === subjectId)
    if (!subject) {
      setAddComponents([])
      return
    }
    const templates = allTemplatesForSubject(subject.name, subject.code)
    const firstMissing = templates.find(
      (t) => !paperExistsInSession(papers, addGradeId, subjectId, t.id),
    )
    setAddComponents(
      firstMissing
        ? [
            {
              id: firstMissing.id,
              label: firstMissing.label,
              enabled: true,
              durationMinutes: firstMissing.defaultDurationMinutes,
            },
          ]
        : [
            {
              id: templates[0].id,
              label: templates[0].label,
              enabled: true,
              durationMinutes: templates[0].defaultDurationMinutes,
            },
          ],
    )
  }

  const handleAddPapers = async (specs: ExamPaperSpecPayload[]) => {
    if (specs.length === 0) return
    setBusy(true)
    try {
      await addExamSessionPapers(subdomain, sessionId, specs)
      await refresh()
      toast.success(
        `Added ${specs.length} paper${specs.length === 1 ? '' : 's'}`,
      )
      setAddOpen(false)
    } catch (error) {
      toast.error('Failed to add papers', {
        description: error instanceof Error ? error.message : 'Try again.',
      })
    } finally {
      setBusy(false)
    }
  }

  const submitAddSheet = async () => {
    const enabled = addComponents.filter((c) => c.enabled)
    if (!addGradeId || !addSubjectId || enabled.length === 0) {
      toast.error('Select grade, subject, and at least one paper')
      return
    }
    await handleAddPapers(
      enabled.map((c) => ({
        tenantGradeLevelId: addGradeId,
        tenantSubjectId: addSubjectId,
        paperComponent: c.id,
        paperLabel: c.label,
        durationMinutes: c.durationMinutes,
      })),
    )
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    setBusy(true)
    try {
      await removeExamSessionPaper(subdomain, sessionId, removeTarget.id)
      await refresh()
      toast.success('Paper removed')
      setRemoveTarget(null)
    } catch (error) {
      toast.error('Cannot remove paper', {
        description: error instanceof Error ? error.message : 'Try again.',
      })
    } finally {
      setBusy(false)
    }
  }

  const duplicateToOtherGrades = async (paper: ExamPaperRecord) => {
    const otherGrades = grades.filter(
      (g) => g.id !== paper.tenantGradeLevelId,
    )
    const specs: ExamPaperSpecPayload[] = []
    for (const grade of otherGrades) {
      const component = paper.paperComponent ?? 'PAPER_1'
      if (
        paperExistsInSession(
          papers,
          grade.id,
          paper.tenantSubjectId,
          component,
        )
      ) {
        continue
      }
      specs.push({
        tenantGradeLevelId: grade.id,
        tenantSubjectId: paper.tenantSubjectId,
        paperComponent: component,
        paperLabel: paper.paperLabel ?? undefined,
        durationMinutes: paper.defaultDurationMinutes ?? 120,
        maxScore: paper.maxScore ?? undefined,
        passMark: paper.passMark ?? undefined,
      })
    }
    if (specs.length === 0) {
      toast.message('Already on all grades')
      return
    }
    await handleAddPapers(specs)
  }

  const addAllSuggested = async () => {
    if (suggested.length === 0) return
    await handleAddPapers(
      suggested.map(({ subjectName, gradeName, ...spec }) => spec),
    )
  }

  const updateDuration = async (paper: ExamPaperRecord, minutes: number) => {
    try {
      await updateExamSessionPaper(subdomain, {
        sessionId,
        paperId: paper.id,
        durationMinutes: minutes,
      })
      await refresh()
    } catch {
      toast.error('Failed to update duration')
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Exam papers
            </CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              Each row is one assessable paper — Paper 1, Composition, Practical,
              etc. Add, remove, or copy across grades.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggested.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={addAllSuggested}
              >
                <Wand2 className="h-4 w-4 mr-1.5" />
                Fill gaps ({suggested.length})
              </Button>
            ) : null}
            <Button size="sm" onClick={() => openAddSheet()} disabled={busy}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add paper
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <SessionScopeStrip
            gradeCount={
              gradeFilter === 'all' ? scopeStats.gradeCount : classGroups.length
            }
            subjectCount={classGroups.reduce((n, g) => n + g.subjectCount, 0)}
            paperCount={classGroups.reduce((n, g) => n + g.paperCount, 0)}
            extra={
              scopeStats.paperCount > 0 ? (
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span>
                    {scopeStats.scheduledCount}/{scopeStats.paperCount} on timetable
                  </span>
                  {gradeFilter !== 'all' && classGroups[0] ? (
                    <span className="font-medium text-[#246a59]">
                      Filtered: {classGroups[0].gradeName}
                    </span>
                  ) : null}
                </div>
              ) : undefined
            }
          />

          {suggested.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white p-3 dark:border-amber-900 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-slate-900">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Suggested papers missing
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px] text-amber-800 hover:bg-amber-100/80 dark:text-amber-200"
                  disabled={busy}
                  onClick={addAllSuggested}
                >
                  Add all {suggested.length}
                </Button>
              </div>
              <div className="space-y-2">
                {suggestedByClass.map(([gradeName, items]) => (
                  <div key={gradeName}>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-300/70">
                      {gradeName}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((s) => (
                        <button
                          key={paperKey(s)}
                          type="button"
                          disabled={busy}
                          onClick={() => openAddSheet(s)}
                          className="rounded-lg border border-amber-200/80 bg-white/90 px-2 py-1 text-[10px] font-medium text-amber-900 transition-colors hover:border-[#246a59]/30 hover:bg-[#246a59]/5 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-100"
                        >
                          + {s.subjectName} · {s.paperLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {classGroups.length === 0 ? (
            <SessionOrganizerEmpty
              title="No papers for this view"
              description="Add exam papers organized by class and subject."
              action={
                <Button size="sm" onClick={() => openAddSheet()} disabled={busy}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add first paper
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {classGroups.map((group, groupIndex) => {
                const scheduledInGrade = group.subjects.reduce(
                  (n, subject) =>
                    n +
                    subject.papers.filter((p) => (p.timetableSlots?.length ?? 0) > 0)
                      .length,
                  0,
                )
                const schedulePct =
                  group.paperCount > 0
                    ? Math.round((scheduledInGrade / group.paperCount) * 100)
                    : 0

                return (
                  <SessionClassSection
                    key={group.gradeId}
                    gradeName={group.gradeName}
                    gradeIndex={groupIndex}
                    subjectCount={group.subjectCount}
                    paperCount={group.paperCount}
                    progress={schedulePct}
                    progressLabel={`${scheduledInGrade}/${group.paperCount} scheduled on timetable`}
                    variant="table"
                  >
                    <SessionClassTable
                      columns={[
                        'Subject',
                        'Paper',
                        'Duration',
                        'Max',
                        'Timetable',
                        '',
                      ]}
                    >
                      {group.subjects.flatMap((subject) =>
                        subject.papers.map((paper, paperIndex) => {
                          const scheduled = (paper.timetableSlots?.length ?? 0) > 0
                          const duration =
                            paper.timetableSlots?.[0]?.durationMinutes ??
                            paper.defaultDurationMinutes ??
                            120

                          return (
                            <SessionClassTableRow key={paper.id}>
                              {paperIndex === 0 ? (
                                <SessionClassTableCell
                                  rowSpan={subject.papers.length}
                                  className="font-medium text-slate-900 dark:text-slate-100"
                                >
                                  {subject.subjectName}
                                </SessionClassTableCell>
                              ) : null}
                              <SessionClassTableCell className="font-medium text-slate-900 dark:text-slate-100">
                                {(() => {
                                  if (
                                    subject.papers.length === 1 &&
                                    (!paper.paperLabel ||
                                      paper.paperLabel === 'Paper 1')
                                  ) {
                                    return '—'
                                  }
                                  return paper.paperLabel ?? `Paper ${paperIndex + 1}`
                                })()}
                              </SessionClassTableCell>
                              <SessionClassTableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-slate-400" />
                                  <Input
                                    type="number"
                                    min={15}
                                    step={5}
                                    defaultValue={duration}
                                    className="h-7 w-14 border-slate-200 text-xs"
                                    onBlur={(e) => {
                                      const next = Number(e.target.value)
                                      if (
                                        !Number.isNaN(next) &&
                                        next > 0 &&
                                        next !== duration
                                      ) {
                                        void updateDuration(paper, next)
                                      }
                                    }}
                                  />
                                  <span className="text-[10px] text-slate-400">min</span>
                                </div>
                              </SessionClassTableCell>
                              <SessionClassTableCell className="tabular-nums">
                                {paper.maxScore ?? '—'}
                              </SessionClassTableCell>
                              <SessionClassTableCell>
                                {scheduled ? (
                                  <Badge
                                    variant="outline"
                                    className="gap-1 text-[10px] font-normal text-emerald-700 border-emerald-200"
                                  >
                                    <CalendarClock className="h-3 w-3" />
                                    Scheduled
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-slate-400">Not set</span>
                                )}
                              </SessionClassTableCell>
                              <SessionClassTableCell align="right">
                                <div className="flex items-center justify-end gap-1">
                                  {grades.length > 1 ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-slate-400"
                                      disabled={busy}
                                      onClick={() => duplicateToOtherGrades(paper)}
                                      title="Copy to other grades"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                  ) : null}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    disabled={busy}
                                    onClick={() => setRemoveTarget(paper)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </SessionClassTableCell>
                            </SessionClassTableRow>
                          )
                        }),
                      )}
                    </SessionClassTable>
                  </SessionClassSection>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BookCopy className="h-4 w-4" />
              Add exam paper
            </SheetTitle>
            <SheetDescription>
              Pick a grade, subject, and paper type. You can add multiple paper
              types for the same subject at once.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto py-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Grade</Label>
              <Select value={addGradeId} onValueChange={setAddGradeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {formatGradeDisplayName(g.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Subject</Label>
              <Select
                value={addSubjectId}
                onValueChange={onAddSubjectChange}
                disabled={!addGradeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjectsForAddGrade.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {addSubjectId && addComponents.length > 0 ? (
              <SubjectPaperConfigurator
                subjectId={addSubjectId}
                subjectName={
                  subjectsForAddGrade.find((s) => s.id === addSubjectId)
                    ?.name ?? 'Subject'
                }
                subjectCode={
                  subjectsForAddGrade.find((s) => s.id === addSubjectId)?.code
                }
                components={addComponents}
                onChange={(_, next) => setAddComponents(next)}
                allowEmpty
              />
            ) : addSubjectId ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const subject = subjectsForAddGrade.find(
                    (s) => s.id === addSubjectId,
                  )
                  if (!subject) return
                  const t = allTemplatesForSubject(subject.name, subject.code)[0]
                  setAddComponents([
                    {
                      id: t.id,
                      label: t.label,
                      enabled: true,
                      durationMinutes: t.defaultDurationMinutes,
                    },
                  ])
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Configure papers
              </Button>
            ) : null}
          </div>

          <div className="border-t pt-4">
            <Button
              className="w-full"
              disabled={busy || addComponents.filter((c) => c.enabled).length === 0}
              onClick={submitAddSheet}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add to session
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this paper?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget
                ? formatPaperDisplayName(
                    removeTarget.tenantSubject?.subject?.name ?? 'Subject',
                    removeTarget.paperLabel,
                  )
                : ''}{' '}
              will be removed from the exam session. Papers with recorded marks
              cannot be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleRemove}
            >
              Remove paper
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
