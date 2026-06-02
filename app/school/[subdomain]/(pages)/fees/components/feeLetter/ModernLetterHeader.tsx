'use client'

import type { FeeLetterModel } from '../../lib/feeLetter/types'
import { LogoBox, LetterheadSchoolDetails } from './FeeLetterParts'

const INK = '#0f172a'

export function ModernLetterHeader({ model }: { model: FeeLetterModel }) {
  return (
    <header className="fee-letter-modern-header mb-7">
      <div
        className="fee-letter-modern-header-accent h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, #94a3b8, transparent)' }}
      />
      <div className="fee-letter-modern-header-body flex items-start gap-5 pt-5 pb-5">
        <LogoBox
          logoUrl={model.logoUrl}
          schoolLogoKey={model.schoolLogoKey}
        />
        <div className="min-w-0 flex-1 border-l border-slate-200 pl-5">
          <LetterheadSchoolDetails model={model} />
        </div>
        <div className="fee-letter-modern-date shrink-0 text-right pl-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Date
          </p>
          <p
            className="mt-1 text-sm font-medium tabular-nums"
            style={{ color: INK }}
          >
            {model.dateStr}
          </p>
        </div>
      </div>
      <div className="h-px w-full bg-slate-200" />
    </header>
  )
}
