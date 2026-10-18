'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { LessonPlan, LessonPlanStatus } from '@/lib/lesson-planning/api'
import {
  LessonDeliveryStatusPill,
  LessonPlanStatusPill,
} from '@/components/lesson-planning/StatusPill'

const FILTERS: Array<{ value: LessonPlanStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'DRAFT', label: 'Drafts' },
  { value: 'SUBMITTED', label: 'Awaiting review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'RETURNED', label: 'Returned' },
]

export function PlansPanel({
  plans,
  loading,
}: {
  plans: LessonPlan[]
  loading: boolean
}) {
  const [filter, setFilter] = useState<LessonPlanStatus | 'ALL'>('ALL')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return plans.filter((plan) => {
      if (filter !== 'ALL' && plan.status !== filter) return false
      if (!needle) return true
      return [plan.topic, plan.subjectName, plan.className, plan.strand, plan.subStrand]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    })
  }, [plans, filter, query])

  const grouped = useMemo(() => {
    const map = new Map<string, LessonPlan[]>()
    for (const plan of filtered) {
      const list = map.get(plan.lessonDate) ?? []
      list.push(plan)
      map.set(plan.lessonDate, list)
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [filtered])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filter === option.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search topic, class or strand"
            className="pl-8"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          No lesson plans match this filter yet.
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
              <div className="space-y-2">
                {items.map((plan) => (
                  <Link
                    key={plan.id}
                    href={`/teacher/lesson-plans/${plan.id}`}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {plan.topic || 'Untitled lesson'}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {plan.subjectName} · {plan.className}
                        {plan.periodNumber ? ` · Period ${plan.periodNumber}` : ''} ·
                        Week {plan.weekNumber}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                      {plan.record && (
                        <LessonDeliveryStatusPill status={plan.record.status} />
                      )}
                      <LessonPlanStatusPill status={plan.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
