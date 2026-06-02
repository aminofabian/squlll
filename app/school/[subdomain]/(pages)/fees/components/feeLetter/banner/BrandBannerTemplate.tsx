'use client'

import { useMemo, type CSSProperties } from 'react'
import { FIGTREE_FONT_FAMILY } from '@/lib/fonts/figtree'
import { getSchoolColor } from '@/lib/schoolLogo'
import { cn } from '@/lib/utils'
import { formatKes } from '../../../lib/feeLetter/buildFeeLetterModel'
import { buildFeeLetterPivot } from '../../../lib/feeLetter/buildFeeLetterPivot'
import { formatPortalUrlForDisplay } from '../../../lib/feeLetter/schoolPortalUrl'
import type { FeeLetterModel } from '../../../lib/feeLetter/types'
import { LogoBox } from '../FeeLetterParts'

function Amount({
  amount,
  className,
  large,
}: {
  amount: number
  className?: string
  large?: boolean
}) {
  return (
    <span
      className={cn(
        'tabular-nums tracking-tight',
        large && 'text-2xl font-bold leading-none',
        className,
      )}
    >
      {formatKes(amount)}
    </span>
  )
}

const heroGradient = (from: string, to: string) =>
  `linear-gradient(125deg, ${from} 0%, ${to} 55%, ${from} 100%)`

/** Diagonal white edge — SVG prints reliably; clip-path often fails in print iframes */
function BrandHeroSlice() {
  return (
    <svg
      className="fee-letter-brand-hero-slice"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 40"
      preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height: '40px' }}
      aria-hidden
    >
      <polygon points="0,0 0,40 1000,40 1000,12" fill="#ffffff" />
    </svg>
  )
}

