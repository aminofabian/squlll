'use client'

import { FileText, Sparkles } from 'lucide-react'
import { FEES_BRAND } from '../../lib/fees-ui'

export function FeeLetterSetupHero() {
  return (
    <div className="fee-letter-setup-hero relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 100% 0%, ${FEES_BRAND.primary}28 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 0% 100%, ${FEES_BRAND.primaryMuted} 0%, transparent 50%),
            linear-gradient(165deg, ${FEES_BRAND.surface} 0%, #fff 48%, ${FEES_BRAND.primaryLight} 100%)
          `,
        }}
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3.5">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
            style={{
              background: `linear-gradient(145deg, ${FEES_BRAND.primary}, ${FEES_BRAND.primaryDark})`,
            }}
          >
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
              Parent communications
            </p>
            <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              Fee structure letter
            </h2>
            <p className="mt-1 max-w-md text-sm text-slate-600 leading-relaxed">
              Configure what parents see, then choose a layout and print or share.
            </p>
          </div>
        </div>
        <div
          className="flex shrink-0 items-center gap-2 self-start rounded-full px-3 py-1.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200/80"
          style={{ backgroundColor: 'rgba(255,255,255,0.75)' }}
        >
          <Sparkles className="h-3.5 w-3.5" style={{ color: FEES_BRAND.primary }} />
          Saved to your school profile
        </div>
      </div>
    </div>
  )
}
