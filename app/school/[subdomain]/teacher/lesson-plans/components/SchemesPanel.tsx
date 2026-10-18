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
import {
  saveSchemeOfWork,
  type LessonPlanPeriod,
  type SchemeOfWork,
  type SchemeOfWorkStatus,
} from '@/lib/lesson-planning/api'
import { PlannerEmptyState } from './PlannerEmptyState'
import { SchemeCard } from './SchemeCard'

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
      <div className="grid gap-3 md:grid-cols-2">
        {[0, 1].map((index) => (
          <div key={index} className="h-32 animate-pulse rounded-3xl bg-muted/60" />
        ))}
      </div>
    )
  }

  if (schemes.length === 0) {
    return (
      <PlannerEmptyState
        icon={Sparkles}
        title="No scheme of work yet"
        description={emptyHint}
        action={
          <Button size="sm" className="rounded-xl" onClick={onCreate}>
            <Plus className="size-4" />
            Create scheme of work
          </Button>
        }
      />
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {schemes.map((scheme) => (
        <SchemeCard
          key={scheme.id}
          scheme={scheme}
          onOpen={() => router.push(`/teacher/schemes-of-work/${scheme.id}`)}
        />
      ))}
    </div>
  )
}
