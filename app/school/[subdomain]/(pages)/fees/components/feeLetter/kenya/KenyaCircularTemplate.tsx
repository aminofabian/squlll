'use client'

import { useMemo, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { formatKes } from '../../../lib/feeLetter/buildFeeLetterModel'
import { buildFeeLetterPivot } from '../../../lib/feeLetter/buildFeeLetterPivot'
import type { FeeLetterModel } from '../../../lib/feeLetter/types'
import { LogoBox, SchoolWebsiteLine } from '../FeeLetterParts'

const GREEN = '#006600'
const GREEN_DARK = '#004d00'
const GOLD = '#b8860b'
const GOLD_LIGHT = '#fef9e7'
const RED = '#bb0000'
const BLACK = '#1a1a1a'

function Amount({ amount, className }: { amount: number; className?: string }) {
  return (
    <span className={cn('tabular-nums', className)}>{formatKes(amount)}</span>
  )
}

function circularNo(model: FeeLetterModel): string {
  const year =
    model.titleText.match(/\d{4}/)?.[0] ??
    model.dateStr.split('/').pop() ??
    '0000'
  const code = model.displaySchool.replace(/[^A-Z]/gi, '').slice(0, 4).toUpperCase() || 'SCH'
  return `KFS/CIRC/${year}/${code}`
}

function KenyaFrame({ children }: { children: ReactNode }) {
  return (
    <div className="fee-letter-kenya-circular-doc relative">
      <div
        className="fee-letter-kenya-tricolor mb-0 flex h-2 w-full overflow-hidden rounded-t-lg"
        aria-hidden
      >
        <span className="flex-[1]" style={{ backgroundColor: BLACK }} />
        <span className="w-1 bg-white" />
        <span className="flex-[1]" style={{ backgroundColor: RED }} />
        <span className="w-1 bg-white" />
        <span className="flex-[1]" style={{ backgroundColor: GREEN }} />
      </div>

      <div
        className="fee-letter-kenya-ring-outer rounded-b-lg px-6 py-7 sm:px-8"
        style={{
          border: `3px solid ${GREEN}`,
          borderTop: 'none',
          boxShadow: `inset 0 0 0 1px ${GOLD}`,
          backgroundColor: '#fff',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function KenyaCrestHeader({ model }: { model: FeeLetterModel }) {
  return (
    <header className="fee-letter-kenya-header text-center">
      <div className="fee-letter-kenya-crest mx-auto mb-3 flex flex-col items-center">
        <div
          className="fee-letter-kenya-crest-outer flex items-center justify-center rounded-full p-1"
          style={{
            width: '5.5rem',
            height: '5.5rem',
            border: `3px solid ${GREEN}`,
            boxShadow: `0 0 0 2px ${GOLD}, 0 0 0 4px ${GREEN}22`,
          }}
        >
          <div
            className="flex h-full w-full items-center justify-center rounded-full"
            style={{ backgroundColor: GOLD_LIGHT }}
          >
            <LogoBox
              logoUrl={model.logoUrl}
              schoolLogoKey={model.schoolLogoKey}
              size="sm"
            />
          </div>
        </div>
      </div>

      <p
        className="fee-letter-kenya-republic text-[10px] font-bold uppercase tracking-[0.4em]"
        style={{ color: GREEN }}
      >
        Republic of Kenya
      </p>
      <h1
        className="fee-letter-kenya-school mt-2 text-lg font-bold uppercase leading-tight tracking-wide sm:text-xl"
        style={{ color: GREEN_DARK }}
      >
        {model.displaySchool}
      </h1>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
        Board of Management · Fees Circular
      </p>
      <p className="mt-1 text-xs italic text-stone-600">
        &ldquo;{model.schoolMotto}&rdquo;
      </p>

      <div className="mx-auto mt-3 max-w-sm space-y-0.5 text-[11px] text-stone-600">
        <p>{model.displayAddress}</p>
        {model.displayContact ? <p>Tel: {model.displayContact}</p> : null}
        {model.displayEmail ? <p>{model.displayEmail}</p> : null}
        {model.schoolWebsiteUrl ? (
          <SchoolWebsiteLine url={model.schoolWebsiteUrl} align="center" />
        ) : null}
      </div>

      <div
        className="fee-letter-kenya-crest-rule mx-auto my-4 h-px w-32"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
      />
    </header>
  )
}

function KenyaDispatch({ model }: { model: FeeLetterModel }) {
  const ref = circularNo(model)
  return (
    <div className="fee-letter-kenya-dispatch mb-5 text-[12px] leading-relaxed text-stone-800">
      <div
        className="fee-letter-kenya-meta mb-4 grid gap-2 rounded-md px-4 py-3 text-[11px] sm:grid-cols-2"
        style={{ backgroundColor: GOLD_LIGHT, border: `1px solid ${GOLD}55` }}
      >
        <p>
          <span className="font-bold uppercase tracking-wide" style={{ color: GREEN }}>
            Circular No:
          </span>{' '}
          <span className="font-semibold text-stone-900">{ref}</span>
        </p>
        <p className="sm:text-right">
          <span className="font-bold uppercase tracking-wide" style={{ color: GREEN }}>
            Date:
          </span>{' '}
          <span className="font-semibold tabular-nums">{model.dateStr}</span>
        </p>
        <p className="sm:col-span-2">
          <span className="font-bold uppercase tracking-wide" style={{ color: GREEN }}>
            To:
          </span>{' '}
          Parents, Guardians &amp; Sponsors of learners at {model.displaySchool}
        </p>
      </div>

      <p
        className="fee-letter-kenya-subject text-center text-[11px] font-bold uppercase tracking-[0.15em] mb-1"
        style={{ color: GREEN_DARK }}
      >
        Subject
      </p>
      <h2 className="fee-letter-kenya-title text-center text-[15px] font-bold uppercase mb-1">
        {model.titleText}
      </h2>
      {model.termScopeLine ? (
        <p
          className="text-center text-[11px] font-bold uppercase tracking-widest mb-4"
          style={{ color: GOLD }}
        >
          ({model.termScopeLine})
        </p>
      ) : (
        <div className="mb-4" />
      )}

      <p className="text-justify indent-8">
        Pursuant to the resolution of the Board of Management, this circular sets
        out the approved vote heads and fees payable for the academic period
        indicated. All payments shall be made in Kenya Shillings unless otherwise
        stated.
      </p>
    </div>
  )
}

function KenyaFeesMatrix({ model }: { model: FeeLetterModel }) {
  const { terms, headOrder, headMeta, grid } = useMemo(
    () => buildFeeLetterPivot(model),
    [model],
  )

  if (!model.hasAnyLines || headOrder.length === 0) {
    return (
      <p className="border border-stone-400 py-8 text-center text-sm">
        No fee schedule published for the selected terms.
      </p>
    )
  }

  const multiTerm = terms.length > 1

  return (
    <section className="fee-letter-kenya-schedule fee-letter-section mb-6">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          A
        </span>
        <h3
          className="text-[12px] font-bold uppercase tracking-wide"
          style={{ color: GREEN_DARK }}
        >
          Schedule of fees (vote heads by term)
        </h3>
      </div>

      <div className="fee-letter-kenya-table-wrap overflow-hidden rounded-md border-2" style={{ borderColor: GREEN }}>
        <table className="fee-letter-kenya-table fee-letter-table fee-letter-table--kenya w-full border-collapse text-[11px]">
          <thead>
            <tr>
              <th
                className="px-2 py-2 text-left font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: GREEN,
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                Vote head
              </th>
              {terms.map((t) => (
                <th
                  key={t.term}
                  className="px-2 py-2 text-right font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: GREEN,
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  <span className="block">{t.term}</span>
                  <span
                    className="mt-0.5 block text-[8px] font-normal tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.85)' }}
                  >
                    KES
                  </span>
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
                    'fee-letter-kenya-row',
                    idx % 2 === 1 && 'fee-letter-kenya-row--alt',
                  )}
                >
                  <td className="border border-stone-300 px-2 py-1.5 text-stone-900">
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
                        className="border border-stone-300 px-2 py-1.5 text-right tabular-nums"
                      >
                        {ok ? <Amount amount={amt} /> : '—'}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            <tr className="fee-letter-kenya-totals fee-letter-tr-total font-bold">
              <td
                className="border border-stone-300 px-2 py-2 uppercase tracking-wide"
                style={{ backgroundColor: GREEN_DARK, color: '#fff' }}
              >
                {multiTerm ? model.resolvedTotalLabel : 'Total'}
              </td>
              {terms.map((t) => (
                <td
                  key={t.term}
                  className="border border-stone-300 px-2 py-2 text-right"
                  style={{ backgroundColor: GREEN, color: '#fff' }}
                >
                  <Amount amount={t.subtotal} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {multiTerm ? (
        <p className="mt-2 text-right text-[11px]">
          <span className="text-stone-500">Combined total: </span>
          <span className="font-bold" style={{ color: GREEN_DARK }}>
            <Amount amount={model.grandTotal} />
          </span>
          <span className="text-stone-400"> KES</span>
        </p>
      ) : null}
    </section>
  )
}

function KenyaAnnexPayment({ model }: { model: FeeLetterModel }) {
  return (
    <section className="fee-letter-kenya-annex fee-letter-section mb-6">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: GOLD }}
        >
          B
        </span>
        <h3
          className="text-[12px] font-bold uppercase tracking-wide"
          style={{ color: GREEN_DARK }}
        >
          Annex — Mode of payment
        </h3>
      </div>
      <div
        className="rounded-md border px-4 py-3 text-[12px] leading-relaxed"
        style={{ borderColor: `${GREEN}66`, backgroundColor: '#fafafa' }}
      >
        <p className="mb-3 text-justify indent-6">
          Fees shall be paid in full at the opening of each term to the accounts
          below. Official receipts are issued upon presentation of original pay-in
          slips.
        </p>
        <ol className="ml-5 list-decimal space-y-2">
          {model.bankAccounts.map((acc, i) => (
            <li key={i}>
              <span className="font-semibold">{acc.bankName}</span>
              {acc.branch ? `, ${acc.branch}` : ''} — A/C{' '}
              <span className="underline decoration-stone-400">
                {acc.accountNumber || '…………'}
              </span>
            </li>
          ))}
          {model.includePostalMoneyOrder && model.postalAddress?.trim() ? (
            <li>Postal Money Order — {model.postalAddress}</li>
          ) : null}
        </ol>
        <div
          className="mt-4 border-l-4 pl-3 text-[11px]"
          style={{ borderColor: GREEN }}
        >
          <p className="font-bold uppercase tracking-wide mb-1" style={{ color: GREEN }}>
            Notice
          </p>
          {model.paymentNotes.map((note, i) => (
            <p key={i} className="mb-1 text-justify">
              {note}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

function KenyaAuthentication({ model }: { model: FeeLetterModel }) {
  const ref = circularNo(model)
  return (
    <footer className="fee-letter-kenya-auth fee-letter-section">
      <div
        className="fee-letter-kenya-gold-rule mb-5 h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${GREEN}, ${GOLD}, ${GREEN})`,
        }}
      />
      <div className="flex items-end justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-1 h-10 border-b-2" style={{ borderColor: GREEN }} />
          <p className="text-sm font-bold text-stone-900">{model.principalName}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: GREEN }}>
            {model.principalTitle}
          </p>
          <p className="mt-2 text-[10px] text-stone-500">For and on behalf of the Board</p>
        </div>
        <div className="fee-letter-kenya-stamp-block shrink-0 text-center">
          <div
            className="fee-letter-kenya-stamp-slot mx-auto rounded-full"
            role="img"
            aria-label="Blank area for official school stamp"
            style={{
              width: '45mm',
              height: '45mm',
              minWidth: '5.5rem',
              minHeight: '5.5rem',
              backgroundColor: '#fff',
              border: `2px dashed ${GREEN}`,
              boxShadow: `inset 0 0 0 2px ${GOLD}33`,
            }}
          />
          <p
            className="mt-2 max-w-[5.5rem] text-[9px] font-semibold uppercase leading-snug tracking-widest"
            style={{ color: GREEN }}
          >
            Official stamp
          </p>
          <p className="mt-0.5 text-[8px] text-stone-400">Affix here</p>
        </div>
      </div>
      <p
        className="fee-letter-kenya-footer-note mt-5 text-center text-[10px] italic"
        style={{ color: GREEN }}
      >
        When replying please quote circular ref {ref}
      </p>
      <p className="mt-2 text-center text-[9px] uppercase tracking-[0.2em] text-stone-400">
        Integrity · Patriotism · Excellence
      </p>
    </footer>
  )
}

export function KenyaCircularTemplate({ model }: { model: FeeLetterModel }) {
  return (
    <KenyaFrame>
      <KenyaCrestHeader model={model} />
      <KenyaDispatch model={model} />
      <KenyaFeesMatrix model={model} />
      <KenyaAnnexPayment model={model} />
      <KenyaAuthentication model={model} />
    </KenyaFrame>
  )
}
