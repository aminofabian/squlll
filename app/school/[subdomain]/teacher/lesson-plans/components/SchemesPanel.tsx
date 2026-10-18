'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  saveSchemeOfWork,
  type LessonPlanPeriod,
  type SchemeOfWork,
  type SchemeOfWorkStatus,
} from '@/lib/lesson-planning/api'

function coverageTone(percent: number) {
  if (percent >= 80) return 'bg-emerald-500'
  if (percent >= 40) return 'bg-amber-500'
  return 'bg-primary'
}

export function CreateSchemeDialog({
  open,
  onOpenChange,
  subdomain,
  termId,
  periods,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  subdomain: string
  termId: string
  periods: LessonPlanPeriod[]
}) {
  const router = useRouter()
  const options = useMemo(() => {
    const map = new Map<
      string,
      { gradeLevelId: string; className: string; subjects: Map<string, string> }
    >()
    for (const period of periods) {
      const key = `${period.gradeLevelId}:${period.className}`
      const existing =
        map.get(key) ??
        {
          gradeLevelId: period.gradeLevelId,
          className: period.className,
          subjects: new Map<string, string>(),
        }
      existing.subjects.set(period.subjectId, period.subjectName)
      map.set(key, existing)
    }
    return [...map.entries()].map(([key, value]) => ({ key, ...value }))
  }, [periods])

  const [classKey, setClassKey] = useState(options[0]?.key ?? '')
  const selectedClass = options.find((option) => option.key === classKey) ?? options[0]
  const subjectOptions = selectedClass
    ? [...selectedClass.subjects.entries()]
    : []
  const [subjectId, setSubjectId] = useState(subjectOptions[0]?.[0] ?? '')
  const [weekCount, setWeekCount] = useState('13')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!selectedClass || !subjectId) {
      setError('Choose a class and learning area')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const scheme = await saveSchemeOfWork(subdomain, {
        termId,
        gradeLevelId: selectedClass.gradeLevelId,
        subjectId,
        title: `${selectedClass.className} ${
          selectedClass.subjects.get(subjectId) ?? ''
        }`.trim(),
        weekCount: Number(weekCount) || 13,
        status: 'ACTIVE' as SchemeOfWorkStatus,
      })
      onOpenChange(false)
      router.push(`/teacher/schemes-of-work/${scheme.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the scheme')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New scheme of work</DialogTitle>
          <DialogDescription>
            One roadmap per class and learning area for the term. Lesson plans
            then pick topics from it automatically.
          </DialogDescription>
        </DialogHeader>

        {options.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            Your timetable has no periods for this term yet, so there is no class
            or learning area to attach a scheme to.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={classKey}
                onChange={(event) => {
                  setClassKey(event.target.value)
                  const next = options.find(
                    (option) => option.key === event.target.value,
                  )
                  setSubjectId(next ? [...next.subjects.keys()][0] ?? '' : '')
                }}
              >
                {options.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.className}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Learning area</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
              >
                {subjectOptions.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weeks">Teaching weeks</Label>
              <Input
                id="weeks"
                type="number"
                min={1}
                max={52}
                value={weekCount}
                onChange={(event) => setWeekCount(event.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={saving || options.length === 0}
          >
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Create scheme
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SchemesPanel({
  schemes,
  loading,
  onCreate,
  emptyHint,
}: {
  schemes: SchemeOfWork[]
  loading: boolean
  onCreate: () => void
  emptyHint: string
}) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-border bg-muted/40"
          />
        ))}
      </div>
    )
  }

  if (schemes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted">
          <Sparkles className="size-5 text-muted-foreground" />
        </div>
        <h3 className="mt-3 text-sm font-semibold">No scheme of work yet</h3>
        <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
          {emptyHint}
        </p>
        <Button className="mt-4" size="sm" onClick={onCreate}>
          <Plus className="size-4" />
          Create scheme of work
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {schemes.map((scheme) => (
        <button
          key={scheme.id}
          type="button"
          onClick={() => router.push(`/teacher/schemes-of-work/${scheme.id}`)}
          className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/40"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {scheme.title || `${scheme.className} ${scheme.subjectName}`}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {scheme.className}
                {scheme.streamName ? ` ${scheme.streamName}` : ''} ·{' '}
                {scheme.subjectName} · {scheme.entries.length} topics
              </p>
            </div>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[11px] font-medium',
                scheme.status === 'ACTIVE'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : scheme.status === 'ARCHIVED'
                    ? 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
              )}
            >
              {scheme.status === 'ACTIVE'
                ? 'Active'
                : scheme.status === 'ARCHIVED'
                  ? 'Archived'
                  : 'Draft'}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {scheme.deliveredLessons} of {scheme.plannedLessons} lessons
                delivered
              </span>
              <span>{scheme.coveragePercent}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full rounded-full', coverageTone(scheme.coveragePercent))}
                style={{ width: `${Math.min(100, scheme.coveragePercent)}%` }}
              />
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
