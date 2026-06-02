'use client'

import { useMemo, type CSSProperties, type ReactNode } from 'react'
import { FIGTREE_FONT_FAMILY } from '@/lib/fonts/figtree'
import { cn } from '@/lib/utils'
import { formatKes } from '../../../lib/feeLetter/buildFeeLetterModel'
import { buildFeeLetterPivot } from '../../../lib/feeLetter/buildFeeLetterPivot'
import type { FeeLetterModel } from '../../../lib/feeLetter/types'
import { LogoBox, SchoolWebsiteLine } from '../FeeLetterParts'

const MAROON = '#5c1a2e'
const GOLD = '#9a7b4f'
const INK = '#1c1917'
const PARCHMENT = '#faf7f2'

const DOC_FONT: CSSProperties = {
  fontFamily: FIGTREE_FONT_FAMILY,
}

function Amount({ amount, className }: { amount: number; className?: string }) {
  return (
    <span className={cn('tabular-nums', className)}>{formatKes(amount)}</span>
  )
}

function ministryRef(model: FeeLetterModel): string {
  const year =
    model.titleText.match(/\d{4}/)?.[0] ??
    model.dateStr.split('/').pop() ??
    '0000'
  return `MOE/FEES/${year}/${String(model.displaySchool).slice(0, 3).toUpperCase() || 'SCH'}`
}

function CornerOrnament({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'fee-letter-formal-ornament pointer-events-none absolute text-[11px] leading-none select-none',
        className,
      )}
      style={{ color: GOLD }}
      aria-hidden
    >
      ✦
    </span>
  )
}

function FormalFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="fee-letter-formal-manuscript relative mx-auto max-w-full"
      style={{ ...DOC_FONT, color: INK, backgroundColor: PARCHMENT }}
    >
      <div
        className="fee-letter-formal-outer pointer-events-none absolute inset-2 border-2"
        style={{ borderColor: GOLD }}
      />
      <div
        className="fee-letter-formal-inner pointer-events-none absolute inset-4 border border-double"
        style={{ borderColor: MAROON }}
      />
      <CornerOrnament className="left-5 top-5" />
      <CornerOrnament className="right-5 top-5" />
      <CornerOrnament className="left-5 bottom-5" />
      <CornerOrnament className="right-5 bottom-5" />

      <div className="fee-letter-formal-body relative px-8 py-9 sm:px-10 sm:py-10">
        {children}
      </div>
    </div>
  )
}

function FormalHeader({ model }: { model: FeeLetterModel }) {
  return (
    <header className="fee-letter-formal-header text-center">
      <p
        className="fee-letter-formal-republic text-[9px] font-semibold uppercase tracking-[0.35em]"
        style={{ color: MAROON }}
      >
        Republic of Kenya
      </p>
      <div
        className="fee-letter-formal-crest-rule mx-auto my-2 h-px w-24"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
      />

      <div className="fee-letter-formal-crest mx-auto flex flex-col items-center">
        <div
          className="fee-letter-formal-crest-ring flex items-center justify-center rounded-full p-1"
          style={{
            border: `2px solid ${GOLD}`,
            boxShadow: `inset 0 0 0 1px ${MAROON}`,
          }}
        >
          <LogoBox
            logoUrl={model.logoUrl}
            schoolLogoKey={model.schoolLogoKey}
            size="sm"
          />
        </div>
      </div>

      <h1
        className="fee-letter-formal-school mt-3 text-xl font-bold uppercase tracking-[0.08em] leading-tight"
        style={{ color: MAROON }}
      >
        {model.displaySchool}
      </h1>
      <p
        className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: GOLD }}
      >
        Board of Management
      </p>
      <p className="mt-1 text-xs italic text-stone-600">
        &ldquo;{model.schoolMotto}&rdquo;
      </p>

      <div
        className="fee-letter-formal-contact mx-auto mt-3 max-w-md space-y-0.5 text-[11px] text-stone-600"
      >
        <p>{model.displayAddress}</p>
        {model.displayContact ? <p>Tel: {model.displayContact}</p> : null}
        {model.displayEmail ? <p>Email: {model.displayEmail}</p> : null}
        {model.schoolWebsiteUrl ? (
          <SchoolWebsiteLine url={model.schoolWebsiteUrl} align="center" />
        ) : null}
      </div>

      <div
        className="fee-letter-formal-divider mx-auto my-4 h-px w-full max-w-lg"
        style={{ background: `linear-gradient(90deg, transparent, ${MAROON}, transparent)` }}
      />
    </header>
  )
}

