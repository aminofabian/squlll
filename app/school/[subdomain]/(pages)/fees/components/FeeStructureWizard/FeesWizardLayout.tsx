'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Shared shell for fee plan wizard steps */
export function FeesWizardSection({
    title,
    children,
    className,
    action,
    noPadding,
    'data-fee-print-hide': printHide,
}: {
    title: string
    children: ReactNode
    className?: string
    action?: ReactNode
    noPadding?: boolean
    'data-fee-print-hide'?: boolean
}) {
    return (
        <section
            data-fee-print-hide={printHide ? true : undefined}
            className={cn(
                'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm',
                printHide && 'print:hidden',
                className,
            )}
        >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/90 px-4 py-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {title}
                </h3>
                {action}
            </div>
            <div className={cn(!noPadding && 'p-4')}>{children}</div>
        </section>
    )
}

export function FeesAmountTable({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <div
            className={cn(
                'overflow-x-auto rounded-lg border border-slate-200',
                className,
            )}
        >
            <table className="w-full table-fixed text-sm">{children}</table>
        </div>
    )
}

export const feesTableHead =
    'border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500'

export const feesTableThFirst =
    'w-[38%] py-3 px-4 text-left'

export const feesTableThTerm =
    'py-3 px-3 text-right'

export const feesTableRowTotal =
    'border-b-2 border-emerald-200/80 bg-emerald-50/70'

export const feesTableCellLabel =
    'py-2.5 px-4 text-left text-sm font-medium text-slate-800'

export const feesTableCellAmount =
    'py-2.5 px-3 text-right text-sm tabular-nums'

export function FeesKesCell({
    amount,
    bold,
    muted,
}: {
    amount: number
    bold?: boolean
    muted?: boolean
}) {
    return (
        <span
            className={cn(
                'inline-flex items-baseline justify-end gap-1 w-full',
                bold && 'font-semibold text-slate-900',
                muted && 'text-slate-500',
                !bold && !muted && 'text-slate-700',
            )}
        >
            <span className="text-[10px] font-normal text-slate-400">KES</span>
            <span>{amount > 0 ? amount.toLocaleString() : '—'}</span>
        </span>
    )
}

export function FeesMetaGrid({
    items,
}: {
    items: { label: string; value: string }[]
}) {
    return (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item) => (
                <div key={item.label} className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        {item.label}
                    </dt>
                    <dd className="mt-0.5 truncate text-sm font-medium text-slate-800">
                        {item.value}
                    </dd>
                </div>
            ))}
        </dl>
    )
}
