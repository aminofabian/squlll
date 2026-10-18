import { cn } from '@/lib/utils'
import type {
  LessonDeliveryStatus,
  LessonPlanStatus,
  SchemeEntryStatus,
} from '@/lib/lesson-planning/api'

const PLAN_STYLES: Record<LessonPlanStatus, { label: string; className: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  },
  SUBMITTED: {
    label: 'Awaiting review',
    className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  RETURNED: {
    label: 'Returned',
    className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
  },
}

const DELIVERY_STYLES: Record<
  LessonDeliveryStatus,
  { label: string; className: string }
> = {
  TAUGHT: {
    label: 'Taught',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  PARTIAL: {
    label: 'Partly taught',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  },
  NOT_TAUGHT: {
    label: 'Not taught',
    className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
}

const ENTRY_STYLES: Record<
  SchemeEntryStatus,
  { label: string; className: string }
> = {
  PLANNED: {
    label: 'Planned',
    className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  IN_PROGRESS: {
    label: 'In progress',
    className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
  },
  COVERED: {
    label: 'Covered',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  PARTIAL: {
    label: 'Partly covered',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  },
  SKIPPED: {
    label: 'Skipped',
    className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
  },
}

function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
        className,
      )}
    >
      {label}
    </span>
  )
}

export function LessonPlanStatusPill({
  status,
  className,
}: {
  status: LessonPlanStatus
  className?: string
}) {
  const config = PLAN_STYLES[status] ?? PLAN_STYLES.DRAFT
  return <Pill label={config.label} className={cn(config.className, className)} />
}

export function LessonDeliveryStatusPill({
  status,
  className,
}: {
  status: LessonDeliveryStatus
  className?: string
}) {
  const config = DELIVERY_STYLES[status] ?? DELIVERY_STYLES.NOT_TAUGHT
  return <Pill label={config.label} className={cn(config.className, className)} />
}

export function SchemeEntryStatusPill({
  status,
  className,
}: {
  status: SchemeEntryStatus
  className?: string
}) {
  const config = ENTRY_STYLES[status] ?? ENTRY_STYLES.PLANNED
  return <Pill label={config.label} className={cn(config.className, className)} />
}