function FormalDispatch({ model }: { model: FeeLetterModel }) {
  const ref = ministryRef(model)
  return (
    <div className="fee-letter-formal-dispatch mb-5 text-[12px] leading-relaxed text-stone-800">
      <div className="fee-letter-formal-meta mb-4 flex flex-wrap justify-between gap-3 border-b border-stone-300/80 pb-3 text-[11px]">
        <div className="space-y-0.5">
          <p>
            <span className="font-semibold uppercase tracking-wide text-stone-500">
              Our ref:
            </span>{' '}
            <span className="font-medium" style={{ color: MAROON }}>
              {ref}
            </span>
          </p>
          <p>
            <span className="font-semibold uppercase tracking-wide text-stone-500">
              Your ref:
            </span>{' '}
            ………………………………
          </p>
        </div>
        <p className="text-right">
          <span className="font-semibold uppercase tracking-wide text-stone-500">
            Date:
          </span>{' '}
          <span className="font-medium tabular-nums">{model.dateStr}</span>
        </p>
      </div>

      <p
        className="fee-letter-formal-notice-label text-center text-[10px] font-bold uppercase tracking-[0.28em] mb-2"
        style={{ color: MAROON }}
      >
        Official notice
      </p>
      <h2 className="fee-letter-formal-title text-center text-[15px] font-bold uppercase tracking-[0.06em] mb-1">
        {model.titleText}
      </h2>
      {model.termScopeLine ? (
        <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-4">
          ({model.termScopeLine})
        </p>
      ) : (
        <div className="mb-4" />
      )}

      <p className="text-justify indent-8">
        The <strong>{model.principalTitle}</strong> of the above-named institution
        hereby notifies parents, guardians, and sponsors that the approved fees
        for the academic period stated below shall apply. Payment shall be made
        in full at the opening of each term unless otherwise directed by the
        Board.
      </p>
    </div>
  )
}

