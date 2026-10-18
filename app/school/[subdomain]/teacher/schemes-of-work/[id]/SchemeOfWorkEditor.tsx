'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Loader2,
  Pencil,
  Printer,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  deleteSchemeEntry,
  fetchSchemeOfWork,
  generatePlansFromScheme,
  saveSchemeEntry,
  saveSchemeOfWork,
  type SchemeEntryStatus,
  type SchemeOfWork,
  type SchemeOfWorkEntry,
  type SchemeOfWorkStatus,
} from '@/lib/lesson-planning/api'
import { SchemeEntryStatusPill } from '@/components/lesson-planning/StatusPill'

type EntryDraft = {
  id?: string
  weekNumber: number
  sequence: number
  strand: string
  subStrand: string
  topic: string
  specificLearningOutcomes: string
  suggestedActivities: string
  resources: string
  assessmentMethod: string
  plannedLessons: number
  status: SchemeEntryStatus
  reason: string
}

function emptyDraft(weekNumber: number, sequence = 1): EntryDraft {
  return {
    weekNumber,
    sequence,
    strand: '',
    subStrand: '',
    topic: '',
    specificLearningOutcomes: '',
    suggestedActivities: '',
    resources: '',
    assessmentMethod: '',
    plannedLessons: 1,
    status: 'PLANNED',
    reason: '',
  }
}

function draftFromEntry(entry: SchemeOfWorkEntry): EntryDraft {
  return {
    id: entry.id,
    weekNumber: entry.weekNumber,
    sequence: entry.sequence,
    strand: entry.strand ?? '',
    subStrand: entry.subStrand ?? '',
    topic: entry.topic,
    specificLearningOutcomes: entry.specificLearningOutcomes ?? '',
    suggestedActivities: entry.suggestedActivities ?? '',
    resources: entry.resources ?? '',
    assessmentMethod: entry.assessmentMethod ?? '',
    plannedLessons: entry.plannedLessons,
    status: entry.status,
    reason: entry.reason ?? '',
  }
}

