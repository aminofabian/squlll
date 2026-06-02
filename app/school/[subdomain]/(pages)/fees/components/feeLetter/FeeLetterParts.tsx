'use client'

import { Fragment } from 'react'
import { GeneratedSchoolLogo } from '@/components/school/GeneratedSchoolLogo'
import { FIGTREE_FONT_FAMILY } from '@/lib/fonts/figtree'
import { cn } from '@/lib/utils'
import { formatPortalUrlForDisplay } from '../../lib/feeLetter/schoolPortalUrl'
import { formatKes } from '../../lib/feeLetter/buildFeeLetterModel'
import type { FeeLetterModel } from '../../lib/feeLetter/types'

export function KesAmount({ amount }: { amount: number }) {
  return (
    <>
      <span className="text-[8px] opacity-70">KES</span> {formatKes(amount)}
    </>
  )
}

const LOGO_DIMENSIONS = {
  md: { width: 72, height: 78 },
  sm: { width: 44, height: 48 },
} as const

export type FeeLetterLogoSize = keyof typeof LOGO_DIMENSIONS

export function LogoBox({
  logoUrl,
  schoolLogoKey,
  className = '',
  size = 'md',
}: {
  logoUrl: string | null
  schoolLogoKey: string
  className?: string
  size?: FeeLetterLogoSize
}) {
  const { width, height } = LOGO_DIMENSIONS[size]
  const boxStyle = {
    width: `${width}px`,
    height: `${height}px`,
    maxWidth: `${width}px`,
    maxHeight: `${height}px`,
  } as const

  const boxClass = cn(
    'fee-letter-logo shrink-0 flex items-center justify-center overflow-hidden bg-white',
    size === 'sm' && 'fee-letter-logo--sm',
    className,
  )

  if (logoUrl) {
    return (
      <div className={boxClass} style={boxStyle} aria-hidden>
        <img
          src={logoUrl}
          alt=""
          className="block h-full w-full max-h-full max-w-full object-contain"
        />
      </div>
    )
  }

  return (
    <div className={boxClass} style={boxStyle} aria-hidden>
      <GeneratedSchoolLogo
        schoolKey={schoolLogoKey}
        className="h-full w-full max-h-full max-w-full"
      />
    </div>
  )
}

type TableStyle = {
  wrap: string
  table: string
  tablePrintVariant?: string
  th: string
  thRight: string
  cell: string
  termRow: string
  subtotalRow: string
  totalRow: string
}

export const CLASSIC_TABLE: TableStyle = {
  wrap: 'fee-letter-section mb-5',
  table: 'fee-letter-table w-full border-collapse border border-black text-xs',
  tablePrintVariant: 'classic',
  th: 'border border-black px-2 py-1 text-left font-bold bg-gray-100 text-xs',
  thRight:
    'border border-black px-2 py-1 text-right font-bold bg-gray-100 text-xs',
  cell: 'border border-black px-2 py-0.5 align-middle text-xs leading-snug',
  termRow: 'bg-gray-200',
  subtotalRow: 'bg-gray-100',
  totalRow: 'bg-gray-300 font-bold',
}

