import type { PeriodState } from '../utils/getPeriodState'

export const PERIOD_STATE_STYLES: Record<PeriodState, { label: string; dot: string; badge: string }> = {
  recorded: {
    label: 'Recorded',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  recordDue: {
    label: 'Record due',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  },
  planned: {
    label: 'Planned',
    dot: 'bg-sky-500',
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
  },
  unplanned: {
    label: 'Not planned',
    dot: 'bg-slate-300 dark:bg-slate-600',
    badge: 'bg-muted text-muted-foreground',
  },
}
