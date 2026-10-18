'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  AlertTriangle,
  BookMarked,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileWarning,
  RefreshCw,
  Users,
} from 'lucide-react'
import {
  SchoolEmpty,
  SchoolLoading,
  SchoolPage,
  SchoolPanel,
  SchoolStat,
  outlineButtonClass,
  selectShell,
} from '@/components/school/SchoolContentPage'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSelectedTerm } from '@/lib/hooks/useSelectedTerm'
import {
  fetchAcademicSupervision,
  fetchLessonPlansForReview,
  type AcademicSupervision,
  type LessonPlan,
  type SupervisionFilter,
} from '@/lib/lesson-planning/api'
import { LessonPlanStatusPill } from '@/components/lesson-planning/StatusPill'
import { ReviewPlanDialog } from '@/components/lesson-planning/ReviewPlanDialog'

type Tab = 'teachers' | 'review' | 'coverage'

function addDays(ymd: string, days: number) {
  const date = new Date(`${ymd}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function formatWeek(start: string, end: string) {
  const format = (value: string) =>
    new Date(`${value}T12:00:00Z`).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    })
  return `${format(start)} – ${format(end)}`
}

export default function LessonPlanSupervisionPage() {
  const params = useParams()
  const subdomain =
    typeof params.subdomain === 'string'
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ''
  const { selectedTerm, termsLoading } = useSelectedTerm()
  const termId = selectedTerm?.id

  const [anchor, setAnchor] = useState<string | undefined>(undefined)
  const [overview, setOverview] = useState<AcademicSupervision | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('teachers')
  const [teacherFilter, setTeacherFilter] = useState<string>('')

  const [plans, setPlans] = useState<LessonPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null)

  const filter: SupervisionFilter = useMemo(
    () => (teacherFilter ? { teacherId: teacherFilter } : {}),
    [teacherFilter],
  )

  const loadOverview = useCallback(async () => {
    if (!subdomain || !termId) return
    setLoading(true)
    setError(null)
    try {
      setOverview(await fetchAcademicSupervision(subdomain, termId, anchor))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load the academic supervision figures',
      )
      setOverview(null)
    } finally {
      setLoading(false)
    }
  }, [subdomain, termId, anchor])

  const loadPlans = useCallback(
    async (options?: { onlySubmitted?: boolean }) => {
      if (!subdomain || !termId) return
      setPlansLoading(true)
      try {
        const rows = await fetchLessonPlansForReview(
          subdomain,
          termId,
          options?.onlySubmitted ? 'SUBMITTED' : undefined,
          filter,
        )
        setPlans(rows)
      } catch {
        setPlans([])
      } finally {
        setPlansLoading(false)
      }
    },
    [subdomain, termId, filter],
  )

  useEffect(() => {
    if (termsLoading) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadOverview()
  }, [loadOverview, termsLoading])

  useEffect(() => {
    if (termsLoading || !termId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPlans({ onlySubmitted: tab === 'review' && !teacherFilter })
  }, [loadPlans, tab, teacherFilter, termId, termsLoading])

  const handleReviewed = (updated: LessonPlan) => {
    setPlans((current) =>
      current.map((plan) => (plan.id === updated.id ? updated : plan)),
    )
    setSelectedPlan(updated)
    void loadOverview()
  }

  const reviewQueue = plans.filter((plan) => plan.status === 'SUBMITTED')
  const teacherName =
    overview?.teachers.find((teacher) => teacher.teacherId === teacherFilter)
      ?.teacherName ?? null

  if (!termsLoading && !termId) {
    return (
      <SchoolPage
        eyebrow="Academics"
        title="Lesson plans"
        subtitle="Preparation, delivery and curriculum coverage."
      >
        <SchoolEmpty
          icon={CalendarRange}
          title="No active term"
          description="Set up an academic term before supervising lesson planning."
        />
      </SchoolPage>
    )
  }

  return (
    <SchoolPage
      eyebrow="Academics"
      title="Lesson plans"
      subtitle="Supervision across teachers, classes and learning areas."
      actions={
        <>
          <div className="flex items-center border border-[#1a4d42]/15 bg-white dark:border-white/15 dark:bg-[#0c1a17]">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg"
              onClick={() =>
                overview && setAnchor(addDays(overview.weekStartDate, -7))
              }
              disabled={!overview}
              aria-label="Previous week"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[104px] text-center text-xs">
              {overview
                ? formatWeek(overview.weekStartDate, overview.weekEndDate)
                : '—'}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg"
              onClick={() =>
                overview && setAnchor(addDays(overview.weekStartDate, 7))
              }
              disabled={!overview}
              aria-label="Next week"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className={outlineButtonClass}
            onClick={() => setAnchor(undefined)}
          >
            This week
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={outlineButtonClass}
            onClick={() => {
              void loadOverview()
              void loadPlans({ onlySubmitted: tab === 'review' && !teacherFilter })
            }}
            disabled={loading}
          >
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
            Refresh
          </Button>
        </>
      }
    >
      {error && (
        <div className="flex items-start gap-2 border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SchoolStat
          label="Plans prepared"
          value={`${overview?.preparationRate ?? 0}%`}
          hint={`${overview?.plansPrepared ?? 0} of ${
            overview?.scheduledLessons ?? 0
          } scheduled lessons`}
          icon={BookMarked}
        />
        <SchoolStat
          label="Awaiting review"
          value={overview?.awaitingReview ?? 0}
          hint="Submitted plans"
          icon={ClipboardCheck}
        />
        <SchoolStat
          label="Lessons not recorded"
          value={overview?.lessonsNotRecorded ?? 0}
          hint="Past scheduled periods"
          icon={FileWarning}
        />
        <SchoolStat
          label="Coverage behind plan"
          value={overview?.coverageBehind ?? 0}
          hint="Class–subject combinations"
          icon={AlertTriangle}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1a4d42]/12 pb-2 dark:border-white/10">
        <div className="flex flex-wrap gap-1">
          {(
            [
              ['teachers', `Teachers (${overview?.teachers.length ?? 0})`],
              ['review', `Review queue (${reviewQueue.length})`],
              ['coverage', `Coverage (${overview?.coverageBehind ?? 0})`],
            ] as Array<[Tab, string]>
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                tab === value
                  ? 'bg-[#0a1f1a] text-white dark:bg-white dark:text-[#0a1f1a]'
                  : 'text-[#1a4d42]/60 hover:bg-[#246a59]/10 dark:text-white/50',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            className={cn(selectShell, 'h-8 px-2 text-xs')}
            value={teacherFilter}
            onChange={(event) => setTeacherFilter(event.target.value)}
          >
            <option value="">All teachers</option>
            {(overview?.teachers ?? []).map((teacher) => (
              <option key={teacher.teacherId} value={teacher.teacherId}>
                {teacher.teacherName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && !overview ? (
        <SchoolLoading label="Loading supervision data…" />
      ) : tab === 'teachers' ? (
        <SchoolPanel icon={Users} title="Preparation and delivery by teacher">
          {(overview?.teachers ?? []).length === 0 ? (
            <SchoolEmpty
              icon={Users}
              title="No teachers with scheduled lessons this week"
              description="Figures appear once the timetable is published for the selected week."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#1a4d42]/10 text-left dark:border-white/10">
                    {[
                      'Teacher',
                      'Scheduled',
                      'Plans',
                      'Prepared',
                      'Recorded',
                      'Not recorded',
                      'Review',
                      'Behind plan',
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="py-2 pr-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45 dark:text-white/40"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {overview?.teachers.map((teacher) => (
                    <tr
                      key={teacher.teacherId}
                      className="border-b border-[#1a4d42]/8 last:border-0 dark:border-white/5"
                    >
                      <td className="py-2.5 pr-3">
                        <p className="font-medium text-[#0a1f1a] dark:text-white">
                          {teacher.teacherName}
                        </p>
                        <p className="text-[11px] text-[#1a4d42]/45 dark:text-white/40">
                          {teacher.email ?? '—'}
                        </p>
                      </td>
                      <td className="py-2.5 pr-3">{teacher.scheduledLessons}</td>
                      <td className="py-2.5 pr-3">{teacher.plansPrepared}</td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={cn(
                            'font-medium',
                            teacher.preparationRate >= 80
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : teacher.preparationRate >= 50
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-rose-700 dark:text-rose-400',
                          )}
                        >
                          {teacher.preparationRate}%
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">{teacher.lessonsRecorded}</td>
                      <td className="py-2.5 pr-3">
                        {teacher.lessonsNotRecorded > 0 ? (
                          <span className="text-amber-700 dark:text-amber-400">
                            {teacher.lessonsNotRecorded}
                          </span>
                        ) : (
                          0
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        {teacher.awaitingReview > 0
                          ? `${teacher.awaitingReview} submitted`
                          : teacher.returnedPlans > 0
                            ? `${teacher.returnedPlans} returned`
                            : '—'}
                      </td>
                      <td className="py-2.5 pr-3">
                        {teacher.coverageBehind > 0 ? (
                          <span className="text-rose-700 dark:text-rose-400">
                            {teacher.coverageBehind}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 border-t border-[#1a4d42]/10 pt-4 dark:border-white/10">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/50 dark:text-white/40">
                {teacherName ? `${teacherName}'s plans` : 'Latest plans'}
              </h3>
              <span className="text-[11px] text-[#1a4d42]/45 dark:text-white/40">
                {plans.length} plans
              </span>
            </div>
            {plansLoading ? (
              <SchoolLoading label="Loading plans…" />
            ) : plans.length === 0 ? (
              <p className="py-4 text-sm text-[#1a4d42]/50 dark:text-white/40">
                No lesson plans yet for this selection.
              </p>
            ) : (
              <ul className="divide-y divide-[#1a4d42]/8 dark:divide-white/5">
                {plans.slice(0, 25).map((plan) => (
                  <li key={plan.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:bg-[#246a59]/5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#0a1f1a] dark:text-white">
                          {plan.topic || plan.subjectName}
                        </p>
                        <p className="truncate text-[11px] text-[#1a4d42]/45 dark:text-white/40">
                          {plan.teacherName} · {plan.className} · {plan.lessonDate}
                        </p>
                      </div>
                      <LessonPlanStatusPill status={plan.status} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SchoolPanel>
      ) : tab === 'review' ? (
        <SchoolPanel icon={ClipboardCheck} title="Awaiting review">
          {plansLoading ? (
            <SchoolLoading label="Loading the review queue…" />
          ) : reviewQueue.length === 0 ? (
            <SchoolEmpty
              icon={ClipboardCheck}
              title="Nothing awaiting review"
              description="Plans appear here when teachers submit them. Submission is optional per school policy."
            />
          ) : (
            <ul className="divide-y divide-[#1a4d42]/8 dark:divide-white/5">
              {reviewQueue.map((plan) => (
                <li key={plan.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className="flex w-full flex-wrap items-center justify-between gap-2 py-3 text-left hover:bg-[#246a59]/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#0a1f1a] dark:text-white">
                        {plan.topic || plan.subjectName}
                      </p>
                      <p className="truncate text-[11px] text-[#1a4d42]/45 dark:text-white/40">
                        {plan.teacherName} · {plan.className} ·{' '}
                        {plan.subjectName} · {plan.lessonDate}
                        {plan.submittedAt
                          ? ` · submitted ${new Date(plan.submittedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`
                          : ''}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-[#246a59]">
                      Review
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SchoolPanel>
      ) : (
        <SchoolPanel icon={AlertTriangle} title="Coverage behind plan">
          {(overview?.coverageGaps ?? []).length === 0 ? (
            <SchoolEmpty
              icon={AlertTriangle}
              title="No coverage gaps"
              description="Delivered lessons match the scheme of work up to this week."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#1a4d42]/10 text-left dark:border-white/10">
                    {['Class', 'Learning area', 'Teacher', 'Expected', 'Delivered', 'Gap'].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="py-2 pr-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45 dark:text-white/40"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {overview?.coverageGaps.map((gap) => (
                    <tr
                      key={`${gap.gradeLevelId}-${gap.subjectId}-${gap.teacherId}`}
                      className="border-b border-[#1a4d42]/8 last:border-0 dark:border-white/5"
                    >
                      <td className="py-2.5 pr-3">{gap.className}</td>
                      <td className="py-2.5 pr-3">{gap.subjectName}</td>
                      <td className="py-2.5 pr-3">{gap.teacherName}</td>
                      <td className="py-2.5 pr-3">{gap.expectedLessons}</td>
                      <td className="py-2.5 pr-3">{gap.deliveredLessons}</td>
                      <td className="py-2.5 pr-3 font-medium text-rose-700 dark:text-rose-400">
                        {gap.expectedLessons - gap.deliveredLessons} lessons
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-[11px] text-[#1a4d42]/50 dark:text-white/40">
                Expected lessons come from scheme-of-work topics due by this
                week. Delivered lessons come from teacher lesson records.
              </p>
            </div>
          )}
        </SchoolPanel>
      )}

      <div className="border border-[#1a4d42]/12 bg-white p-4 text-xs text-[#1a4d42]/55 dark:border-white/10 dark:bg-[#0c1a17] dark:text-white/45">
        Preparation, delivery and coverage are reported separately on purpose. A
        teacher with complete paperwork can still need support with learner
        understanding, and a teacher with missing forms may be teaching well.
      </div>

      {selectedPlan && (
        <ReviewPlanDialog
          key={selectedPlan.id}
          plan={selectedPlan}
          open
          onOpenChange={(open) => {
            if (!open) setSelectedPlan(null)
          }}
          subdomain={subdomain}
          onReviewed={handleReviewed}
        />
      )}
    </SchoolPage>
  )
}
