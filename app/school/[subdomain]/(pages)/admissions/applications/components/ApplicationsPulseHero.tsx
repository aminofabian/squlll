'use client'

import Link from 'next/link'
import { ExternalLink, Inbox, UserRoundPlus } from 'lucide-react'
import { DashboardAnimatedMetric } from '../../../dashboard/components/DashboardAnimatedMetric'
import { cn } from '@/lib/utils'
import type { ApplicationStatus } from './applications-types'
import { appsPrimaryButton } from './applications-ui'

interface ApplicationsPulseHeroProps {
  total: number
  newCount: number
  reviewing: number
  accepted: number
  isLoading?: boolean
  onFilterSelect?: (filter: ApplicationStatus | 'all') => void
}

export function ApplicationsPulseHero({
  total,
  newCount,
  reviewing,
  accepted,
  isLoading,
  onFilterSelect,
}: ApplicationsPulseHeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-none border border-[#1a4d42]/12',
        'bg-gradient-to-br from-[#246a59]/[0.06] via-[#f8fbfa] to-[#f3f7f5]',
        'dark:border-white/10 dark:from-[#246a59]/12 dark:via-[#0c1a17] dark:to-[#071411]',
      )}
      aria-label="Admissions overview"
    >
      <div className="relative border-b border-[#1a4d42]/10 px-3.5 py-3 dark:border-white/10 sm:px-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#246a59]">
              Admissions inbox
            </p>
            <h2 className="mt-1 font-display text-lg tracking-tight text-[#0a1f1a] dark:text-white">
              {total === 0
                ? 'Waiting for first applications'
                : `${total} application${total === 1 ? '' : 's'}`}
            </h2>
            <p className="mt-1 max-w-md text-xs text-[#1a4d42]/55 dark:text-white/45">
              {total === 0
                ? 'Families apply from your public website — reviews land here.'
                : 'Triage new learners, talk to guardians, and accept places.'}
            </p>
          </div>

          <Link
            href="/apply"
            target="_blank"
            rel="noreferrer"
            className={appsPrimaryButton}
          >
            <ExternalLink className="h-3 w-3" />
            Open apply form
          </Link>
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-2 p-2.5 sm:grid-cols-4 sm:gap-2 sm:p-3">
        <button
          type="button"
          className="text-left"
          onClick={() => onFilterSelect?.('all')}
        >
          <DashboardAnimatedMetric
            label="Total"
            value={total}
            accent="success"
            loading={isLoading}
            className="cursor-pointer hover:ring-1 hover:ring-[#246a59]/20"
          />
        </button>
        <button
          type="button"
          className="text-left"
          onClick={() => onFilterSelect?.('new')}
          disabled={newCount === 0}
        >
          <DashboardAnimatedMetric
            label="New"
            value={newCount}
            accent={newCount > 0 ? 'warm' : 'default'}
            loading={isLoading}
            className={cn(
              newCount > 0 && 'cursor-pointer hover:ring-1 hover:ring-amber-300/40',
            )}
          />
        </button>
        <button
          type="button"
          className="text-left"
          onClick={() => onFilterSelect?.('reviewing')}
          disabled={reviewing === 0}
        >
          <DashboardAnimatedMetric
            label="Reviewing"
            value={reviewing}
            loading={isLoading}
            className={cn(
              reviewing > 0 && 'cursor-pointer hover:ring-1 hover:ring-[#246a59]/20',
            )}
          />
        </button>
        <button
          type="button"
          className="text-left"
          onClick={() => onFilterSelect?.('accepted')}
          disabled={accepted === 0}
        >
          <DashboardAnimatedMetric
            label="Accepted"
            value={accepted}
            accent="live"
            loading={isLoading}
            className={cn(
              accepted > 0 && 'cursor-pointer hover:ring-1 hover:ring-emerald-300/40',
            )}
          />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1a4d42]/10 px-3.5 py-2 text-[11px] dark:border-white/10 sm:px-4">
        <span className="inline-flex items-center gap-1.5 text-[#1a4d42]/45">
          <Inbox className="h-3 w-3" />
          From public <span className="font-medium text-[#0a1f1a] dark:text-white/70">/apply</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[#1a4d42]/45">
          <UserRoundPlus className="h-3 w-3" />
          No payment taken on submit
        </span>
      </div>
    </section>
  )
}
