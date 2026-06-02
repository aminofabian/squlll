'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { formatKes } from '../../../lib/feeLetter/buildFeeLetterModel'
import { buildFeeLetterPivot } from '../../../lib/feeLetter/buildFeeLetterPivot'
import { formatPortalUrlForDisplay } from '../../../lib/feeLetter/schoolPortalUrl'
import { FIGTREE_FONT_FAMILY } from '@/lib/fonts/figtree'
import type { FeeLetterModel } from '../../../lib/feeLetter/types'
import { LogoBox } from '../FeeLetterParts'

const INK = '#1e293b'
const RULE = '#64748b'

function Amount({ amount, className }: { amount: number; className?: string }) {
  return (
    <span className={cn('tabular-nums', className)}>{formatKes(amount)}</span>
  )
}

function compactRef(model: FeeLetterModel): string {
  const stamp = model.dateStr.replace(/\//g, '')
  return `FEE/${stamp}`
}

function CompactHeader({ model }: { model: FeeLetterModel }) {
  const host = model.schoolWebsiteUrl
    ? formatPortalUrlForDisplay(model.schoolWebsiteUrl)
    : ''

  return (
    <header className="fee-letter-compact-header mb-2">
      <div
        className="fee-letter-compact-bar flex items-center justify-between px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white"
        style={{ backgroundColor: INK }}
      >
        <span>Fee notice · one page</span>
        <span className="tabular-nums tracking-normal">{model.dateStr}</span>
      </div>

      <div className="flex items-start gap-2 border-b py-1.5" style={{ borderColor: RULE }}>
        <LogoBox
          logoUrl={model.logoUrl}
          schoolLogoKey={model.schoolLogoKey}
          size="sm"
        />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[11px] font-bold uppercase text-slate-900">
            {model.displaySchool}
          </p>
          <p className="text-[9px] text-slate-600 line-clamp-2">
            {[model.displayAddress, model.displayContact, model.displayEmail]
              .filter(Boolean)
              .join(' · ')}
            {host ? ` · ${host}` : ''}
          </p>
        </div>
        <div className="shrink-0 text-right text-[9px] text-slate-500">
          <p className="font-semibold uppercase tracking-wide">Ref</p>
          <p className="font-mono text-slate-800">{compactRef(model)}</p>
        </div>
      </div>

      <div className="py-1.5 text-center">
        <h2 className="text-[12px] font-bold uppercase leading-tight text-slate-900">
          {model.titleText}
        </h2>
        {model.termScopeLine ? (
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
            {model.termScopeLine}
          </p>
        ) : null}
      </div>
    </header>
  )
}

function CompactMatrix({ model }: { model: FeeLetterModel }) {
  const { terms, headOrder, headMeta, grid } = useMemo(
    () => buildFeeLetterPivot(model),
    [model],
  )

  if (!model.hasAnyLines || headOrder.length === 0) {
    return (
      <p className="border border-slate-400 py-4 text-center text-[10px]">
        No fees to list.
      </p>
    )
  }

  const multiTerm = terms.length > 1

  return (
    <section className="fee-letter-compact-schedule fee-letter-section mb-2">
      <p className="mb-1 text-[8px] font-semibold uppercase tracking-wider text-slate-500">
        Schedule — amounts in KES
      </p>
      <table className="fee-letter-compact-table fee-letter-table fee-letter-table--compact w-full border-collapse text-[9px] leading-tight">
        <thead>
          <tr className="bg-slate-200">
            <th className="border border-slate-400 px-1.5 py-1 text-left font-bold uppercase">
              Vote head
            </th>
            {terms.map((t) => (
              <th
                key={t.term}
                className="border border-slate-400 px-1 py-1 text-right font-bold uppercase"
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
                className={cn(idx % 2 === 1 && 'fee-letter-compact-row--alt')}
              >
                <td className="border border-slate-400 px-1.5 py-0.5 text-slate-800">
                  {meta.label}
                  {meta.optional ? (
                    <span className="text-slate-400"> *</span>
                  ) : null}
                </td>
                {terms.map((t) => {
                  const amt = rowMap.get(t.term)
                  const ok = amt != null && amt > 0
                  return (
                    <td
                      key={t.term}
                      className="border border-slate-400 px-1 py-0.5 text-right"
                    >
                      {ok ? <Amount amount={amt} /> : '—'}
                    </td>
                  )
                })}
              </tr>
            )
          })}
          <tr className="fee-letter-compact-totals fee-letter-tr-total font-bold bg-slate-300">
            <td className="border border-slate-500 px-1.5 py-1 uppercase">
              {multiTerm ? model.resolvedTotalLabel : 'Total'}
            </td>
            {terms.map((t) => (
              <td
                key={t.term}
                className="border border-slate-500 px-1 py-1 text-right"
              >
                <Amount amount={t.subtotal} />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      {multiTerm ? (
        <p className="mt-0.5 text-right text-[9px] text-slate-600">
          Combined: <Amount amount={model.grandTotal} className="font-semibold" />{' '}
          <span className="text-slate-400">KES</span>
        </p>
      ) : null}
      <p className="mt-0.5 text-[8px] text-slate-400">* Optional vote head</p>
    </section>
  )
}

function CompactFooterGrid({ model }: { model: FeeLetterModel }) {
  return (
    <div className="fee-letter-compact-footer fee-letter-section grid gap-2 sm:grid-cols-2">
      <section
        className="fee-letter-compact-payment rounded border px-2 py-1.5"
        style={{ borderColor: RULE }}
      >
        <h3 className="text-[9px] font-bold uppercase tracking-wide text-slate-700 mb-1">
          Payment
        </h3>
        <ul className="space-y-0.5 text-[9px] leading-snug text-slate-800">
          {model.bankAccounts.map((acc, i) => (
            <li key={i}>
              <span className="font-semibold">{i + 1}.</span> {acc.bankName}
              {acc.branch ? ` (${acc.branch})` : ''} —{' '}
              <span className="font-mono">{acc.accountNumber || '…………'}</span>
            </li>
          ))}
          {model.includePostalMoneyOrder && model.postalAddress?.trim() ? (
            <li>
              <span className="font-semibold">P.O.</span> {model.postalAddress}
            </li>
          ) : null}
        </ul>
        {model.paymentNotes.length > 0 ? (
          <p className="mt-1 border-t border-slate-200 pt-1 text-[8px] leading-snug text-slate-600">
            <span className="font-bold">NB:</span>{' '}
            {model.paymentNotes[0]}
            {model.paymentNotes.length > 1
              ? ` ${model.paymentNotes.slice(1).join(' ')}`
              : ''}
          </p>
        ) : null}
      </section>

      <section
        className="fee-letter-compact-sign flex flex-col justify-between rounded border px-2 py-1.5"
        style={{ borderColor: RULE }}
      >
        <div>
          <h3 className="text-[9px] font-bold uppercase tracking-wide text-slate-700 mb-1">
            Authorised by
          </h3>
          <div className="mb-1 h-7 border-b border-slate-800" />
          <p className="text-[10px] font-bold leading-tight">{model.principalName}</p>
          <p className="text-[9px] uppercase text-slate-600">{model.principalTitle}</p>
        </div>
        <p className="mt-2 text-[8px] italic text-slate-500">
          Quote ref {compactRef(model)} when paying or writing.
        </p>
      </section>
    </div>
  )
}

export function CompactFeeLetterTemplate({ model }: { model: FeeLetterModel }) {
  return (
    <div
      className="fee-letter-compact-doc text-slate-900"
      style={{
        fontFamily: FIGTREE_FONT_FAMILY,
        fontSize: '10px',
        lineHeight: 1.25,
      }}
    >
      <CompactHeader model={model} />
      <CompactMatrix model={model} />
      <CompactFooterGrid model={model} />
    </div>
  )
}
