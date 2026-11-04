'use client'

import { cn } from '@/lib/utils'
import { feeLetterHasPaymentCopy } from '../../lib/feeLetter/paymentChannels'
import type { FeeLetterModel, FeeLetterPaymentChannel } from '../../lib/feeLetter/types'

type PayTone = 'ink' | 'kenya' | 'formal' | 'banner' | 'compact'

const TONE: Record<
  PayTone,
  {
    intro: string
    row: string
    stamp: string
    title: string
    line: string
    notes: string
  }
> = {
  ink: {
    intro: 'mb-3 text-justify text-[12px] leading-relaxed text-slate-800',
    row: 'flex items-start gap-3 border border-slate-200 bg-white px-3 py-2',
    stamp:
      'mt-0.5 w-14 shrink-0 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500',
    title: 'text-[12px] font-semibold text-slate-900',
    line: 'text-[11px] leading-snug text-slate-600',
    notes: 'mt-3 space-y-1 text-justify text-[11px] leading-relaxed text-slate-700',
  },
  kenya: {
    intro: 'mb-3 text-justify text-[12px] leading-relaxed text-stone-800',
    row: 'flex items-start gap-3 border border-[#1b4332]/20 bg-white px-3 py-2',
    stamp:
      'mt-0.5 w-14 shrink-0 text-[9px] font-bold uppercase tracking-[0.14em] text-[#1b4332]',
    title: 'text-[12px] font-semibold text-stone-900',
    line: 'text-[11px] leading-snug text-stone-600',
    notes: 'mt-3 space-y-1 text-justify text-[11px] leading-relaxed text-stone-700',
  },
  formal: {
    intro: 'mb-3 text-justify text-[12px] leading-relaxed text-stone-800 indent-6',
    row: 'flex items-start gap-3 border border-stone-200 bg-white px-3 py-2',
    stamp:
      'mt-0.5 w-14 shrink-0 text-[9px] font-bold uppercase tracking-[0.16em] text-[#4a1524]',
    title: 'text-[12px] font-semibold text-stone-900',
    line: 'text-[11px] leading-snug text-stone-600',
    notes: 'mt-3 space-y-1 text-justify text-[11px] leading-relaxed text-stone-700',
  },
  banner: {
    intro: 'mb-3 text-[12px] leading-relaxed text-white/90',
    row: 'flex items-start gap-3 border border-white/25 bg-black/10 px-3 py-2',
    stamp:
      'mt-0.5 w-14 shrink-0 text-[9px] font-bold uppercase tracking-[0.14em] text-white/70',
    title: 'text-[12px] font-semibold text-white',
    line: 'text-[11px] leading-snug text-white/85',
    notes: 'mt-3 space-y-1 text-[10px] leading-relaxed text-white/90',
  },
  compact: {
    intro: 'mb-1 text-[8px] leading-snug text-slate-600',
    row: 'flex items-baseline gap-1.5',
    stamp: 'w-9 shrink-0 text-[8px] font-bold uppercase tracking-wide text-slate-500',
    title: 'text-[9px] font-semibold text-slate-900',
    line: 'text-[8px] text-slate-700',
    notes: 'mt-1 border-t border-slate-200 pt-1 text-[8px] leading-snug text-slate-600',
  },
}

function ChannelRow({
  channel,
  tone,
}: {
  channel: FeeLetterPaymentChannel
  tone: PayTone
}) {
  const styles = TONE[tone]
  return (
    <div className={styles.row}>
      <span className={styles.stamp}>{channel.label}</span>
      <div className="min-w-0">
        <p className={styles.title}>{channel.title}</p>
        {channel.lines.map((line) => (
          <p key={line} className={styles.line}>
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

export function FeeLetterPayMethods({
  model,
  tone = 'ink',
  className,
  hideIntro = false,
}: {
  model: FeeLetterModel
  tone?: PayTone
  className?: string
  hideIntro?: boolean
}) {
  if (!feeLetterHasPaymentCopy(model)) return null
  const styles = TONE[tone]

  return (
    <div className={className}>
      {!hideIntro && model.paymentIntro ? (
        <p className={styles.intro}>{model.paymentIntro}</p>
      ) : null}
      {model.paymentChannels.length > 0 ? (
        <div className={cn(tone === 'compact' ? 'space-y-0.5' : 'space-y-2')}>
          {model.paymentChannels.map((channel) => (
            <ChannelRow key={channel.id} channel={channel} tone={tone} />
          ))}
        </div>
      ) : null}
      {model.paymentNotes.length > 0 ? (
        <div className={styles.notes}>
          {model.paymentNotes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      ) : null}
    </div>
  )
}
