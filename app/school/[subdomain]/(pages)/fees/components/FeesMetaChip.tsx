'use client'

import { cn } from '@/lib/utils'
import { FEES_LAYOUT } from '../lib/fees-ui'

export type FeesMetaChipTone = 'default' | 'amber' | 'emphasis'

const chipTone: Record<FeesMetaChipTone, { box: string; value: string }> = {
  default: {
    box: 'border-slate-200/80 bg-slate-50/80',
    value: 'text-slate-800',
  },
  amber: {
    box: 'border-amber-200/70 bg-amber-50/70',
    value: 'text-amber-900',
  },
  emphasis: {
    box: 'border-emerald-200/70 bg-emerald-50/50',
    value: 'text-emerald-900',
  },
}

type FeesMetaChipProps = {
  label: string
  value: string
  tone?: FeesMetaChipTone
  className?: string
}

export function FeesMetaChip({
  label,
  value,
  tone = 'default',
  className,
}: FeesMetaChipProps) {
  const styles = chipTone[tone]

  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-1.5 rounded-lg border px-2 py-1',
        styles.box,
        className,
      )}
    >
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span
        className={cn(
          'min-w-0 text-xs font-semibold leading-none tabular-nums',
          styles.value,
          FEES_LAYOUT.textWrap,
        )}
      >
        {value}
      </span>
    </div>
  )
}

type FeesMetaChipGridProps = {
  children: React.ReactNode
  /** `grid` — 2 columns on mobile (plan header). `row` — single wrapping row (preview toolbar). */
  layout?: 'grid' | 'row'
  className?: string
}

export function FeesMetaChipGrid({
  children,
  layout = 'grid',
  className,
}: FeesMetaChipGridProps) {
  return (
    <div
      className={cn(
        layout === 'grid'
          ? 'grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-1.5'
          : 'flex min-w-0 flex-1 flex-wrap items-center gap-1.5',
        className,
      )}
    >
      {children}
    </div>
  )
}
