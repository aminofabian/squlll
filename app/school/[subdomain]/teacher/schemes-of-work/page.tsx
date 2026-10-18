'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { AlertCircle, BookMarked, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSelectedTerm } from '@/lib/hooks/useSelectedTerm'
import {
  fetchMyLessonWeek,
  fetchMySchemesOfWork,
  type LessonPlanPeriod,
  type SchemeOfWork,
} from '@/lib/lesson-planning/api'
import {
  CreateSchemeDialog,
  SchemesPanel,
} from '@/app/school/[subdomain]/teacher/lesson-plans/components/SchemesPanel'

export default function SchemesOfWorkPage() {
  const params = useParams()
  const subdomain =
    typeof params.subdomain === 'string'
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ''
  const { selectedTerm, termsLoading } = useSelectedTerm()
  const termId = selectedTerm?.id

  const [schemes, setSchemes] = useState<SchemeOfWork[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [periods, setPeriods] = useState<LessonPlanPeriod[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = useCallback(async () => {
    if (!subdomain || !termId) return
    setLoading(true)
    setError(null)
    try {
      const [schemeList, week] = await Promise.all([
        fetchMySchemesOfWork(subdomain, termId),
        fetchMyLessonWeek(subdomain, termId).catch(() => null),
      ])
      setSchemes(schemeList)
      setPeriods(week?.days.flatMap((day) => day.periods) ?? [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load schemes of work',
      )
    } finally {
      setLoading(false)
    }
  }, [subdomain, termId])

  useEffect(() => {
    if (termsLoading) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load, termsLoading])

  const totals = useMemo(
    () => ({
      planned: schemes.reduce((total, scheme) => total + scheme.plannedLessons, 0),
      delivered: schemes.reduce(
        (total, scheme) => total + scheme.deliveredLessons,
        0,
      ),
    }),
    [schemes],
  )

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-5 lg:px-0 lg:py-0">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {selectedTerm?.name ?? 'Term'}
          </p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight">
            Schemes of work
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            The term roadmap for each class and learning area. Topics here feed
            straight into lesson plans.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          New scheme
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Schemes
          </p>
          <p className="mt-1 text-2xl font-semibold">{schemes.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Planned lessons
          </p>
          <p className="mt-1 text-2xl font-semibold">{totals.planned}</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-border bg-card p-4 sm:col-span-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Delivered
          </p>
          <p className="mt-1 text-2xl font-semibold">{totals.delivered}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-16">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <SchemesPanel
          schemes={schemes}
          loading={false}
          onCreate={() => setDialogOpen(true)}
          emptyHint="Start with the class and learning area you teach most, then map the term week by week."
        />
      )}

      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
        <BookMarked className="size-4" />
        A scheme is the term roadmap; a lesson plan is one lesson; a lesson record
        is what actually happened. They stay linked but separate.
      </div>

      {termId && (
        <CreateSchemeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          subdomain={subdomain}
          termId={termId}
          periods={periods}
        />
      )}
    </div>
  )
}
