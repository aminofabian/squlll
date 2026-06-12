'use client'

import { useState, type ReactNode } from 'react'
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  Layers,
  Sparkles,
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { ClassOrganizerGroup, SubjectCluster } from '@/lib/exams/examSessionOrganize'
import { examMicroLabelClass, examTableHeadClass } from './exam-session-ui'

export const CLASS_ACCENTS = [
  {
    bar: 'from-[#246a59] via-teal-500 to-emerald-400',
    bg: 'from-[#246a59]/10 via-[#246a59]/5 to-transparent',
    ring: 'ring-[#246a59]/25',
    chip: 'bg-[#246a59]/10 text-[#1a4c40] dark:text-emerald-200',
    dot: 'bg-[#246a59]',
  },
  {
    bar: 'from-[#0073ea] via-sky-500 to-cyan-400',
    bg: 'from-[#0073ea]/10 via-[#0073ea]/5 to-transparent',
    ring: 'ring-[#0073ea]/25',
    chip: 'bg-[#0073ea]/10 text-[#0073ea]',
    dot: 'bg-[#0073ea]',
  },
  {
    bar: 'from-violet-500 via-purple-500 to-fuchsia-400',
    bg: 'from-violet-500/10 via-violet-500/5 to-transparent',
    ring: 'ring-violet-500/25',
    chip: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    dot: 'bg-violet-500',
  },
  {
    bar: 'from-amber-500 via-orange-500 to-yellow-400',
    bg: 'from-amber-500/10 via-amber-500/5 to-transparent',
    ring: 'ring-amber-500/25',
    chip: 'bg-amber-500/10 text-amber-800 dark:text-amber-200',
    dot: 'bg-amber-500',
  },
] as const

export function classAccentForIndex(index: number) {
  return CLASS_ACCENTS[index % CLASS_ACCENTS.length]
}

function subjectInitials(name: string, code?: string) {
  if (code && code.length <= 4) return code.toUpperCase()
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function SessionScopeStrip({
  gradeCount,
  subjectCount,
  paperCount,
  extra,
  className,
}: {
  gradeCount: number
  subjectCount: number
  paperCount: number
  extra?: ReactNode
  className?: string
}) {
  const cells = [
    { label: 'Classes', value: gradeCount, icon: GraduationCap },
    { label: 'Subjects', value: subjectCount, icon: BookOpen },
    { label: 'Papers', value: paperCount, icon: Layers },
  ]

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-r from-white via-slate-50/50 to-white dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900',
        className,
      )}
    >
      <div className="grid grid-cols-3 divide-x divide-slate-200/80 dark:divide-slate-800">
        {cells.map(({ label, value, icon: Icon }) => (
          <div key={label} className="px-3 py-2.5 text-center">
            <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-lg bg-[#246a59]/10 text-[#246a59]">
              <Icon className="h-3 w-3" />
            </div>
            <p className="text-base font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {value}
            </p>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              {label}
            </p>
          </div>
        ))}
      </div>
      {extra ? (
        <div className="border-t border-slate-200/80 px-3 py-2 dark:border-slate-800">
          {extra}
        </div>
      ) : null}
    </div>
  )
}

export function SessionClassSection({
  gradeName,
  gradeIndex,
  subjectCount,
  paperCount,
  progress,
  progressLabel,
  defaultOpen = true,
  variant = 'default',
  children,
}: {
  gradeName: string
  gradeIndex: number
  subjectCount: number
  paperCount: number
  progress?: number
  progressLabel?: string
  defaultOpen?: boolean
  variant?: 'default' | 'table'
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const accent = classAccentForIndex(gradeIndex)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <article
        className={cn(
          'relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
        )}
      >
        <div
          className={cn('absolute inset-y-0 left-0 w-1 bg-gradient-to-b', accent.bar)}
          aria-hidden
        />

        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex w-full items-start gap-3 bg-gradient-to-r px-4 py-3 pl-5 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40',
              accent.bg,
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1',
                accent.chip,
                accent.ring,
              )}
            >
              <GraduationCap className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {gradeName}
                </h3>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    accent.chip,
                  )}
                >
                  {subjectCount} subject{subjectCount === 1 ? '' : 's'}
                </span>
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-slate-200/80 dark:bg-slate-900/80 dark:ring-slate-700">
                  {paperCount} paper{paperCount === 1 ? '' : 's'}
                </span>
              </div>
              {progressLabel ? (
                <p className="mt-0.5 text-[11px] text-slate-500">{progressLabel}</p>
              ) : null}
              {progress != null ? (
                <Progress value={progress} className="mt-2 h-1.5 max-w-xs" />
              ) : null}
            </div>

            <ChevronDown
              className={cn(
                'mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform',
                open && 'rotate-180',
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div
            className={cn(
              'border-t border-slate-100 dark:border-slate-800',
              variant === 'table'
                ? 'overflow-hidden'
                : 'space-y-3 px-3 py-3 pl-5',
            )}
          >
            {children}
          </div>
        </CollapsibleContent>
      </article>
    </Collapsible>
  )
}

