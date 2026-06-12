'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, ChevronDown, ChevronRight, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDurationMinutes, type ExamTimetableDraft } from './exam-timetable.utils'

interface ExamUnscheduledPanelProps {
  papers: ExamTimetableDraft[]
  placingPaperId: string | null
  onSelectPaper: (paperId: string) => void
  onOpenEditor: (paperId: string) => void
  className?: string
}

function UnscheduledPaperCard({
  row,
  isPlacing,
  compact,
  onClick,
  onDoubleClick,
}: {
  row: ExamTimetableDraft
  isPlacing: boolean
  compact?: boolean
  onClick: () => void
  onDoubleClick?: () => void
}) {
  const duration = formatDurationMinutes(row.durationMinutes)

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex shrink-0 snap-start flex-col border-2 px-2 py-1 text-center transition-colors',
          isPlacing
            ? 'border-[#246a59] bg-[#246a59] text-white'
            : 'border-[#246a59]/40 bg-white text-slate-900 hover:border-[#246a59] dark:bg-slate-950 dark:text-slate-100',
        )}
      >
        <span className="max-w-[7rem] truncate text-[10px] font-bold uppercase leading-tight tracking-wide">
          {row.subject}
        </span>
        {duration ? (
          <span
            className={cn(
              'mt-0.5 text-[9px] font-semibold leading-none',
              isPlacing ? 'text-white/85' : 'text-[#246a59]',
            )}
          >
            {duration}
          </span>
        ) : null}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        'group flex w-full items-center gap-1 border-l-[3px] px-2 py-1.5 text-left transition-colors',
        isPlacing
          ? 'border-l-[#246a59] bg-[#246a59] text-white'
          : 'border-l-[#246a59]/50 bg-white hover:border-l-[#246a59] hover:bg-[#246a59]/5 dark:bg-slate-950 dark:hover:bg-[#246a59]/10',
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'line-clamp-2 text-[10px] font-bold uppercase leading-snug tracking-wide',
            isPlacing ? 'text-white' : 'text-slate-900 dark:text-slate-100',
          )}
        >
          {row.subject}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-0.5">
          {duration ? (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-[9px] font-bold uppercase leading-none',
              isPlacing ? 'text-white/90' : 'text-[#246a59]',
            )}
          >
              <Clock className="h-2.5 w-2.5" />
              {duration}
            </span>
          ) : null}
          {row.grade ? (
            <span
              className={cn(
                'text-[9px] font-bold uppercase leading-none',
                isPlacing ? 'text-white/75' : 'text-slate-400',
              )}
            >
              · {row.grade}
            </span>
          ) : null}
        </div>
      </div>
      <ChevronRight
        className={cn(
          'h-2.5 w-2.5 shrink-0 opacity-40 group-hover:opacity-100',
          isPlacing ? 'text-white' : 'text-[#246a59]',
        )}
      />
    </button>
  )
}

export function ExamUnscheduledPanel({
  papers,
  placingPaperId,
  onSelectPaper,
  onOpenEditor,
  className,
}: ExamUnscheduledPanelProps) {
  const [expanded, setExpanded] = useState(false)

  const placingPaper = useMemo(
    () => papers.find((p) => p.paperId === placingPaperId),
    [papers, placingPaperId],
  )

  if (papers.length === 0) return null

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 flex-col overflow-hidden print:hidden',
        className,
      )}
    >
      {/* Desktop: fixed-height queue dock — matches table exactly */}
      <div
        className={cn(
          'relative flex h-full min-h-0 flex-col overflow-hidden border-2 border-[#246a59] bg-white dark:bg-slate-950',
          placingPaperId && 'ring-2 ring-[#246a59]/40 ring-offset-1',
        )}
      >
        {/* Vertical spine label — desktop only */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 hidden w-5 items-center justify-center border-r-2 border-[#246a59] bg-[#246a59] lg:flex"
          aria-hidden
        >
          <span
            className="text-[9px] font-black uppercase tracking-[0.18em] text-white"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Queue
          </span>
        </div>

        {/* Header */}
        <button
          type="button"
          className="relative shrink-0 border-b-2 border-[#246a59] bg-[#246a59]/5 pl-3 pr-2 py-2 text-left lg:pointer-events-none lg:cursor-default lg:pl-7 lg:py-2.5"
          onClick={() => setExpanded((open) => !open)}
        >
          <div className="flex items-center gap-2">
            <CalendarClock className="h-3.5 w-3.5 shrink-0 text-[#246a59]" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#246a59]">
                  Unscheduled
                </span>
                <span className="border-2 border-[#246a59] bg-[#246a59] px-1.5 py-px text-[9px] font-black tabular-nums leading-none text-white">
                  {papers.length}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[9px] font-semibold uppercase leading-snug tracking-wide text-slate-600">
                {placingPaper
                  ? `Placing: ${placingPaper.subject}`
                  : 'Pick paper → click slot'}
              </p>
            </div>
            <ChevronDown
              className={cn(
                'h-3 w-3 shrink-0 text-[#246a59] lg:hidden',
                expanded && 'rotate-180',
              )}
            />
          </div>
        </button>

        {/* Body — scrolls within table height */}
        <div
          className={cn(
            'relative flex min-h-0 flex-1 flex-col',
            !expanded && 'hidden lg:flex',
            expanded && 'flex',
          )}
        >
          {/* Mobile chips */}
          <div className="flex shrink-0 gap-0 overflow-x-auto border-b-2 border-[#246a59]/30 scrollbar-none lg:hidden">
            {papers.map((row) => (
              <div
                key={row.paperId}
                className="shrink-0 border-r-2 border-[#246a59]/30 last:border-r-0"
              >
                <UnscheduledPaperCard
                  row={row}
                  isPlacing={placingPaperId === row.paperId}
                  compact
                  onClick={() => onSelectPaper(row.paperId)}
                />
              </div>
            ))}
          </div>

          {/* Desktop scroll list with fade */}
          <div className="relative hidden min-h-0 flex-1 lg:block">
            <ul className="h-full divide-y divide-[#246a59]/20 overflow-y-auto overscroll-contain pl-7 pr-1 scrollbar-thin">
              {papers.map((row) => (
                <li key={row.paperId}>
                  <UnscheduledPaperCard
                    row={row}
                    isPlacing={placingPaperId === row.paperId}
                    onClick={() => onSelectPaper(row.paperId)}
                    onDoubleClick={() => onOpenEditor(row.paperId)}
                  />
                </li>
              ))}
            </ul>
            {/* Bottom fade — hints more content without extending panel */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent dark:from-slate-950"
              aria-hidden
            />
          </div>

          {/* Footer rail — pinned inside panel */}
          <div className="hidden shrink-0 items-center justify-between border-t-2 border-[#246a59] bg-[#246a59]/5 px-2 py-1 pl-7 lg:flex">
            <span className="text-[9px] font-bold uppercase tracking-wider leading-none text-[#246a59]">
              {papers.length} waiting
            </span>
            <span className="text-[9px] font-medium uppercase leading-none text-slate-500">
              Scroll ↓
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
