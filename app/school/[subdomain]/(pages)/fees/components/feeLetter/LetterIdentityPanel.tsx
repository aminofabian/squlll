'use client'

import { Building2, PenLine } from 'lucide-react'
import { LetterDetailsCard } from './LetterDetailsCard'
import type { LetterSchoolDetailsPayload } from '../../lib/feeLetter/letterSchoolDetails'
import { FEES_BRAND } from '../../lib/fees-ui'

type LetterIdentityPanelProps = {
  details: LetterSchoolDetailsPayload
  onChange: (next: LetterSchoolDetailsPayload) => void
  onSave?: (next: LetterSchoolDetailsPayload) => Promise<void>
  schoolLogoKey: string
  portalUrl: string
  loading?: boolean
  saving?: boolean
  error?: string | null
  compact?: boolean
}

export function LetterIdentityPanel({
  compact = false,
  ...props
}: LetterIdentityPanelProps) {
  if (compact) {
    return (
      <section className="fee-letter-identity-panel min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: FEES_BRAND.primary }}
          >
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">School letterhead</h3>
        </div>
        <LetterDetailsCard {...props} variant="featured" />
      </section>
    )
  }

  return (
    <section className="fee-letter-identity-panel">
      <div className="mb-3 flex items-center gap-2.5 px-0.5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
          style={{ backgroundColor: FEES_BRAND.primary }}
        >
          <Building2 className="h-3.5 w-3.5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            School letterhead
          </p>
          <p className="text-xs text-slate-600">
            Logo, banks, and signatory for all plans.
          </p>
        </div>
      </div>
      <LetterDetailsCard {...props} variant="panel" />
      <p className="mt-2 flex items-center gap-1.5 px-1 text-[10px] text-slate-400">
        <PenLine className="h-3 w-3" />
        Auto-saved · Edit for full details
      </p>
    </section>
  )
}
