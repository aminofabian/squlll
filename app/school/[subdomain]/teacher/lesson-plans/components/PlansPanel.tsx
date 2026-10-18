'use client'

import React, { useMemo, useState } from 'react'
import { SearchX } from 'lucide-react'
import type { LessonPlan } from '@/lib/lesson-planning/api'
import type { PlanFilter } from '../constants/planFilters'
import { countPlansByFilter } from '../utils/countPlansByFilter'
import { filterPlans } from '../utils/filterPlans'
import { groupPlansByDate } from '../utils/groupPlansByDate'
import { PlanFilters } from './PlanFilters'
import { PlannerEmptyState } from './PlannerEmptyState'
import { PlanRow } from './PlanRow'

const SKELETON_ROWS = [0, 1, 2]

const formatGroupDate = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })

export function PlansPanel({ plans, loading }: { plans: LessonPlan[]; loading: boolean }) {
  const [filter, setFilter] = useState<PlanFilter>('ALL')
  const [query, setQuery] = useState('')
  const counts = useMemo(() => countPlansByFilter(plans), [plans])
  const groups = useMemo(() => groupPlansByDate(filterPlans(plans, filter, query)), [plans, filter, query])

  return (
    <div className="space-y-3">
      <PlanFilters filter={filter} counts={counts} query={query} onFilterChange={setFilter} onQueryChange={setQuery} />
      {loading ? (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {SKELETON_ROWS.map((row) => (
            <div key={row} className="h-14 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <PlannerEmptyState icon={SearchX} title="Nothing here yet" description="No lesson plans match this filter. Try another status or clear your search." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {groups.map(([date, items]) => (
            <section key={date} className="border-b border-border last:border-b-0">
              <h3 className="bg-muted/40 px-4 py-1.5 text-[11px] font-medium text-muted-foreground">{formatGroupDate(date)}</h3>
              <ul className="divide-y divide-border">
                {items.map((plan) => (
                  <PlanRow key={plan.id} plan={plan} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