export function VoteHeadTable({
  model,
  style,
}: {
  model: FeeLetterModel
  style: TableStyle
}) {
  if (!model.hasAnyLines) {
    return (
      <p className="text-center py-6 border border-black text-sm">
        No fee vote heads have been entered for this structure.
      </p>
    )
  }

  const tableClass = cn(
    style.table,
    style.tablePrintVariant &&
      `fee-letter-table--${style.tablePrintVariant}`,
  )

  return (
    <div className={style.wrap}>
      <table className={tableClass}>
        <thead>
          <tr>
            <th className={style.th}>VOTE HEAD</th>
            <th className={style.thRight}>AMOUNT (KES)</th>
          </tr>
        </thead>
        <tbody>
          {model.terms.map((block, termIndex) => {
            if (block.lines.length === 0) return null
            return (
              <Fragment key={`term-${termIndex}`}>
                <tr className={cn(style.termRow, 'fee-letter-tr-term')}>
                  <td colSpan={2} className={`${style.cell} font-bold text-center`}>
                    {block.term.toUpperCase()}
                  </td>
                </tr>
                {block.lines.map((line, lineIdx) => (
                  <tr key={`${termIndex}-${lineIdx}`}>
                    <td className={`${style.cell} pl-4`}>
                      {line.name}
                      {line.optional ? ' (Optional)' : ''}
                    </td>
                    <td className={`${style.cell} text-right`}>
                      <KesAmount amount={line.amount} />
                    </td>
                  </tr>
                ))}
                <tr className={cn(style.subtotalRow, 'fee-letter-tr-subtotal')}>
                  <td className={`${style.cell} font-semibold`}>
                    {block.term.toUpperCase()} SUBTOTAL
                  </td>
                  <td className={`${style.cell} text-right font-semibold`}>
                    <KesAmount amount={block.subtotal} />
                  </td>
                </tr>
              </Fragment>
            )
          })}
          <tr className={cn(style.totalRow, 'fee-letter-tr-total')}>
            <td className={style.cell}>{model.resolvedTotalLabel}</td>
            <td className={`${style.cell} text-right`}>
              <KesAmount amount={model.grandTotal} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function TermScheduleTable({
  model,
  style,
  headingClassName,
}: {
  model: FeeLetterModel
  style: TableStyle
  headingClassName: string
}) {
  if (!model.hasAnyLines || model.terms.length === 0) return null

  return (
    <div className="fee-letter-section mb-5">
      <h3 className={headingClassName}>{model.termlyHeading}</h3>
      <div className="flex justify-center">
        <table
          className={cn(
            style.table,
            style.tablePrintVariant &&
              `fee-letter-table--${style.tablePrintVariant}`,
            'min-w-[240px]',
          )}
        >
          <thead>
            <tr>
              <th className={style.th}>TERM</th>
              <th className={style.thRight}>AMOUNT (KES)</th>
            </tr>
          </thead>
          <tbody>
            {model.terms.map((block, index) => (
              <tr key={`pay-${index}`}>
                <td className={style.cell}>{block.term.toUpperCase()}</td>
                <td className={`${style.cell} text-right`}>
                  <KesAmount amount={block.subtotal} />
                </td>
              </tr>
            ))}
            <tr className={style.subtotalRow}>
              <td className={`${style.cell} font-bold`}>TOTAL</td>
              <td className={`${style.cell} text-right font-bold`}>
                <KesAmount amount={model.grandTotal} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function PaymentSection({
  model,
  titleClassName = 'font-bold underline mb-4',
}: {
  model: FeeLetterModel
  titleClassName?: string
}) {
  return (
    <div className="fee-letter-section mb-8">
      <h3 className={titleClassName}>MODE OF PAYMENT:</h3>
      <p className="mb-4 text-justify">
        Full school fees should be paid at the beginning of the term to any of
        the school accounts listed hereunder.
      </p>
      <div className="mb-4 space-y-2">
        {model.bankAccounts.map((acc, i) => (
          <p key={i} className="mb-2">
            {i + 1}. {acc.bankName}
            {acc.branch ? (
              <>&nbsp;&nbsp;&nbsp;&nbsp;{acc.branch}</>
            ) : (
              <>&nbsp;&nbsp;&nbsp;&nbsp;………… Branch</>
            )}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A/C No:{' '}
            <span className="underline font-medium">
              {acc.accountNumber || '……………………'}
            </span>
          </p>
        ))}
        {model.includePostalMoneyOrder && model.postalAddress?.trim() ? (
          <p className="mb-2">
            {model.bankAccounts.length + 1}. Postal Money Order
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {model.postalAddress}
          </p>
        ) : null}
      </div>
      <p className="font-bold mb-2">NB.</p>
      <div className="mb-4 space-y-2 text-justify">
        {model.paymentNotes.map((note, i) => (
          <p key={i}>{note}</p>
        ))}
      </div>
    </div>
  )
}

export function SignatureBlock({ model }: { model: FeeLetterModel }) {
  return (
    <div className="mt-12">
      <div className="flex justify-between items-end gap-8">
        <div>
          <p className="font-bold">{model.principalName}</p>
          <p className="font-bold">{model.principalTitle}</p>
        </div>
        <div className="text-right">
          <div className="w-32 h-16 border-b border-black mb-2 ml-auto" />
          <p className="text-sm font-bold">PRINCIPAL</p>
          <p className="text-xs">DATE: ........................</p>
        </div>
      </div>
    </div>
  )
}

export function LetterheadSchoolDetails({
  model,
  align = 'left',
  variant = 'default',
  titleClassName,
}: {
  model: FeeLetterModel
  align?: 'left' | 'center'
  variant?: 'default' | 'onDark'
  titleClassName?: string
}) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left'
  const onDark = variant === 'onDark'
  const headingFont = { fontFamily: FIGTREE_FONT_FAMILY } as const

  return (
    <div className={alignClass}>
      <h1
        className={cn(
          'text-2xl font-bold leading-tight tracking-tight',
          onDark ? 'text-white' : 'text-slate-900',
          titleClassName,
        )}
        style={headingFont}
      >
        {model.displaySchool}
      </h1>
      <p
        className={cn(
          'mt-1 text-sm font-medium italic tracking-wide',
          onDark ? 'text-white/90' : 'text-slate-700',
        )}
        style={headingFont}
      >
        &ldquo;{model.schoolMotto}&rdquo;
      </p>
      <p
        className={cn(
          'mt-2 text-xs',
          onDark ? 'text-white/75' : 'text-slate-600',
        )}
      >
        {model.displayAddress}
      </p>
      {model.displayContact ? (
        <p className={cn('text-xs', onDark ? 'text-white/75' : 'text-slate-600')}>
          {model.displayContact}
        </p>
      ) : null}
      {model.displayEmail ? (
        <p className={cn('text-xs', onDark ? 'text-white/75' : 'text-slate-600')}>
          E-mail: {model.displayEmail}
        </p>
      ) : null}
      {model.schoolWebsiteUrl ? (
        <SchoolWebsiteLine
          url={model.schoolWebsiteUrl}
          onDark={onDark}
          align={align}
        />
      ) : null}
    </div>
  )
}

export function SchoolWebsiteLine({
  url,
  onDark = false,
  align = 'left',
  className,
}: {
  url: string
  onDark?: boolean
  align?: 'left' | 'center'
  className?: string
}) {
  const host = formatPortalUrlForDisplay(url)
  if (!host) return null

  return (
    <p
      className={cn(
        'fee-letter-website text-xs leading-snug',
        align === 'center' ? 'text-center' : 'text-left',
        onDark ? 'text-white/90' : 'text-slate-600',
        className,
      )}
    >
      <span className={onDark ? 'text-white/75' : 'text-slate-500'}>
        Website:{' '}
      </span>
      <a
        href={url}
        className={cn(
          'underline underline-offset-2 break-all',
          onDark
            ? 'text-white decoration-white/40'
            : 'text-slate-800 decoration-slate-400',
        )}
      >
        {host}
      </a>
    </p>
  )
}

/** Footer strip on printed letter */
export function LetterWebsiteFooter({ model }: { model: FeeLetterModel }) {
  if (!model.schoolWebsiteUrl) return null
  const host = formatPortalUrlForDisplay(model.schoolWebsiteUrl)

  return (
    <div className="fee-letter-section fee-letter-portal-footer mt-8 border-t border-slate-300 pt-3">
      <p className="text-center text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1.5">
        School portal
      </p>
      <p className="fee-letter-website text-center text-xs text-slate-700">
        <a
          href={model.schoolWebsiteUrl}
          className="text-slate-900 underline decoration-slate-400 underline-offset-2"
        >
          {host}
        </a>
      </p>
      <p className="text-center text-[10px] text-slate-500 mt-1 italic">
        Fees, results &amp; school updates online
      </p>
    </div>
  )
}

export function RefsAndDate({ model }: { model: FeeLetterModel }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start gap-6">
        <div>
          <p className="mb-1">Our Ref: ................................</p>
          <p>Your Ref: ................................</p>
        </div>
        <p className="text-right whitespace-nowrap">Date: {model.dateStr}</p>
      </div>
    </div>
  )
}

export function TitleBlock({
  model,
  className = 'text-center text-lg font-bold underline tracking-wide mb-1',
  scopeClassName = 'text-center text-xs font-semibold mb-5',
}: {
  model: FeeLetterModel
  className?: string
  scopeClassName?: string
}) {
  return (
    <>
      <h2 className={className}>{model.titleText}</h2>
      {model.termScopeLine ? (
        <p className={scopeClassName}>{model.termScopeLine}</p>
      ) : (
        <div className="mb-5" />
      )}
    </>
  )
}
