'use client'

import React, { useMemo, useState } from 'react'
import { SearchX } from 'lucide-react'
import type { LessonPlan } from '@/lib/lesson-planning/api'
import type { PlanFilter } from '../constants/planFilters'
import { countPlansByFilter } from '../utils/countPlansByFilter'
import { filterPlans } from '../utils/filterPlans'
import { groupPlansByDate } from '../utils/groupPlansByDate'
import { DateBadge } from './DateBadge'
import { PlanFilters } from './PlanFilters'
import { PlannerEmptyState } from './PlannerEmptyState'
import { PlanRow } from './PlanRow'

const SKELETON_ROWS = [0, 1, 2]

export function PlansPanel({ plans, loading }: { plans: LessonPlan[]; loading: boolean }) {
  const [filter, setFilter] = useState<PlanFilter>('ALL')
  const [query, setQuery] = useState('')
  const counts = useMemo(() => countPlansByFilter(plans), [plans])
  const groups = useMemo(() => groupPlansByDate(filterPlans(plans, filter, query)), [plans, filter, query])

  return (
    <div className="space-y-5">
      <PlanFilters filter={filter} counts={counts} query={query} onFilterChange={setFilter} onQueryChange={setQuery} />
      {loading ? (
        <div className="space-y-2">
          {SKELETON_ROWS.map((row) => (
            <div key={row} className="h-16 animate-pulse rounded-2xl bg-muted/60" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <PlannerEmptyState icon={SearchX} title="Nothing here yet" description="No lesson plans match this filter. Try another status or clear your search." />
      ) : (
        <div className="space-y-6">
          {groups.map(([date, items]) => (
            <section key={date} className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <DateBadge date={date} />
              <div className="min-w-0 flex-1 space-y-2">
                {items.map((plan) => (
                  <PlanRow key={plan.id} plan={plan} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
