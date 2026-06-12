'use client'

import Link from 'next/link'
import {
  BookOpen,
  Calendar,
  ChevronRight,
  GraduationCap,
  Globe,
  Layers,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  examTimetableFill,
  statusLabel,
  type ExamSessionRecord,
} from '@/lib/exams/examSessions'
import { examSessionPath } from '@/lib/school/schoolRoutes'
import { cn } from '@/lib/utils'
import {
  examTypeChipClass,
  examMicroLabelClass,
  examTableHeadClass,
  examTableShellClass,
  sessionStatusChipClass,
  timetableFillProgressClass,
} from './exam-session-ui'

interface ExamSessionsTableProps {
  subdomain: string
  sessions: ExamSessionRecord[]
  publishingId: string | null
  onTogglePublish: (sessionId: string, published: boolean) => void
}

const TABLE_SHELL =
  'overflow-hidden rounded-xl border border-slate-200/80 bg-white ring-1 ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:ring-slate-800'

const TABLE_HEAD =
  'border-b border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-slate-50/40 dark:border-slate-800 dark:from-slate-900/90 dark:to-slate-900/50'

const TH =
  'text-[10px] font-semibold uppercase tracking-wider text-slate-400'

function formatSessionDates(session: ExamSessionRecord, short = false) {
  if (!session.startDate) return null
  const opts: Intl.DateTimeFormatOptions = short
    ? { day: 'numeric', month: 'short' }
    : { day: 'numeric', month: 'short', year: 'numeric' }
  const start = new Date(session.startDate).toLocaleDateString('en-KE', opts)
  if (!session.endDate || session.endDate === session.startDate) {
    return start
  }
  const end = new Date(session.endDate).toLocaleDateString('en-KE', opts)
  return `${start} – ${end}`
}

function timetablePercentClass(percent: number) {
  if (percent >= 100) return 'text-emerald-600 dark:text-emerald-400'
  if (percent >= 50) return 'text-[#246a59]'
  if (percent > 0) return 'text-amber-600 dark:text-amber-400'
  return 'text-slate-400'
}

function timetableStrokeColor(percent: number) {
  if (percent >= 100) return '#10b981'
  if (percent >= 50) return '#246a59'
  if (percent > 0) return '#f59e0b'
  return '#cbd5e1'
}

function SessionTypeIcon({
  type,
  size = 'md',
}: {
  type: ExamSessionRecord['type']
  size?: 'sm' | 'md'
}) {
  const isExam = type === 'EXAM'
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg ring-1',
        size === 'sm' ? 'h-7 w-7' : 'h-7 w-7',
        isExam
          ? 'bg-[#246a59]/10 text-[#246a59] ring-[#246a59]/15'
          : 'bg-[#0073ea]/10 text-[#0073ea] ring-[#0073ea]/15',
      )}
    >
      <BookOpen className="h-3 w-3" />
    </div>
  )
}

function TimetableRing({
  percent,
  scheduled,
  total,
  size = 44,
}: {
  percent: number
  scheduled: number
  total: number
  size?: number
}) {
  if (total <= 0) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full border border-dashed border-slate-200 text-[9px] text-slate-400 dark:border-slate-700"
        style={{ width: size, height: size }}
      >
        —
      </div>
    )
  }

  const stroke = 3
  const radius = (size - stroke * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      title={`${scheduled} of ${total} papers scheduled`}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-100 dark:text-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={timetableStrokeColor(percent)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            'text-[10px] font-bold tabular-nums leading-none',
            timetablePercentClass(percent),
          )}
        >
          {percent}%
        </span>
      </div>
    </div>
  )
}

function ScopeMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: number
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
      <Icon className="h-3 w-3 shrink-0 text-slate-400" />
      <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
        {value}
      </span>
      <span className="hidden min-[1100px]:inline">{label}</span>
    </span>
  )
}

