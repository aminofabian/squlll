'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertCircle,
  BookMarked,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Layers,
  Loader2,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSelectedTerm } from '@/lib/hooks/useSelectedTerm'
import {
  fetchMyLessonPlans,
  fetchMyLessonWeek,
  fetchMySchemesOfWork,
  startLessonPlan,
  type LessonPlan,
  type LessonPlanPeriod,
  type LessonPlanWeek,
  type SchemeOfWork,
} from '@/lib/lesson-planning/api'
import { WeekBoard } from './components/WeekBoard'
import { PlansPanel } from './components/PlansPanel'
import { CreateSchemeDialog, SchemesPanel } from './components/SchemesPanel'
import { RecordLessonDialog } from './components/RecordLessonDialog'

type Tab = 'week' | 'plans' | 'schemes'

function addDays(ymd: string, days: number) {
  const date = new Date(`${ymd}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function formatWeekLabel(week: LessonPlanWeek) {
  const start = new Date(`${week.weekStartDate}T12:00:00Z`)
  const end = new Date(`${week.weekEndDate}T12:00:00Z`)
  const day = (date: Date) =>
    date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    })
  return `${day(start)} – ${day(end)}`
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string
  value: string | number
  hint?: string
  icon: React.ElementType
  tone?: 'primary' | 'amber' | 'emerald'
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            'flex size-7 items-center justify-center rounded-full',
            tone === 'amber'
              ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
              : tone === 'emerald'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'bg-primary/10 text-primary',
          )}
        >
          <Icon className="size-3.5" />
        </span>
      </div>
      <p className="mt-1 text-2xl font-semibold leading-tight">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

export default function TeacherLessonPlansPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain =
    typeof params.subdomain === 'string'
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ''

  const { selectedTerm, termsLoading } = useSelectedTerm()
  const termId = selectedTerm?.id

  const [anchor, setAnchor] = useState<string | undefined>(undefined)
  const [week, setWeek] = useState<LessonPlanWeek | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('week')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [preparingId, setPreparingId] = useState<string | null>(null)

  const [plans, setPlans] = useState<LessonPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [schemes, setSchemes] = useState<SchemeOfWork[]>([])
  const [schemesLoading, setSchemesLoading] = useState(false)
  const [schemeDialogOpen, setSchemeDialogOpen] = useState(false)

  const [recordTarget, setRecordTarget] = useState<LessonPlanPeriod | null>(null)

  const loadWeek = useCallback(
    async (signal?: { cancelled: boolean }) => {
      if (!subdomain || !termId) return
      setLoading(true)
      setError(null)
      try {
        const data = await fetchMyLessonWeek(subdomain, termId, anchor)
        if (signal?.cancelled) return
        setWeek(data)
        setSelectedDate((current) => {
          if (current && data.days.some((day) => day.date === current)) {
            return current
          }
          const today = data.days.find((day) => day.date === data.today)
          if (today && today.periods.length) return today.date
          const withPeriods = data.days.find((day) => day.periods.length > 0)
          return withPeriods?.date ?? data.days[0]?.date ?? ''
        })
      } catch (err) {
        if (signal?.cancelled) return
        setError(
          err instanceof Error ? err.message : 'Could not load your timetable',
        )
        setWeek(null)
      } finally {
        if (!signal?.cancelled) setLoading(false)
      }
    },
    [subdomain, termId, anchor],
  )

  useEffect(() => {
    if (termsLoading) return
    if (!termId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWeek(null)
      setLoading(false)
      return
    }
    const signal = { cancelled: false }
    void loadWeek(signal)
    return () => {
      signal.cancelled = true
    }
  }, [loadWeek, termId, termsLoading])

  useEffect(() => {
    if (!subdomain || !termId) return
    if (tab === 'plans' && plans.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlansLoading(true)
      fetchMyLessonPlans(subdomain, termId)
        .then(setPlans)
        .catch(() => setPlans([]))
        .finally(() => setPlansLoading(false))
    }
    if (tab === 'schemes' && schemes.length === 0) {
      setSchemesLoading(true)
      fetchMySchemesOfWork(subdomain, termId)
        .then(setSchemes)
        .catch(() => setSchemes([]))
        .finally(() => setSchemesLoading(false))
    }
  }, [tab, subdomain, termId, plans.length, schemes.length])

  const handlePrepare = async (period: LessonPlanPeriod) => {
    if (!termId) return
    setPreparingId(period.timetableEntryId)
    setError(null)
    try {
      const plan = await startLessonPlan(subdomain, {
        timetableEntryId: period.timetableEntryId,
        termId,
        date: period.date,
      })
      router.push(`/teacher/lesson-plans/${plan.id}`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not start the lesson plan',
      )
      setPreparingId(null)
    }
  }

  const handleRecordSaved = async () => {
    setRecordTarget(null)
    await loadWeek()
    if (plans.length) {
      void fetchMyLessonPlans(subdomain, termId!)
        .then(setPlans)
        .catch(() => undefined)
    }
    if (schemes.length) {
      void fetchMySchemesOfWork(subdomain, termId!)
        .then(setSchemes)
        .catch(() => undefined)
    }
  }

  const stats = week?.stats
  const weekPeriods = useMemo(
    () => week?.days.flatMap((day) => day.periods) ?? [],
    [week],
  )

  if (!termsLoading && !termId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <CalendarRange className="mx-auto size-6 text-muted-foreground" />
          <h1 className="mt-3 text-base font-semibold">No active term yet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lesson planning starts once your school sets up an academic term.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 lg:px-0 lg:py-0">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {selectedTerm?.name ?? 'Term'}
          </p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight">
            Lesson plans
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Prepare from your timetable, teach from the plan, then record what
            actually happened.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-card">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() =>
                week && setAnchor(addDays(week.weekStartDate, -7))
              }
              disabled={!week}
              aria-label="Previous week"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[112px] text-center text-xs font-medium">
              {week ? formatWeekLabel(week) : '—'}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => week && setAnchor(addDays(week.weekStartDate, 7))}
              disabled={!week}
              aria-label="Next week"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setAnchor(undefined)}>
            Today
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Scheduled"
          value={stats?.scheduledLessons ?? 0}
          hint={week ? `Week ${week.weekNumber}` : undefined}
          icon={Layers}
        />
        <StatCard
          label="Plans prepared"
          value={`${stats?.preparationRate ?? 0}%`}
          hint={`${stats?.plansPrepared ?? 0} of ${
            stats?.scheduledLessons ?? 0
          } lessons`}
          icon={BookMarked}
          tone="emerald"
        />
        <StatCard
          label="To record"
          value={stats?.lessonsNotRecorded ?? 0}
          hint="Past periods without a record"
          icon={ClipboardCheck}
          tone="amber"
        />
        <StatCard
          label="Awaiting review"
          value={stats?.submitted ?? 0}
          hint="Submitted plans"
          icon={AlertCircle}
        />
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-border pb-1">
        <div className="flex gap-1">
          {(
            [
              ['week', 'This week'],
              ['plans', 'All plans'],
              ['schemes', 'Schemes of work'],
            ] as Array<[Tab, string]>
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                'relative px-3 py-2 text-sm font-medium transition-colors',
                tab === value
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
              {tab === value && (
                <span className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
        <Button size="sm" variant="outline" onClick={() => setSchemeDialogOpen(true)}>
          <Plus className="size-4" />
          Scheme
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !week ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-16">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : tab === 'week' ? (
        week ? (
          <WeekBoard
            data={week}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrepare={handlePrepare}
            onRecord={setRecordTarget}
            preparingId={preparingId}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            Could not load this week. Make sure a timetable has been set up for{' '}
            {selectedTerm?.name ?? 'this term'}.
          </div>
        )
      ) : tab === 'plans' ? (
        <PlansPanel plans={plans} loading={plansLoading} />
      ) : (
        <SchemesPanel
          schemes={schemes}
          loading={schemesLoading}
          onCreate={() => setSchemeDialogOpen(true)}
          emptyHint="A scheme of work maps topics to weeks so lesson plans arrive pre-filled. Create one for a class you teach."
        />
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
        <BookMarked className="size-4" />
        <span>
          Planning, delivery and coverage are tracked separately. A topic is only
          marked covered when you record the lesson.
        </span>
        <Link
          href="/teacher/schemes-of-work"
          className="ml-auto inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          All schemes
          <ChevronRight className="size-3" />
        </Link>
      </div>

      <CreateSchemeDialog
        open={schemeDialogOpen}
        onOpenChange={setSchemeDialogOpen}
        subdomain={subdomain}
        termId={termId!}
        periods={weekPeriods}
      />

      {recordTarget && termId && (
        <RecordLessonDialog
          open={Boolean(recordTarget)}
          onOpenChange={(open) => {
            if (!open) setRecordTarget(null)
          }}
          subdomain={subdomain}
          termId={termId}
          target={{ kind: 'period', period: recordTarget }}
          existing={recordTarget.record}
          onSaved={handleRecordSaved}
        />
      )}
    </div>
  )
}