function EntryDialog({
  open,
  onOpenChange,
  subdomain,
  schemeId,
  draft,
  weekCount,
  onSaved,
  onError,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  subdomain: string
  schemeId: string
  draft: EntryDraft
  weekCount: number
  onSaved: (scheme: SchemeOfWork) => void
  onError: (message: string) => void
}) {
  const [form, setForm] = useState<EntryDraft>(draft)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof EntryDraft>(key: K, value: EntryDraft[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const handleSave = async () => {
    if (!form.topic.trim()) {
      setError('Topic is required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const scheme = await saveSchemeEntry(subdomain, {
        id: form.id,
        schemeOfWorkId: schemeId,
        weekNumber: form.weekNumber,
        sequence: form.sequence,
        strand: form.strand.trim() || undefined,
        subStrand: form.subStrand.trim() || undefined,
        topic: form.topic.trim(),
        specificLearningOutcomes:
          form.specificLearningOutcomes.trim() || undefined,
        suggestedActivities: form.suggestedActivities.trim() || undefined,
        resources: form.resources.trim() || undefined,
        assessmentMethod: form.assessmentMethod.trim() || undefined,
        plannedLessons: form.plannedLessons,
        status: form.status,
        reason: form.reason.trim() || undefined,
      })
      onSaved(scheme)
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not save this topic'
      setError(message)
      onError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{form.id ? 'Edit topic' : 'Add topic'}</DialogTitle>
          <DialogDescription>
            Topics map the curriculum to weeks. Lesson plans copy this information
            when you prepare them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Week</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={form.weekNumber}
                onChange={(event) =>
                  update('weekNumber', Number(event.target.value))
                }
              >
                {Array.from({ length: weekCount }, (_, index) => index + 1).map(
                  (week) => (
                    <option key={week} value={week}>
                      Week {week}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Order in week</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={form.sequence}
                onChange={(event) =>
                  update('sequence', Number(event.target.value) || 1)
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Lessons</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={form.plannedLessons}
                onChange={(event) =>
                  update('plannedLessons', Number(event.target.value) || 1)
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Strand</Label>
              <Input
                value={form.strand}
                onChange={(event) => update('strand', event.target.value)}
                placeholder="e.g. Numbers"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sub-strand</Label>
              <Input
                value={form.subStrand}
                onChange={(event) => update('subStrand', event.target.value)}
                placeholder="e.g. Fractions"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Topic</Label>
            <Input
              value={form.topic}
              onChange={(event) => update('topic', event.target.value)}
              placeholder="What is taught this week"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Specific learning outcomes</Label>
            <Textarea
              rows={3}
              value={form.specificLearningOutcomes}
              onChange={(event) =>
                update('specificLearningOutcomes', event.target.value)
              }
              placeholder="By the end of the topic, learners should be able to…"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Suggested activities</Label>
              <Textarea
                rows={2}
                value={form.suggestedActivities}
                onChange={(event) =>
                  update('suggestedActivities', event.target.value)
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Resources</Label>
              <Textarea
                rows={2}
                value={form.resources}
                onChange={(event) => update('resources', event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Assessment method</Label>
            <Input
              value={form.assessmentMethod}
              onChange={(event) =>
                update('assessmentMethod', event.target.value)
              }
              placeholder="Observation, written exercise, project…"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Delivery status</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={form.status}
                onChange={(event) =>
                  update('status', event.target.value as SchemeEntryStatus)
                }
              >
                <option value="PLANNED">Planned</option>
                <option value="SKIPPED">Skipped</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                Covered / in progress updates automatically from lesson records.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Reason (if moved or skipped)</Label>
              <Input
                value={form.reason}
                onChange={(event) => update('reason', event.target.value)}
                placeholder="e.g. Public holiday"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save topic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SchemeOfWorkEditor({
  subdomain,
  initialScheme,
}: {
  subdomain: string
  initialScheme: SchemeOfWork
}) {
  const router = useRouter()
  const [scheme, setScheme] = useState(initialScheme)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [entryDialog, setEntryDialog] = useState<{
    draft: EntryDraft
  } | null>(null)
  const [generating, setGenerating] = useState(false)
  const [busyEntryId, setBusyEntryId] = useState<string | null>(null)
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<number>>(new Set())

  const weeks = useMemo(() => {
    const groups = new Map<number, SchemeOfWorkEntry[]>()
    for (const entry of scheme.entries) {
      const list = groups.get(entry.weekNumber) ?? []
      list.push(entry)
      groups.set(entry.weekNumber, list)
    }
    const total = Math.max(
      scheme.weekCount,
      ...[...groups.keys()].map((week) => week),
      1,
    )
    return Array.from({ length: total }, (_, index) => ({
      weekNumber: index + 1,
      entries: (groups.get(index + 1) ?? []).sort(
        (a, b) => a.sequence - b.sequence,
      ),
    }))
  }, [scheme])

  const toggleWeek = (week: number) => {
    setCollapsedWeeks((current) => {
      const next = new Set(current)
      if (next.has(week)) next.delete(week)
      else next.add(week)
      return next
    })
  }

  const handleStatusChange = async (status: SchemeOfWorkStatus) => {
    setError(null)
    try {
      const updated = await saveSchemeOfWork(subdomain, {
        id: scheme.id,
        termId: scheme.termId,
        gradeLevelId: scheme.gradeLevelId,
        streamId: scheme.streamId ?? undefined,
        subjectId: scheme.subjectId,
        title: scheme.title ?? undefined,
        description: scheme.description ?? undefined,
        weekCount: scheme.weekCount,
        status,
      })
      setScheme(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the scheme')
    }
  }

  const handleDelete = async (entry: SchemeOfWorkEntry) => {
    if (!window.confirm(`Remove “${entry.topic}” from the scheme?`)) return
    setBusyEntryId(entry.id)
    setError(null)
    try {
      setScheme(await deleteSchemeEntry(subdomain, entry.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove the topic')
    } finally {
      setBusyEntryId(null)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    setNotice(null)
    try {
      const created = await generatePlansFromScheme(subdomain, {
        schemeOfWorkId: scheme.id,
      })
      setScheme(await fetchSchemeOfWork(subdomain, scheme.id))
      setNotice(
        created > 0
          ? `${created} draft lesson plan${created === 1 ? '' : 's'} created.`
          : 'Every topic already has its draft lesson plans.',
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not generate lesson plans',
      )
    } finally {
      setGenerating(false)
    }
  }

  const totalPlanned = scheme.entries.reduce(
    (total, entry) => total + entry.plannedLessons,
    0,
  )
  const topicsCovered = scheme.entries.filter(
    (entry) => entry.status === 'COVERED',
  ).length

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-5 lg:px-0 lg:py-0">
      <style>{`
        @media print {
          .app-print-hide { display: none !important; }
          body { background: #fff; }
        }
      `}</style>
      <div className="app-print-hide flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/teacher/lesson-plans">
            <ArrowLeft className="size-4" />
            Lesson plans
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-3.5" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generating || scheme.entries.length === 0}
          >
            {generating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            Generate lesson plans
          </Button>
          <Button
            size="sm"
            onClick={() =>
              setEntryDialog({
                draft: emptyDraft(
                  1,
                  (scheme.entries.filter((entry) => entry.weekNumber === 1)
                    .length ?? 0) + 1,
                ),
              })
            }
          >
            <Plus className="size-3.5" />
            Add topic
          </Button>
        </div>
      </div>

      <header className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Scheme of work
            </p>
            <h1 className="mt-0.5 text-lg font-semibold leading-snug">
              {scheme.className}
              {scheme.streamName ? ` ${scheme.streamName}` : ''} ·{' '}
              {scheme.subjectName}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {scheme.entries.length} topics · {totalPlanned} planned lessons ·{' '}
              {topicsCovered} covered
            </p>
          </div>
          <div className="flex items-center gap-1">
            {(['DRAFT', 'ACTIVE', 'ARCHIVED'] as SchemeOfWorkStatus[]).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(status)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                    scheme.status === status
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/40',
                  )}
                >
                  {status === 'DRAFT'
                    ? 'Draft'
                    : status === 'ACTIVE'
                      ? 'Active'
                      : 'Archived'}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {scheme.deliveredLessons} of {scheme.plannedLessons} lessons
              delivered
            </span>
            <span>{scheme.coveragePercent}% of the scheme</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, scheme.coveragePercent)}%` }}
            />
          </div>
        </div>

        {notice && (
          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            {notice}
          </p>
        )}
        {error && (
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            {error}
          </p>
        )}
      </header>

      <div className="space-y-2.5">
        {weeks.map(({ weekNumber, entries }) => {
          const collapsed = collapsedWeeks.has(weekNumber)
          const planned = entries.reduce(
            (total, entry) => total + entry.plannedLessons,
            0,
          )
          const delivered = entries.reduce(
            (total, entry) => total + entry.deliveredLessons,
            0,
          )
          return (
            <section
              key={weekNumber}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggleWeek(weekNumber)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                    W{weekNumber}
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {entries.length === 0
                        ? 'No topics planned'
                        : entries.map((entry) => entry.topic).join(' · ')}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {entries.length} topics · {delivered}/{planned} lessons
                      delivered
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'size-4 shrink-0 text-muted-foreground transition-transform',
                    collapsed && '-rotate-90',
                  )}
                />
              </button>

              {!collapsed && (
                <div className="space-y-2 border-t border-border px-3 py-3">
                  {entries.length === 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setEntryDialog({ draft: emptyDraft(weekNumber) })
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary"
                    >
                      <Plus className="size-3.5" />
                      Add a topic to week {weekNumber}
                    </button>
                  )}

                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-border bg-background p-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-sm font-medium">{entry.topic}</p>
                            <SchemeEntryStatusPill status={entry.status} />
                            {entry.originalWeekNumber &&
                              entry.originalWeekNumber !== entry.weekNumber && (
                                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                                  moved from W{entry.originalWeekNumber}
                                </span>
                              )}
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {entry.strand ? `${entry.strand} · ` : ''}
                            {entry.plannedLessons} lesson
                            {entry.plannedLessons === 1 ? '' : 's'} ·{' '}
                            {entry.deliveredLessons} delivered
                          </p>
                          {entry.specificLearningOutcomes && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {entry.specificLearningOutcomes}
                            </p>
                          )}
                          {entry.reason && (
                            <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
                              Note: {entry.reason}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() =>
                              setEntryDialog({ draft: draftFromEntry(entry) })
                            }
                            aria-label="Edit topic"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-rose-600"
                            onClick={() => handleDelete(entry)}
                            disabled={busyEntryId === entry.id}
                            aria-label="Delete topic"
                          >
                            {busyEntryId === entry.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {entries.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground"
                      onClick={() =>
                        setEntryDialog({
                          draft: emptyDraft(weekNumber, entries.length + 1),
                        })
                      }
                    >
                      <Plus className="size-3.5" />
                      Add another topic
                    </Button>
                  )}
                </div>
              )}
            </section>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
        <BookOpen className="size-4" />
        <span>
          Moving a topic keeps its original week and records why. Coverage only
          advances when lessons are recorded.
        </span>
        <Button
          variant="link"
          size="sm"
          className="ml-auto h-auto p-0 text-xs"
          onClick={() => router.push('/teacher/lesson-plans')}
        >
          Go to lesson plans
        </Button>
      </div>

      {entryDialog && (
      <EntryDialog
        open
        onOpenChange={(open) => {
          if (!open) setEntryDialog(null)
        }}
        subdomain={subdomain}
        schemeId={scheme.id}
        draft={entryDialog?.draft ?? emptyDraft(1)}
        weekCount={Math.max(
          scheme.weekCount,
          ...scheme.entries.map((entry) => entry.weekNumber + 4),
          13,
        )}
        onSaved={(updated) => {
          setScheme(updated)
          setNotice(null)
        }}
        onError={setError}
      />
      )}
    </div>
  )
}