function TimetableCell({ session }: { session: ExamSessionRecord }) {
  const timetable = examTimetableFill(session)

  if (timetable.total <= 0) {
    return <span className="text-[11px] text-slate-400">—</span>
  }

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={cn(
            'text-xs font-bold tabular-nums',
            timetablePercentClass(timetable.percent),
          )}
        >
          {timetable.percent}%
        </span>
        <span className="text-[9px] tabular-nums text-slate-400">
          {timetable.scheduled}/{timetable.total}
        </span>
      </div>
      <Progress
        value={timetable.percent}
        className={cn('h-1', timetableFillProgressClass(timetable.percent))}
      />
    </div>
  )
}

function MobileStatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white px-2 py-2 text-center dark:bg-slate-900">
      <p className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">
        {value}
      </p>
      <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  )
}

function MobileListSummary({ sessions }: { sessions: ExamSessionRecord[] }) {
  const fills = sessions.map((s) => examTimetableFill(s))
  const withPapers = fills.filter((f) => f.total > 0)
  const complete = withPapers.filter((f) => f.percent >= 100).length
  const avgFill =
    withPapers.length > 0
      ? Math.round(
          withPapers.reduce((sum, f) => sum + f.percent, 0) / withPapers.length,
        )
      : 0

  return (
    <div className="grid grid-cols-3 gap-2 border-b border-slate-100 bg-[#246a59]/[0.03] px-3 py-2.5 dark:border-slate-800 dark:bg-[#246a59]/10">
      <div className="text-center">
        <p className="text-base font-bold tabular-nums text-slate-800 dark:text-slate-100">
          {sessions.length}
        </p>
        <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
          Sessions
        </p>
      </div>
      <div className="border-x border-slate-200/80 text-center dark:border-slate-700">
        <p className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
          {complete}
        </p>
        <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
          Fully scheduled
        </p>
      </div>
      <div className="text-center">
        <p
          className={cn(
            'text-base font-bold tabular-nums',
            timetablePercentClass(avgFill),
          )}
        >
          {withPapers.length > 0 ? `${avgFill}%` : '—'}
        </p>
        <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
          Avg timetable
        </p>
      </div>
    </div>
  )
}

function SessionActions({
  href,
  session,
  isPublishing,
  onTogglePublish,
  mobile = false,
}: {
  href: string
  session: ExamSessionRecord
  isPublishing: boolean
  onTogglePublish: (sessionId: string, published: boolean) => void
  mobile?: boolean
}) {
  if (mobile) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex-1 rounded-lg border-slate-200/80 text-[11px] text-slate-600"
          disabled={isPublishing}
          onClick={(e) => {
            e.preventDefault()
            onTogglePublish(session.id, session.resultsPublished)
          }}
        >
          {isPublishing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <Globe className="mr-1 h-3 w-3" />
              {session.resultsPublished ? 'Unpublish' : 'Publish'}
            </>
          )}
        </Button>
        <Button
          size="sm"
          className="h-8 flex-1 gap-0.5 rounded-lg bg-[#246a59] text-[11px] text-white hover:bg-[#1a4c40]"
          asChild
        >
          <Link href={href}>
            Open
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="outline"
        size="sm"
        className="hidden h-7 rounded-md border-slate-200/80 px-2 text-[10px] font-medium text-slate-600 hover:border-[#246a59]/30 hover:bg-[#246a59]/5 hover:text-[#246a59] xl:inline-flex"
        disabled={isPublishing}
        onClick={() => onTogglePublish(session.id, session.resultsPublished)}
      >
        {isPublishing ? (
          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
        ) : (
          <Globe className="mr-1.5 h-3 w-3" />
        )}
        {session.resultsPublished ? 'Unpublish' : 'Publish'}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-md text-slate-400 hover:bg-[#246a59]/10 hover:text-[#246a59] xl:hidden"
        disabled={isPublishing}
        title={
          session.resultsPublished ? 'Unpublish results' : 'Publish results'
        }
        onClick={() => onTogglePublish(session.id, session.resultsPublished)}
      >
        {isPublishing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Globe className="h-3.5 w-3.5" />
        )}
      </Button>
      <Button
        size="sm"
        className="h-7 gap-0.5 rounded-md bg-[#246a59] px-2.5 text-[11px] text-white shadow-sm shadow-[#246a59]/20 hover:bg-[#1a4c40]"
        asChild
      >
        <Link href={href}>
          Open
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  )
}

