'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  examEmptyStateClass,
  examIconTileClass,
  examMicroLabelClass,
  examPanelHeaderBarClass,
  examSectionNavClass,
  examTabActiveClass,
  examTabIdleClass,
} from './exam-session-ui'

export function ExamSectionNav<T extends string>({
  items,
  active,
  onChange,
  className,
}: {
  items: ReadonlyArray<{
    id: T
    label: string
    icon: React.ComponentType<{ className?: string }>
  }>
  active: T
  onChange: (id: T) => void
  className?: string
}) {
  return (
    <nav className={cn(examSectionNavClass, className)} aria-label="Exam sections">
      {items.map(({ id, label, icon: Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              'flex shrink-0 snap-start items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all',
              isActive ? examTabActiveClass : examTabIdleClass,
            )}
          >
            <Icon className="h-3 w-3 shrink-0" />
            {label}
          </button>
        )
      })}
    </nav>
  )
}

export function ExamPanelHeader({
  icon: Icon,
  title,
  description,
  actions,
  tone = 'teal',
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  actions?: ReactNode
  tone?: 'teal' | 'blue' | 'violet' | 'amber'
  className?: string
}) {
  return (
    <div className={cn(examPanelHeaderBarClass, className)}>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <div className={cn(examIconTileClass(tone), 'h-7 w-7')}>
            <Icon className="h-3 w-3" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100 sm:text-sm">
              {title}
            </h2>
            {description ? (
              <p className="truncate text-[10px] text-slate-600 sm:text-[11px]">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  )
}

export function ExamEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className={examEmptyStateClass}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-700">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function ExamStatStrip({
  cells,
  footer,
  className,
}: {
  cells: Array<{ label: string; value: string | number; sub?: string }>
  footer?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200/80 bg-slate-200/80 dark:border-slate-700 dark:bg-slate-700',
        className,
      )}
    >
      <div
        className="grid gap-px"
        style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
      >
        {cells.map((cell) => (
          <div
            key={cell.label}
            className="bg-white px-1.5 py-2 text-center dark:bg-slate-900"
          >
            <p className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">
              {cell.value}
            </p>
            <p className={examMicroLabelClass}>{cell.label}</p>
            {cell.sub ? (
              <p className="mt-0.5 text-[10px] tabular-nums text-slate-500">{cell.sub}</p>
            ) : null}
          </div>
        ))}
      </div>
      {footer ? (
        <div className="border-t border-slate-200/80 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
          {footer}
        </div>
      ) : null}
    </div>
  )
}