export function SessionSubjectCluster({
  subjectName,
  subjectCode,
  paperCount,
  accentIndex = 0,
  children,
}: {
  subjectName: string
  subjectCode?: string
  paperCount: number
  accentIndex?: number
  children: ReactNode
}) {
  const accent = classAccentForIndex(accentIndex)

  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200/70 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/40',
      )}
    >
      <header className="flex items-center gap-2.5 border-b border-slate-200/60 px-3 py-2 dark:border-slate-800">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ring-1',
            accent.chip,
            accent.ring,
          )}
        >
          {subjectInitials(subjectName, subjectCode)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
            {subjectName}
          </p>
          <p className="text-[10px] text-slate-500">
            {paperCount} paper{paperCount === 1 ? '' : 's'}
          </p>
        </div>
        <Sparkles className="h-3 w-3 shrink-0 text-slate-300 dark:text-slate-600" />
      </header>
      <div className="grid gap-2 p-2 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  )
}

export function SessionClassTable({
  columns,
  children,
  className,
}: {
  columns: string[]
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className={examTableHeadClass}>
            {columns.map((column) => (
              <th
                key={column}
                className={cn('px-3 py-2 text-left', examMicroLabelClass)}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {children}
        </tbody>
      </table>
    </div>
  )
}

export function SessionClassTableRow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30',
        className,
      )}
    >
      {children}
    </tr>
  )
}

export function SessionClassTableCell({
  children,
  className,
  rowSpan,
  align = 'left',
}: {
  children: ReactNode
  className?: string
  rowSpan?: number
  align?: 'left' | 'right' | 'center'
}) {
  return (
    <td
      rowSpan={rowSpan}
      className={cn(
        'px-3 py-2 align-middle text-slate-700 dark:text-slate-300',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </td>
  )
}

export function SessionPaperTile({
  title,
  subtitle,
  status,
  actions,
  accentDotClass,
  onClick,
  className,
}: {
  title: string
  subtitle?: ReactNode
  status?: ReactNode
  actions?: ReactNode
  accentDotClass?: string
  onClick?: () => void
  className?: string
}) {
  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group relative flex flex-col rounded-xl border border-slate-200/80 bg-white p-2.5 text-left shadow-sm transition-all dark:border-slate-700 dark:bg-slate-900',
        onClick &&
          'cursor-pointer hover:-translate-y-0.5 hover:border-[#246a59]/30 hover:shadow-md hover:shadow-[#246a59]/10',
        className,
      )}
    >
      {accentDotClass ? (
        <span
          className={cn('absolute left-0 top-3 h-4 w-0.5 rounded-r-full', accentDotClass)}
          aria-hidden
        />
      ) : null}
      <div className="flex items-start justify-between gap-2 pl-1">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs font-semibold leading-snug text-slate-900 dark:text-slate-100">
            {title}
          </p>
          {subtitle ? (
            <div className="mt-1 text-[10px] text-slate-500">{subtitle}</div>
          ) : null}
        </div>
        {actions ? (
          <div
            className="flex shrink-0 items-center gap-0.5"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        ) : null}
      </div>
      {status ? <div className="mt-2 pl-1">{status}</div> : null}
    </Wrapper>
  )
}

export function SessionMiniProgressRing({
  percent,
  size = 36,
}: {
  percent: number
  size?: number
}) {
  const stroke = 3
  const radius = (size - stroke * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference
  const color =
    percent >= 100 ? '#10b981' : percent >= 50 ? '#246a59' : percent > 0 ? '#f59e0b' : '#cbd5e1'

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      title={`${percent}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
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
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold tabular-nums text-slate-700 dark:text-slate-200">
        {percent}%
      </span>
    </div>
  )
}

export function SessionOrganizerEmpty({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#246a59]/10 text-[#246a59] ring-1 ring-[#246a59]/15">
        <Layers className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export type { ClassOrganizerGroup, SubjectCluster }
