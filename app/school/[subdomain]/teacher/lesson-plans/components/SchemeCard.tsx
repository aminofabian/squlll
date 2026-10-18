import { ChevronRight } from 'lucide-react'
import type { SchemeOfWork, SchemeOfWorkStatus } from '@/lib/lesson-planning/api'
import { cn } from '@/lib/utils'
import { getSubjectAccent } from '../utils/getSubjectAccent'

const FULL_PERCENT = 100

const STATUS_LABELS: Record<SchemeOfWorkStatus, string> = {
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
}

export function SchemeCard({ scheme, onOpen }: { scheme: SchemeOfWork; onOpen: () => void }) {
  const classLabel = [scheme.className, scheme.streamName].filter(Boolean).join(' ')

  return (
    <button type="button" onClick={onOpen} className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/30">
      <div className="flex items-start gap-2.5">
        <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', getSubjectAccent(scheme.subjectId).dot)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{scheme.title || `${scheme.className} ${scheme.subjectName}`}</p>
          <p className="truncate text-xs text-muted-foreground">
            {classLabel} · {scheme.subjectName} · {scheme.entries.length} topics · {STATUS_LABELS[scheme.status] ?? STATUS_LABELS.DRAFT}
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${Math.min(FULL_PERCENT, scheme.coveragePercent)}%` }} />
        </div>
        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
          {scheme.deliveredLessons}/{scheme.plannedLessons} · {scheme.coveragePercent}%
        </span>
      </div>
    </button>
  )
}
