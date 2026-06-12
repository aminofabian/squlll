'use client'

import { Calendar, GraduationCap, Layers, PenLine, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  examTimetableFill,
  type ExamSessionRecord,
} from '@/lib/exams/examSessions'
import { cn } from '@/lib/utils'
import {
  examIconTileClass,
  examStatCardClass,
  timetableFillProgressClass,
} from './exam-session-ui'
import { ExamStatStrip } from './ExamModuleChrome'
import { Progress } from '@/components/ui/progress'

interface ExamSessionOverviewProps {
  session: ExamSessionRecord
  onNavigate: (tab: 'papers' | 'timetable' | 'marks') => void
}

function BentoCard({
  children,
  className,
  accent,
}: {
  children: React.ReactNode
  className?: string
  accent: 'teal' | 'blue' | 'violet' | 'amber'
}) {
  const accents = {
    teal: 'from-[#246a59]/20',
    blue: 'from-[#0073ea]/20',
    violet: 'from-violet-500/20',
    amber: 'from-amber-500/20',
  }
  return (
    <div className={cn(examStatCardClass, 'relative', className)}>
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b to-transparent opacity-60',
          accents[accent],
        )}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  )
}

function QuickLink({
  label,
  icon: Icon,
  onClick,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-200/60 bg-gradient-to-b from-white to-slate-50/80 px-2 py-2.5 text-[10px] font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#246a59]/30 hover:shadow-md dark:border-slate-700 dark:from-slate-900 dark:to-slate-900/80 dark:text-slate-300"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#246a59]/15 to-[#0073ea]/10 ring-1 ring-[#246a59]/10 transition-transform group-hover:scale-105">
        <Icon className="h-3 w-3 text-[#246a59]" />
      </span>
      {label}
    </button>
  )
}

export function ExamSessionOverview({
  session,
  onNavigate,
}: ExamSessionOverviewProps) {
  const timetable = examTimetableFill(session)
  const dateRange = session.startDate
    ? `${new Date(session.startDate).toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'short',
      })}${
        session.endDate && session.endDate !== session.startDate
          ? ` – ${new Date(session.endDate).toLocaleDateString('en-KE', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}`
          : `, ${new Date(session.startDate).getFullYear()}`
      }`
    : null

  return (
    <div className="space-y-4">
      <ExamStatStrip
        className="sm:hidden"
        cells={[
          { label: 'Grades', value: session.gradesCount },
          { label: 'Subjects', value: session.subjectsCount },
          { label: 'Papers', value: session.papersCount },
          {
            label: 'Scheduled',
            value: timetable.total > 0 ? `${timetable.percent}%` : '—',
            sub:
              timetable.total > 0
                ? `${timetable.scheduled}/${timetable.total}`
                : undefined,
          },
        ]}
        footer={
          timetable.total > 0 ? (
            <Progress
              value={timetable.percent}
              className={cn('h-1', timetableFillProgressClass(timetable.percent))}
            />
          ) : undefined
        }
      />

      <div className="grid grid-cols-3 gap-2 sm:hidden">
        <QuickLink label="Papers" icon={Layers} onClick={() => onNavigate('papers')} />
        <QuickLink label="Timetable" icon={Calendar} onClick={() => onNavigate('timetable')} />
        <QuickLink label="Marks" icon={PenLine} onClick={() => onNavigate('marks')} />
      </div>

      {/* Bento desktop grid */}
      <div className="hidden gap-3 sm:grid sm:grid-cols-6 sm:grid-rows-2">
        <BentoCard accent="teal" className="sm:col-span-2 sm:row-span-2">
          <div className="mb-3 flex items-center gap-2.5">
            <div className={examIconTileClass('teal')}>
              <GraduationCap className="h-4 w-4" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Scope</p>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Grades', value: session.gradesCount },
              { label: 'Subjects', value: session.subjectsCount },
              { label: 'Papers', value: session.papersCount },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2 ring-1 ring-slate-200/60 dark:bg-slate-800/60 dark:ring-slate-700"
              >
                <span className="text-xs text-slate-600">{label}</span>
                <span className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 h-8 w-full rounded-xl border-[#246a59]/20 text-xs hover:bg-[#246a59]/5 hover:text-[#246a59]"
            onClick={() => onNavigate('papers')}
          >
            Manage papers
          </Button>
        </BentoCard>

        <BentoCard accent="blue" className="sm:col-span-2">
          <div className="mb-2 flex items-center gap-2.5">
            <div className={examIconTileClass('blue')}>
              <Calendar className="h-4 w-4" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Dates</p>
          </div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
            {dateRange ?? 'Not set'}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-7 px-0 text-xs text-[#246a59] hover:bg-transparent"
            onClick={() => onNavigate('timetable')}
          >
            Open timetable →
          </Button>
        </BentoCard>

        <BentoCard accent="violet" className="sm:col-span-2">
          <div className="mb-2 flex items-center gap-2.5">
            <div className={examIconTileClass('violet')}>
              <PenLine className="h-4 w-4" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Marking</p>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Max <span className="font-bold text-slate-800 dark:text-slate-100">{session.defaultMaxScore ?? '—'}</span>
            {' · '}
            Pass <span className="font-bold text-slate-800 dark:text-slate-100">{session.defaultPassMark ?? '—'}</span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-7 px-0 text-xs text-[#246a59] hover:bg-transparent"
            onClick={() => onNavigate('marks')}
          >
            Enter marks →
          </Button>
        </BentoCard>

        <BentoCard accent="amber" className="sm:col-span-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-[#246a59]" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Timetable progress
              </p>
            </div>
            <span className="text-xl font-bold tabular-nums text-[#246a59]">
              {timetable.total > 0 ? `${timetable.percent}%` : '—'}
            </span>
          </div>
          {timetable.total > 0 ? (
            <>
              <Progress
                value={timetable.percent}
                className={cn('mt-2 h-1.5', timetableFillProgressClass(timetable.percent))}
              />
              <p className="mt-2 text-xs text-slate-600">
                {timetable.scheduled} of {timetable.total} papers scheduled on the grid
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-slate-600">No papers to schedule yet.</p>
          )}
        </BentoCard>
      </div>

      {(session.description || session.instructions) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {session.description ? (
            <BentoCard accent="teal" className="sm:col-span-1">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Description
              </p>
              <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap dark:text-slate-400">
                {session.description}
              </p>
            </BentoCard>
          ) : null}
          {session.instructions ? (
            <BentoCard accent="blue" className="sm:col-span-1">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Instructions
              </p>
              <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap dark:text-slate-400">
                {session.instructions}
              </p>
            </BentoCard>
          ) : null}
        </div>
      )}
    </div>
  )
}