function FormalScheduleA({ model }: { model: FeeLetterModel }) {
  const { terms, headOrder, headMeta, grid } = useMemo(
    () => buildFeeLetterPivot(model),
    [model],
  )

  if (!model.hasAnyLines || terms.length === 0) {
    return (
      <p className="border border-stone-400 py-8 text-center text-sm text-stone-600">
        No fee schedule has been published for the selected terms.
      </p>
    )
  }

  const multiTerm = terms.length > 1

  return (
    <section className="fee-letter-formal-schedule fee-letter-section mb-6">
      <div className="mb-3 flex items-baseline gap-3">
        <span
          className="fee-letter-formal-schedule-badge shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
          style={{ backgroundColor: MAROON }}
        >
          Schedule A
        </span>
        <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-stone-800">
          Approved vote heads &amp; amounts
        </h3>
      </div>
      <p className="mb-3 text-[10px] italic text-stone-500">
        Figures in Kenya Shillings (KES). Optional items are marked.
      </p>

      <table className="fee-letter-formal-table fee-letter-table w-full border-collapse text-[11px]">
        <thead>
          <tr style={{ backgroundColor: MAROON, color: '#fff' }}>
            <th className="fee-letter-formal-th w-10 border border-stone-400 px-1 py-2 text-center font-bold">
              S/N
            </th>
            <th className="fee-letter-formal-th border border-stone-400 px-2 py-2 text-left font-bold uppercase tracking-wide">
              Vote head
            </th>
            {terms.map((t) => (
              <th
                key={t.term}
                className="fee-letter-formal-th border border-stone-400 px-2 py-2 text-right font-bold uppercase tracking-wide"
              >
                {t.term}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {headOrder.map((key, idx) => {
            const meta = headMeta.get(key)!
            const rowMap = grid.get(key)!
            return (
              <tr
                key={key}
                className={cn(
                  'fee-letter-formal-row',
                  idx % 2 === 1 && 'fee-letter-formal-row--alt',
                )}
              >
                <td className="border border-stone-400 px-1 py-1.5 text-center font-medium text-stone-500">
                  {idx + 1}
                </td>
                <td className="border border-stone-400 px-2 py-1.5 text-stone-900">
                  {meta.label}
                  {meta.optional ? (
                    <span className="ml-1 text-[9px] uppercase text-stone-400">
                      (Opt.)
                    </span>
                  ) : null}
                </td>
                {terms.map((t) => {
                  const amt = rowMap.get(t.term)
                  const ok = amt != null && amt > 0
                  return (
                    <td
                      key={t.term}
                      className="border border-stone-400 px-2 py-1.5 text-right tabular-nums"
                    >
                      {ok ? <Amount amount={amt} /> : '—'}
                    </td>
                  )
                })}
              </tr>
            )
          })}
          <tr className="fee-letter-formal-totals fee-letter-tr-total font-bold">
            <td
              colSpan={2}
              className="border border-stone-400 px-2 py-2 uppercase tracking-wide text-white"
              style={{ backgroundColor: MAROON }}
            >
              {multiTerm ? model.resolvedTotalLabel : 'Total payable'}
            </td>
            {terms.map((t) => (
              <td
                key={t.term}
                className="border border-stone-400 px-2 py-2 text-right text-white"
                style={{ backgroundColor: '#4a1524' }}
              >
                <Amount amount={t.subtotal} />
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {multiTerm ? (
        <p className="mt-3 text-right text-[11px] text-stone-700">
          <span className="uppercase tracking-wide text-stone-500">
            Aggregate total:{' '}
          </span>
          <span className="font-bold" style={{ color: MAROON }}>
            <Amount amount={model.grandTotal} />
          </span>
          <span className="text-stone-400"> KES</span>
        </p>
      ) : null}
    </section>
  )
}

function FormalRemittance({ model }: { model: FeeLetterModel }) {
  return (
    <section className="fee-letter-formal-remittance fee-letter-section mb-6">
      <h3
        className="fee-letter-formal-section-title mb-2 text-[11px] font-bold uppercase tracking-[0.2em]"
        style={{ color: MAROON }}
      >
        II. Mode of remittance
      </h3>
      <p className="mb-3 text-justify text-[12px] leading-relaxed indent-6">
        Fees shall be remitted in full at the beginning of each term to any of the
        institution accounts herein specified. Official receipts will be issued
        upon presentation of the original deposit slip or approved payment
        instruction.
      </p>
      <ol className="fee-letter-formal-banks ml-6 list-decimal space-y-2 text-[12px]">
        {model.bankAccounts.map((acc, i) => (
          <li key={i} className="pl-1">
            <span className="font-semibold">{acc.bankName}</span>
            {acc.branch ? <> — {acc.branch} Branch</> : null}
            <span className="text-stone-600">
              {' '}
              · A/C{' '}
              <span className="underline decoration-stone-400">
                {acc.accountNumber || '……………………'}
              </span>
            </span>
          </li>
        ))}
        {model.includePostalMoneyOrder && model.postalAddress?.trim() ? (
          <li className="pl-1">
            Postal Money Order — {model.postalAddress}
          </li>
        ) : null}
      </ol>
      <div className="mt-4 border-l-2 pl-3 text-[11px] leading-relaxed text-stone-700" style={{ borderColor: GOLD }}>
        <p className="font-bold uppercase tracking-wide text-stone-800 mb-1">
          Nota bene
        </p>
        {model.paymentNotes.map((note, i) => (
          <p key={i} className="mb-1 text-justify">
            {note}
          </p>
        ))}
      </div>
    </section>
  )
}

function FormalAuthentication({ model }: { model: FeeLetterModel }) {
  return (
    <section className="fee-letter-formal-auth fee-letter-section mt-8">
      <h3
        className="fee-letter-formal-section-title mb-4 text-[11px] font-bold uppercase tracking-[0.2em]"
        style={{ color: MAROON }}
      >
        III. Authentication
      </h3>
      <div className="flex items-end justify-between gap-8">
        <div className="min-w-0 flex-1">
          <div className="mb-1 h-10 border-b border-stone-800" />
          <p className="text-[12px] font-bold">{model.principalName}</p>
          <p className="text-[11px] uppercase tracking-wide text-stone-600">
            {model.principalTitle}
          </p>
        </div>
        <div className="shrink-0 text-center">
          <div
            className="fee-letter-formal-seal mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-2 border-dashed text-[8px] font-bold uppercase leading-tight tracking-wider"
            style={{ borderColor: MAROON, color: MAROON }}
          >
            School
            <br />
            Seal
          </div>
          <p className="mt-2 text-[9px] uppercase tracking-widest text-stone-500">
            For &amp; on behalf of BoM
          </p>
        </div>
      </div>
      <p className="mt-6 text-center text-[9px] uppercase tracking-[0.25em] text-stone-400">
        When replying please quote ref {ministryRef(model)}
      </p>
    </section>
  )
}

export function FormalMinistryTemplate({ model }: { model: FeeLetterModel }) {
  return (
    <FormalFrame>
      <FormalHeader model={model} />
      <FormalDispatch model={model} />
      <FormalScheduleA model={model} />
      <FormalRemittance model={model} />
      <FormalAuthentication model={model} />
    </FormalFrame>
  )
}
