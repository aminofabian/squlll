'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { formatKes } from '../../lib/feeLetter/buildFeeLetterModel'
import { buildFeeLetterPivot } from '../../lib/feeLetter/buildFeeLetterPivot'
import type { FeeLetterModel } from '../../lib/feeLetter/types'

/** Formatted figure only — currency shown once in table header. */
function Amount({
  amount,
  className,
}: {
  amount: number
  className?: string
}) {
  return (
    <span className={cn('tabular-nums tracking-tight', className)}>
      {formatKes(amount)}
    </span>
  )
}

const INK = '#0f172a'
const LINE = '#e2e8f0'
const HEADER_FROM = '#0f172a'
const HEADER_TO = '#1e3a5f'

export function ModernFeesMatrixTable({ model }: { model: FeeLetterModel }) {
  const { terms, headOrder, headMeta, grid } = useMemo(
    () => buildFeeLetterPivot(model),
    [model],
  )

  if (!model.hasAnyLines || terms.length === 0) {
    return (
      <p className="fee-letter-modern-matrix-empty py-12 text-center text-sm text-slate-500">
        No fee categories to display for the selected terms.
      </p>
    )
  }

  const multiTerm = terms.length > 1

  return (
    <section className="fee-letter-modern-matrix fee-letter-section mb-7">
      <div className="fee-letter-modern-matrix-intro mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h3
            className="text-[15px] font-semibold tracking-tight"
            style={{ color: INK }}
          >
            Fee structure
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-500">
            All amounts in Kenya Shillings
            {model.termScopeLine ? (
              <>
                {' '}
                <span className="text-slate-400">·</span>{' '}
                <span className="font-medium text-slate-600">
                  {model.termScopeLine}
                </span>
              </>
            ) : null}
          </p>
        </div>
      </div>

      <div
        className="fee-letter-modern-matrix-shell overflow-hidden rounded-lg"
        style={{
          boxShadow:
            '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -6px rgba(15,23,42,0.08)',
          border: `1px solid ${LINE}`,
        }}
      >
        <table className="fee-letter-table fee-letter-table--modern fee-letter-modern-matrix-table w-full border-collapse">
          <thead>
            <tr
              className="fee-letter-modern-matrix-head"
              style={{
                background: `linear-gradient(180deg, ${HEADER_FROM} 0%, ${HEADER_TO} 100%)`,
              }}
            >
              <th
                className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-white/95"
                style={{ width: '38%' }}
              >
                Vote head
              </th>
              {terms.map((t, i) => (
                <th
                  key={t.term}
                  className={cn(
                    'px-3 py-3 text-right',
                    i > 0 && 'border-l border-white/10',
                  )}
                >
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                    {t.term}
                  </span>
                  <span className="mt-0.5 block text-[9px] font-normal uppercase tracking-widest text-white/50">
                    KES
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {headOrder.map((key, rowIdx) => {
              const meta = headMeta.get(key)!
              const rowMap = grid.get(key)!
              const isLast = rowIdx === headOrder.length - 1
              return (
                <tr
                  key={key}
                  className={cn(
                    'fee-letter-modern-matrix-row',
                    rowIdx % 2 === 0
                      ? 'fee-letter-modern-matrix-row--even'
                      : 'fee-letter-modern-matrix-row--odd',
                  )}
                >
                  <td
                    className={cn(
                      'fee-letter-modern-matrix-vote px-4 py-3',
                      !isLast && 'border-b',
                    )}
                    style={{ borderColor: LINE }}
                  >
                    <span
                      className="text-[12px] font-medium leading-snug"
                      style={{ color: INK }}
                    >
                      {meta.label}
                    </span>
                    {meta.optional ? (
                      <span className="fee-letter-modern-optional ml-2 inline-block text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Optional
                      </span>
                    ) : null}
                  </td>
                  {terms.map((t) => {
                    const amt = rowMap.get(t.term)
                    const hasAmount = amt != null && amt > 0
                    return (
                      <td
                        key={t.term}
                        className={cn(
                          'fee-letter-modern-matrix-amt px-3 py-3 text-right text-[12px]',
                          !isLast && 'border-b',
                        )}
                        style={{ borderColor: LINE }}
                      >
                        {hasAmount ? (
                          <Amount
                            amount={amt}
                            className="font-medium text-slate-600"
                          />
                        ) : (
                          <span className="text-slate-300 font-light">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            <tr className="fee-letter-modern-matrix-totals fee-letter-tr-total">
              <td
                className="fee-letter-modern-matrix-totals-label px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-white"
                style={{ background: HEADER_FROM }}
              >
                {multiTerm ? model.resolvedTotalLabel : 'Total'}
              </td>
              {terms.map((t) => (
                <td
                  key={t.term}
                  className="fee-letter-modern-matrix-totals-cell px-3 py-3.5 text-right text-[12px] font-semibold text-white"
                  style={{ background: HEADER_TO }}
                >
                  <Amount amount={t.subtotal} className="text-white" />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {multiTerm ? (
        <div
          className="fee-letter-modern-matrix-summary mt-4 flex items-center justify-between gap-4 border-t border-slate-200 pt-3"
        >
          <span className="text-[11px] text-slate-500">
            Grand total across selected terms
          </span>
          <span
            className="text-[13px] font-semibold tabular-nums tracking-tight"
            style={{ color: INK }}
          >
            <Amount amount={model.grandTotal} />
          </span>
        </div>
      ) : null}
    </section>
  )
}
