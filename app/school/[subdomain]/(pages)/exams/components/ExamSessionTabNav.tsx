'use client'

import { cn } from '@/lib/utils'
import {
  examTabActiveClass,
  examTabGroupLabelClass,
  examTabIdleClass,
} from './exam-session-ui'

export interface ExamSessionTabItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const TAB_GROUPS: { label: string; tone: string; ids: string[] }[] = [
  {
    label: 'Plan',
    tone: 'from-[#246a59]/10 to-transparent',
    ids: ['overview', 'papers', 'candidates', 'timetable'],
  },
  {
    label: 'Run',
    tone: 'from-[#0073ea]/10 to-transparent',
    ids: ['attendance', 'marks', 'approvals', 'processing'],
  },
  {
    label: 'Results',
    tone: 'from-violet-500/10 to-transparent',
    ids: ['results', 'rankings', 'analytics', 'report-cards'],
  },
  { label: '', tone: '', ids: ['settings'] },
]

interface ExamSessionTabNavProps {
  tabs: ExamSessionTabItem[]
  activeTab: string
  onTabChange: (id: string) => void
}

function TabButton({
  id,
  label,
  icon: Icon,
  isActive,
  compact,
  onClick,
}: {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
  compact?: boolean
  onClick: () => void
}) {
  return (
    <button
      key={id}
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        'relative flex shrink-0 snap-start items-center gap-1.5 overflow-hidden rounded-xl font-medium transition-all duration-200',
        compact ? 'px-2 py-1.5' : 'px-2.5 py-1.5',
        isActive ? examTabActiveClass : examTabIdleClass,
      )}
    >
      {isActive ? (
        <span
          className="pointer-events-none absolute -right-2 -top-2 h-8 w-8 rounded-full bg-white/20 blur-md"
          aria-hidden
        />
      ) : null}
      <Icon className={cn('relative shrink-0', compact ? 'h-3.5 w-3.5' : 'h-3 w-3')} />
      {!compact || isActive ? (
        <span
          className={cn(
            'relative whitespace-nowrap',
            compact ? 'max-w-[5.5rem] truncate text-[10px]' : 'text-xs',
          )}
        >
          {label}
        </span>
      ) : null}
    </button>
  )
}

export function ExamSessionTabNav({
  tabs,
  activeTab,
  onTabChange,
}: ExamSessionTabNavProps) {
  const tabById = new Map(tabs.map((tab) => [tab.id, tab]))
  const active = tabById.get(activeTab)
  const activeGroup = TAB_GROUPS.find((group) => group.ids.includes(activeTab))

  const groupedTabs = TAB_GROUPS.map((group) => ({
    ...group,
    tabs: group.ids.map((id) => tabById.get(id)).filter(Boolean) as ExamSessionTabItem[],
  })).filter((group) => group.tabs.length > 0)

  return (
    <div className="border-b border-slate-200/60 bg-gradient-to-b from-slate-50/50 to-white/80 px-2 py-1.5 dark:border-slate-800 dark:from-slate-900/50 dark:to-slate-900/80 sm:px-2.5">
      {/* Mobile context pill */}
      {active ? (
        <div className="mb-1.5 flex items-center justify-center gap-1.5 sm:hidden">
          <span className="rounded-full bg-gradient-to-r from-[#246a59]/15 to-[#0073ea]/10 px-2.5 py-1 text-[10px] font-semibold text-[#246a59] ring-1 ring-[#246a59]/15">
            {activeGroup?.label ? `${activeGroup.label} · ` : ''}
            {active.label}
          </span>
        </div>
      ) : null}

      {/* Desktop grouped nav */}
      <div className="hidden flex-wrap items-stretch justify-center gap-2 sm:flex">
        {groupedTabs.map((group) => (
          <div
            key={group.label || 'settings'}
            className={cn(
              'flex items-center gap-1 rounded-2xl bg-gradient-to-r p-1 ring-1 ring-slate-200/60 dark:ring-slate-700/60',
              group.tone || 'from-slate-100/50 to-transparent dark:from-slate-800/50',
            )}
          >
            {group.label ? (
              <span className={cn(examTabGroupLabelClass, 'mx-0.5 hidden lg:inline')}>
                {group.label}
              </span>
            ) : null}
            {group.tabs.map((tab) => (
              <TabButton
                key={tab.id}
                {...tab}
                isActive={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Mobile scroll */}
      <div className="flex justify-center overflow-x-auto scrollbar-none sm:hidden">
        <div className="inline-flex snap-x snap-mandatory gap-1.5 px-1 pb-0.5">
          {groupedTabs.flatMap((group) =>
            group.tabs.map((tab) => (
              <TabButton
                key={tab.id}
                {...tab}
                isActive={activeTab === tab.id}
                compact
                onClick={() => onTabChange(tab.id)}
              />
            )),
          )}
        </div>
      </div>
    </div>
  )
}
