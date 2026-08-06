'use client'

import Link from 'next/link'
import { ExternalLink, UserRoundPlus } from 'lucide-react'
import { appsPrimaryButton } from './applications-ui'

export function ApplicationsEmptyHero({
  filtered,
}: {
  filtered?: boolean
}) {
  return (
    <div className="relative overflow-hidden rounded-none border border-[#1a4d42]/12 bg-gradient-to-br from-[#246a59]/[0.06] via-[#f8fbfa] to-[#f3f7f5] px-6 py-14 text-center dark:border-white/10 dark:from-[#246a59]/12 dark:via-[#0c1a17] dark:to-[#071411]">
      <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-none bg-[#0a1f1a]">
        <UserRoundPlus className="h-7 w-7 text-white" strokeWidth={1.75} />
      </div>

      <h2 className="relative font-display text-base tracking-tight text-[#0a1f1a] dark:text-white">
        {filtered ? 'No applications match your filters' : 'No applications yet'}
      </h2>
      <p className="relative mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#1a4d42]/55 dark:text-white/45">
        {filtered
          ? 'Try another status or clear the search to see the full inbox.'
          : 'When a family submits via your website Apply form, they’ll appear here with a reference number.'}
      </p>

      {!filtered ? (
        <div className="relative mt-6 flex flex-col items-center gap-3">
          <Link
            href="/apply"
            target="_blank"
            rel="noreferrer"
            className={appsPrimaryButton}
          >
            <ExternalLink className="h-3 w-3" />
            Preview apply form
          </Link>
          <p className="text-[11px] text-[#1a4d42]/45">
            Share the link from your public site nav
          </p>
        </div>
      ) : null}
    </div>
  )
}
