'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { AlertCircle, BookMarked, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { tp } from '../styles/portal'
import { cn } from '@/lib/utils'
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
    <div className={tp.page}>
      <div className={tp.stack}>
      <PageHeader
        eyebrow={selectedTerm?.name ?? 'Term'}
        title="Schemes of work"
        description="The term roadmap for each class and learning area. Topics here feed straight into lesson plans."
        actions={
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="h-10 gap-2 rounded-full px-5 text-[13px] font-semibold shadow-sm shadow-primary/20"
          >
            <Plus className="size-4" />
            New scheme
          </Button>
        }
      />

      <Panel padded={false} delay={1} className="grid grid-cols-3 divide-x divide-border/70">
        {[
          { label: 'Schemes', value: schemes.length },
          { label: 'Planned', value: totals.planned },
          { label: 'Delivered', value: totals.delivered },
        ].map((stat) => (
          <div key={stat.label} className="px-5 py-5 sm:px-6">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-[1.9rem] leading-none tracking-[-0.02em] text-foreground">
              {stat.value}
            </p>
            <p className="mt-1.5 text-[11.5px] text-muted-foreground/85">
              {stat.label === 'Schemes' ? 'This term' : stat.label === 'Planned' ? 'Lessons mapped' : 'Marked done'}
            </p>
          </div>
        ))}
      </Panel>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200/80 bg-rose-50/70 px-4 py-3 text-[13px] text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className={cn(tp.card, 'space-y-3 p-5')}>
          <div className="tp-skeleton h-4 w-1/3 rounded-full" />
          <div className="tp-skeleton h-16 w-full rounded-xl" />
          <div className="tp-skeleton h-16 w-full rounded-xl" />
        </div>
      ) : (
        <SchemesPanel
          schemes={schemes}
          loading={false}
          onCreate={() => setDialogOpen(true)}
          emptyHint="Start with the class and learning area you teach most, then map the term week by week."
        />
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/25 p-4 text-[12px] leading-relaxed text-muted-foreground">
        <BookMarked className="mt-0.5 size-4 shrink-0 text-primary/70" />
        <p>
          A scheme is the term roadmap. A lesson plan is one lesson. A lesson record is
          what actually happened. They stay linked but separate.
        </p>
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
    </div>
  )
}