function BrandHero({ model, from, to }: { model: FeeLetterModel; from: string; to: string }) {
  const host = model.schoolWebsiteUrl
    ? formatPortalUrlForDisplay(model.schoolWebsiteUrl)
    : ''
  const gradient = heroGradient(from, to)

  return (
    <header
      className="fee-letter-brand-hero relative mb-0"
      style={{
        background: gradient,
        color: '#fff',
        overflow: 'visible',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      <div
        className="fee-letter-brand-hero-pattern absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.12,
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 8px,
            rgba(255,255,255,0.15) 8px,
            rgba(255,255,255,0.15) 9px
          )`,
        }}
        aria-hidden
      />
      <div
        className="fee-letter-brand-hero-content relative flex items-stretch gap-5 px-6 py-7"
        style={{ display: 'flex', alignItems: 'stretch', gap: '1.25rem' }}
      >
        <div className="fee-letter-brand-hero-logo shrink-0">
          <div
            className="rounded-2xl p-1.5"
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            <LogoBox
              logoUrl={model.logoUrl}
              schoolLogoKey={model.schoolLogoKey}
            />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="fee-letter-brand-hero-eyebrow text-[10px] font-bold uppercase tracking-[0.35em]"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Parent fee notice
          </p>
          <h1
            className="fee-letter-brand-hero-title mt-1 text-xl font-bold uppercase leading-tight tracking-wide sm:text-2xl"
            style={{ color: '#fff', textDecoration: 'none' }}
          >
            {model.displaySchool}
          </h1>
          <p
            className="mt-1 max-w-md text-sm font-medium italic"
            style={{ color: 'rgba(255,255,255,0.92)' }}
          >
            &ldquo;{model.schoolMotto}&rdquo;
          </p>
          <div
            className="mt-3 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.25rem 1rem',
              color: 'rgba(255,255,255,0.78)',
            }}
          >
            {model.displayAddress ? <span>{model.displayAddress}</span> : null}
            {model.displayContact ? <span>Tel {model.displayContact}</span> : null}
            {host ? <span>{host}</span> : null}
          </div>
        </div>
        <div
          className="fee-letter-brand-hero-date shrink-0 text-right hidden sm:block"
          style={{ color: '#fff' }}
        >
          <p
            className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            Issued
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{model.dateStr}</p>
        </div>
      </div>
      <BrandHeroSlice />
    </header>
  )
}

function TermSpotlights({
  model,
  from,
  to,
}: {
  model: FeeLetterModel
  from: string
  to: string
}) {
  const terms = model.terms.filter((t) => t.lines.length > 0)
  if (terms.length === 0) return null

  const multiTerm = terms.length > 1
  const gridColumns =
    terms.length <= 1
      ? '1fr'
      : terms.length === 2
        ? '1fr 1fr'
        : '1fr 1fr 1fr'

  const colCount = terms.length

  return (
    <div
      className="fee-letter-brand-spotlights relative z-10 px-1"
      style={{
        marginTop: '-1.5rem',
        marginBottom: '1.5rem',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div
        className="fee-letter-brand-spotlight-grid"
        data-cols={String(colCount)}
        style={{
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: '0.75rem',
          maxWidth: terms.length === 1 ? '12rem' : undefined,
          marginLeft: terms.length === 1 ? 'auto' : undefined,
          marginRight: terms.length === 1 ? 'auto' : undefined,
        }}
      >
        {terms.map((t) => (
          <div
            key={t.term}
            className="fee-letter-brand-spotlight-card overflow-hidden rounded-xl text-center"
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
            }}
          >
            <div
              className="fee-letter-brand-spotlight-accent"
              style={{ height: '6px', width: '100%', backgroundColor: from }}
            />
            <div className="px-3 py-3">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: '#64748b' }}
              >
                {t.term}
              </p>
              <p className="mt-1" style={{ color: '#0f172a', fontSize: '1.35rem', fontWeight: 700 }}>
                <Amount amount={t.subtotal} />
              </p>
              <p
                className="mt-1 text-[9px] uppercase tracking-wider"
                style={{ color: '#94a3b8' }}
              >
                Term total · KES
              </p>
            </div>
          </div>
        ))}
      </div>
      {multiTerm ? (
        <div
          className="fee-letter-brand-spotlight-total overflow-hidden rounded-xl text-center"
          style={{
            marginTop: '0.75rem',
            backgroundColor: from,
            backgroundImage: `linear-gradient(145deg, ${from}, ${to})`,
            color: '#fff',
            borderRadius: '0.75rem',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          <div
            className="fee-letter-brand-spotlight-total-inner flex flex-wrap items-center justify-center gap-4 px-4 py-3 sm:justify-between"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '0.75rem 1rem',
              color: '#fff',
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              {model.resolvedTotalLabel}
              {model.termScopeLine ? ` · ${model.termScopeLine}` : ''}
            </p>
            <p style={{ fontSize: '1.35rem', fontWeight: 700 }}>
              <Amount amount={model.grandTotal} />
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function BrandMatrix({
  model,
  from,
}: {
  model: FeeLetterModel
  from: string
}) {
  const { terms, headOrder, headMeta, grid } = useMemo(
    () => buildFeeLetterPivot(model),
    [model],
  )

  if (!model.hasAnyLines || headOrder.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
        No fee line items for this letter.
      </p>
    )
  }

  return (
    <section className="fee-letter-brand-matrix fee-letter-section mb-6">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="h-8 w-1 rounded-full"
          style={{ backgroundColor: from }}
        />
        <div>
          <h2
            className="fee-letter-brand-matrix-title text-sm font-bold uppercase tracking-wide"
            style={{ color: '#0f172a', textDecoration: 'none', textAlign: 'left', margin: 0 }}
          >
            {model.titleText}
          </h2>
          {model.termScopeLine ? (
            <p className="text-[11px]" style={{ color: '#64748b' }}>
              {model.termScopeLine}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className="fee-letter-brand-table-shell overflow-hidden rounded-xl"
        style={{ border: '1px solid #e2e8f0' }}
      >
        <table className="fee-letter-brand-table fee-letter-table w-full border-collapse text-[11px]">
          <thead>
            <tr>
              <th
                className="px-3 py-2.5 text-left font-semibold uppercase tracking-wide"
                style={{ backgroundColor: from, color: '#fff' }}
              >
                Vote head
              </th>
              {terms.map((t) => (
                <th
                  key={t.term}
                  className="px-2 py-2.5 text-right font-semibold uppercase tracking-wide"
                  style={{
                    backgroundColor: from,
                    color: '#fff',
                    borderLeft: '1px solid rgba(255,255,255,0.2)',
                  }}
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
                    'fee-letter-brand-row',
                    idx % 2 === 1 && 'fee-letter-brand-row--alt',
                  )}
                >
                  <td
                    className="px-3 py-2"
                    style={{
                      borderTop: '1px solid #f1f5f9',
                      color: '#1e293b',
                    }}
                  >
                    {meta.label}
                    {meta.optional ? (
                      <span
                        className="ml-1 text-[9px] uppercase"
                        style={{ color: '#94a3b8' }}
                      >
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
                        className="px-2 py-2 tabular-nums"
                        style={{
                          borderTop: '1px solid #f1f5f9',
                          color: '#334155',
                          textAlign: 'right',
                        }}
                      >
                        {ok ? <Amount amount={amt} /> : '—'}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p
        className="mt-2 text-[10px] text-right"
        style={{ color: '#94a3b8' }}
      >
        All figures · Kenya Shillings
      </p>
    </section>
  )
}

function BrandPaymentRail({
  model,
  from,
  to,
}: {
  model: FeeLetterModel
  from: string
  to: string
}) {
  return (
    <section
      className="fee-letter-brand-payment fee-letter-section mb-6 overflow-hidden rounded-xl"
      style={{
        background: `linear-gradient(90deg, ${from}, ${to})`,
        color: '#fff',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      <div
        className="fee-letter-brand-payment-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
        }}
      >
        <div
          className="fee-letter-brand-payment-intro"
          style={{
            padding: '1rem 1.25rem',
            borderRight: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <h3
            className="fee-letter-brand-payment-title text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: '#fff', textDecoration: 'none', margin: 0 }}
          >
            How to pay
          </h3>
          <p
            className="mt-2 text-[12px] leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.92)', marginBottom: 0 }}
          >
            Pay in full at the start of each term. Present your deposit slip for
            an official receipt.
          </p>
        </div>
        <div
          className="fee-letter-brand-payment-banks"
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(0,0,0,0.15)',
          }}
        >
          <ol
            className="text-[11px] leading-snug"
            style={{ margin: 0, padding: 0, listStyle: 'none' }}
          >
            {model.bankAccounts.map((acc, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  color: '#fff',
                }}
              >
                <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>
                  {i + 1}.
                </span>
                <span>
                  <span style={{ fontWeight: 600 }}>{acc.bankName}</span>
                  {acc.branch ? ` · ${acc.branch}` : ''}
                  <br />
                  <span style={{ color: 'rgba(255,255,255,0.88)' }}>
                    A/C {acc.accountNumber || '…………'}
                  </span>
                </span>
              </li>
            ))}
            {model.includePostalMoneyOrder && model.postalAddress?.trim() ? (
              <li style={{ display: 'flex', gap: '0.5rem', color: '#fff' }}>
                <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>
                  +
                </span>
                <span>Postal order — {model.postalAddress}</span>
              </li>
            ) : null}
          </ol>
        </div>
      </div>
      {model.paymentNotes.length > 0 ? (
        <div
          className="fee-letter-brand-payment-notes"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(0,0,0,0.1)',
            padding: '0.75rem 1.25rem',
            fontSize: '10px',
            lineHeight: 1.5,
            color: 'rgba(255,255,255,0.92)',
          }}
        >
          <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>
            Note —{' '}
          </span>
          {model.paymentNotes.join(' ')}
        </div>
      ) : null}
    </section>
  )
}

function BrandSignOff({
  model,
  from,
}: {
  model: FeeLetterModel
  from: string
}) {
  return (
    <footer
      className="fee-letter-brand-signoff fee-letter-section flex items-end justify-between gap-6 pt-5"
      style={{
        marginTop: '2rem',
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <div>
        <div className="mb-1 h-px w-40" style={{ backgroundColor: from }} />
        <p className="text-sm font-bold" style={{ color: '#0f172a', margin: 0 }}>
          {model.principalName}
        </p>
        <p
          className="text-[11px] uppercase tracking-wide"
          style={{ color: '#64748b', margin: '0.15rem 0 0' }}
        >
          {model.principalTitle}
        </p>
      </div>
      <p
        className="max-w-[12rem] text-right text-[10px] leading-relaxed"
        style={{ color: '#94a3b8', margin: 0 }}
      >
        Generated for parents &amp; guardians. Retain this notice for admission
        and fee reconciliation.
      </p>
    </footer>
  )
}

export function BrandBannerTemplate({ model }: { model: FeeLetterModel }) {
  const { from, to } = getSchoolColor(model.schoolLogoKey)
  const docFont: CSSProperties = {
    fontFamily: FIGTREE_FONT_FAMILY,
  }

  const brandVars: CSSProperties = {
    ...docFont,
    ['--fee-letter-brand' as string]: from,
    ['--fee-letter-brand-to' as string]: to,
  }

  return (
    <div
      className="fee-letter-brand-doc"
      style={{
        ...brandVars,
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      <div className="fee-letter-brand-top">
        <BrandHero model={model} from={from} to={to} />
        <TermSpotlights model={model} from={from} to={to} />
      </div>
      <div className="fee-letter-brand-main px-1 pb-2">
        <div className="fee-letter-brand-meta mb-2 flex flex-wrap justify-between gap-2 text-[11px] text-slate-500 sm:hidden">
          <span>Ref: FEE/{model.dateStr.replace(/\//g, '')}</span>
          <span>{model.dateStr}</span>
        </div>
        <BrandMatrix model={model} from={from} />
        <div className="fee-letter-brand-footer">
          <BrandPaymentRail model={model} from={from} to={to} />
          <BrandSignOff model={model} from={from} />
        </div>
      </div>
    </div>
  )
}
