import { ArrowUpRight, Map as MapIcon } from 'lucide-react'
import type { SchemeOfWork, SchemeOfWorkStatus } from '@/lib/lesson-planning/api'
import { cn } from '@/lib/utils'
import { getSubjectAccent } from '../utils/getSubjectAccent'

const FULL_PERCENT = 100
const STRONG_COVERAGE_PERCENT = 80
const FAIR_COVERAGE_PERCENT = 40

const STATUS_STYLES: Record<SchemeOfWorkStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  DRAFT: { label: 'Draft', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
  ARCHIVED: { label: 'Archived', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
}

function coverageTone(percent: number) {
  if (percent >= STRONG_COVERAGE_PERCENT) return 'bg-emerald-500'
  if (percent >= FAIR_COVERAGE_PERCENT) return 'bg-amber-500'
  return 'bg-primary'
}

export function SchemeCard({ scheme, onOpen }: { scheme: SchemeOfWork; onOpen: () => void }) {
  const accent = getSubjectAccent(scheme.subjectId)
  const status = STATUS_STYLES[scheme.status] ?? STATUS_STYLES.DRAFT
  const classLabel = [scheme.className, scheme.streamName].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col rounded-3xl border border-border/70 bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-2xl', accent.soft)}>
          <MapIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{scheme.title || `${scheme.className} ${scheme.subjectName}`}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {classLabel} · {scheme.subjectName} · {scheme.entries.length} topics
          </p>
        </div>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className={cn('rounded-full px-2 py-0.5 font-medium', status.className)}>{status.label}</span>
          <span className="tabular-nums">
            {scheme.deliveredLessons}/{scheme.plannedLessons} lessons · <span className="font-semibold text-foreground">{scheme.coveragePercent}%</span>
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className={cn('h-full rounded-full transition-[width] duration-700', coverageTone(scheme.coveragePercent))} style={{ width: `${Math.min(FULL_PERCENT, scheme.coveragePercent)}%` }} />
        </div>
      </div>
    </button>
  )
}