/** Mobile-only: structured ledger rows — organized columns, creative rings & stat strip */
function ExamSessionsMobileTable({
  subdomain,
  sessions,
  publishingId,
  onTogglePublish,
}: ExamSessionsTableProps) {
  return (
    <div className={cn(examTableShellClass, 'lg:hidden')} aria-label="Exam sessions">
      <MobileListSummary sessions={sessions} />

      <div
        className={cn(
          examTableHeadClass,
          'grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-3 py-2',
        )}
      >
        <span className={examMicroLabelClass}>Session</span>
        <span className={cn(examMicroLabelClass, 'text-right')}>Timetable</span>
      </div>

      <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {sessions.map((session, index) => {
          const href = examSessionPath(subdomain, session.id)
          const dates = formatSessionDates(session, true)
          const timetable = examTimetableFill(session)
          const isPublishing = publishingId === session.id
          const isExam = session.type === 'EXAM'

          return (
            <li
              key={session.id}
              className={cn(
                'relative',
                index % 2 === 1 && 'bg-slate-50/50 dark:bg-slate-900/30',
              )}
            >
              <span
                className={cn(
                  'absolute inset-y-0 left-0 w-[3px]',
                  isExam
                    ? 'bg-gradient-to-b from-[#246a59] to-[#246a59]/30'
                    : 'bg-gradient-to-b from-[#0073ea] to-[#0073ea]/30',
                )}
                aria-hidden
              />

              {/* Primary row — mirrors table columns */}
              <Link
                href={href}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 pl-4 pr-3 active:bg-[#246a59]/5"
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  <SessionTypeIcon type={session.type} size="sm" />
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-slate-900 dark:text-slate-100">
                      {session.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span
                        className={cn(
                          'inline-flex rounded border px-1 py-px text-[9px] font-semibold uppercase tracking-wide',
                          examTypeChipClass(session.type),
                        )}
                      >
                        {session.type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Term {session.term} · {session.academicYear}
                      </span>
                    </div>
                  </div>
                </div>

                <TimetableRing
                  percent={timetable.percent}
                  scheduled={timetable.scheduled}
                  total={timetable.total}
                />
              </Link>

              {/* Scope strip — labeled cells like a table footer */}
              <div className="mx-3 mb-2 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-slate-200/80 bg-slate-200/80 dark:border-slate-700 dark:bg-slate-700">
                <MobileStatCell label="Grades" value={session.gradesCount} />
                <MobileStatCell label="Subjects" value={session.subjectsCount} />
                <MobileStatCell label="Papers" value={session.papersCount} />
              </div>

              {/* Meta + actions row */}
              <div className="space-y-2 px-3 pb-3 pl-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={sessionStatusChipClass(session.status)}>
                    {statusLabel(session.status)}
                  </span>
                  {session.resultsPublished ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Results live
                    </span>
                  ) : null}
                  {dates ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white px-1.5 py-0.5 text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                      <Calendar className="h-2.5 w-2.5" />
                      {dates}
                    </span>
                  ) : null}
                </div>

                <SessionActions
                  href={href}
                  session={session}
                  isPublishing={isPublishing}
                  onTogglePublish={onTogglePublish}
                  mobile
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ExamSessionsDesktopTable({
  subdomain,
  sessions,
  publishingId,
  onTogglePublish,
}: ExamSessionsTableProps) {
  return (
    <div className={cn(examTableShellClass, 'hidden lg:block')}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className={examTableHeadClass}>
              <th className={cn('px-3 py-2 text-left', examMicroLabelClass)}>Exam session</th>
              <th className={cn('px-2 py-2 text-left', examMicroLabelClass)}>Period</th>
              <th className={cn('px-2 py-2 text-left', examMicroLabelClass)}>Scope</th>
              <th className={cn('px-2 py-2 text-left', examMicroLabelClass)}>Dates</th>
              <th className={cn('w-[120px] px-2 py-2 text-left', examMicroLabelClass)}>Timetable</th>
              <th className={cn('px-2 py-2 text-left', examMicroLabelClass)}>Status</th>
              <th className={cn('w-[148px] px-2 py-2 text-right', examMicroLabelClass)}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {sessions.map((session) => {
              const dates = formatSessionDates(session)
              const href = examSessionPath(subdomain, session.id)
              const isPublishing = publishingId === session.id

              return (
                <tr
                  key={session.id}
                  className="group relative transition-colors hover:bg-[#246a59]/[0.025] dark:hover:bg-[#246a59]/5"
                >
                  <td className="relative px-3 py-2">
                    <span
                      className="absolute inset-y-0 left-0 w-0.5 scale-y-0 bg-[#246a59] transition-transform group-hover:scale-y-100"
                      aria-hidden
                    />
                    <div className="flex items-center gap-2">
                      <SessionTypeIcon type={session.type} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Link
                            href={href}
                            className="text-[13px] font-semibold text-slate-900 transition-colors hover:text-[#246a59] dark:text-slate-100 dark:hover:text-emerald-300"
                          >
                            {session.name}
                          </Link>
                          <span
                            className={cn(
                              'inline-flex rounded border px-1 py-px text-[9px] font-semibold uppercase tracking-wide',
                              examTypeChipClass(session.type),
                            )}
                          >
                            {session.type}
                          </span>
                        </div>
                        {session.description ? (
                          <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                            {session.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-2">
                    <div className="text-[11px] leading-tight">
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        Term {session.term}
                      </span>
                      <span className="text-slate-400"> · </span>
                      <span className="text-slate-500">{session.academicYear}</span>
                    </div>
                  </td>

                  <td className="px-2 py-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <ScopeMetric
                        icon={GraduationCap}
                        value={session.gradesCount}
                        label={session.gradesCount === 1 ? 'grade' : 'grades'}
                      />
                      <span className="text-slate-200 dark:text-slate-700">·</span>
                      <ScopeMetric
                        icon={Layers}
                        value={session.subjectsCount}
                        label={
                          session.subjectsCount === 1 ? 'subject' : 'subjects'
                        }
                      />
                      <span className="text-slate-200 dark:text-slate-700">·</span>
                      <ScopeMetric
                        icon={BookOpen}
                        value={session.papersCount}
                        label={session.papersCount === 1 ? 'paper' : 'papers'}
                      />
                    </div>
                  </td>

                  <td className="px-2 py-2">
                    {dates ? (
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                        <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="leading-snug">{dates}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">Not set</span>
                    )}
                  </td>

                  <td className="px-2 py-2">
                    <TimetableCell session={session} />
                  </td>

                  <td className="px-2 py-2">
                    <div className="flex flex-col items-start gap-1">
                      <span className={sessionStatusChipClass(session.status)}>
                        {statusLabel(session.status)}
                      </span>
                      {session.resultsPublished ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Results live
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-2 py-2">
                    <SessionActions
                      href={href}
                      session={session}
                      isPublishing={isPublishing}
                      onTogglePublish={onTogglePublish}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ExamSessionsTable(props: ExamSessionsTableProps) {
  return (
    <>
      <ExamSessionsMobileTable {...props} />
      <ExamSessionsDesktopTable {...props} />
    </>
  )
}
