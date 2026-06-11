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

  const visiblePapers = useMemo(() => {
    if (gradeFilter === 'all') return papers
    return papers.filter((p) => p.tenantGradeLevelId === gradeFilter)
  }, [papers, gradeFilter])

  const grouped = useMemo(() => {
    const byGrade = new Map<string, ExamPaperRecord[]>()
    for (const paper of visiblePapers) {
      const gid = paper.tenantGradeLevelId
      if (!byGrade.has(gid)) byGrade.set(gid, [])
      byGrade.get(gid)!.push(paper)
    }
    return Array.from(byGrade.entries()).map(([gradeId, gradePapers]) => ({
      gradeId,
      gradeName: formatGradeDisplayName(
        gradePapers[0]?.tenantGradeLevel?.gradeLevel?.name ?? gradeId,
      ),
      papers: gradePapers.sort((a, b) => {
        const sa = a.tenantSubject?.subject?.name ?? ''
        const sb = b.tenantSubject?.subject?.name ?? ''
        return sa.localeCompare(sb)
      }),
    }))
  }, [visiblePapers])

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
          {suggested.length > 0 ? (
            <div className="rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 to-orange-50/50 p-3 dark:border-amber-900 dark:from-amber-950/30 dark:to-orange-950/20">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-100">
                <Sparkles className="h-3.5 w-3.5" />
                Suggested papers missing from this session
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggested.map((s) => (
                  <button
                    key={paperKey(s)}
                    type="button"
                    disabled={busy}
                    onClick={() => openAddSheet(s)}
                    className="rounded-full border border-amber-200/80 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-900 transition-colors hover:border-primary/40 hover:bg-primary/5 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-100"
                  >
                    + {s.gradeName} · {s.subjectName} · {s.paperLabel}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {grouped.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No papers for this filter.{' '}
              <button
                type="button"
                className="text-primary underline"
                onClick={() => openAddSheet()}
              >
                Add the first paper
              </button>
            </div>
          ) : (
            grouped.map((group) => (
              <div
                key={group.gradeId}
                className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {group.gradeName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {group.papers.length} paper
                    {group.papers.length === 1 ? '' : 's'}
                  </p>
                </div>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {group.papers.map((paper) => {
                    const subjectName =
                      paper.tenantSubject?.subject?.name ?? 'Subject'
                    const label = formatPaperDisplayName(
                      subjectName,
                      paper.paperLabel,
                    )
                    const scheduled = (paper.timetableSlots?.length ?? 0) > 0
                    const duration =
                      paper.timetableSlots?.[0]?.durationMinutes ??
                      paper.defaultDurationMinutes ??
                      120

                    return (
                      <li
                        key={paper.id}
                        className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                            {label}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {scheduled ? (
                              <Badge
                                variant="outline"
                                className="gap-1 text-[10px] font-normal text-emerald-700 border-emerald-200"
                              >
                                <CalendarClock className="h-3 w-3" />
                                Scheduled
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[10px] font-normal text-slate-500"
                              >
                                Not on timetable
                              </Badge>
                            )}
                            {paper.maxScore ? (
                              <span className="text-[10px] text-slate-400">
                                /{paper.maxScore} marks
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 dark:border-slate-700">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <Input
                              type="number"
                              min={15}
                              step={5}
                              defaultValue={duration}
                              className="h-7 w-14 border-0 p-0 text-xs shadow-none focus-visible:ring-0"
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

                          {grades.length > 1 ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={busy}
                              onClick={() => duplicateToOtherGrades(paper)}
                              title="Copy to other grades in this session"
                            >
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              All grades
                            </Button>
                          ) : null}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={busy}
                            onClick={() => setRemoveTarget(paper)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))
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
