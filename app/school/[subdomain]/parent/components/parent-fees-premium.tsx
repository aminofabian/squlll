'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Loader2,
  Receipt,
  RefreshCw,
  Search,
  Smartphone,
  Wallet,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  formatCurrency,
  formatFeeDate,
  formatParentPaymentStatus,
  formatPaymentMethodLabel,
  parentPaymentStatusBadgeClass,
  type ParentChildFeeOverview,
  type ParentFeeItem,
  type ParentFeePlanBreakdown,
  type ParentPaymentRecord,
  type ParentPaymentStatus,
} from '@/lib/parent/parentFees'

/* ─── Light compact layout tokens ─── */
export const feesPageCanvas =
  'mx-auto max-w-3xl space-y-2 px-3 py-3 text-slate-700 sm:px-4'

export const feesDocument =
  'overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.03]'

export const feesEyebrow =
  'text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500'

export const feesSectionNumber =
  'select-none font-mono text-[10px] tabular-nums text-slate-400'

export const feesSurface =
  'rounded-md border border-slate-200/80 bg-slate-50/90'

export const feesMuted = 'text-slate-500'

export const feesText = 'text-slate-800'

export const feesHeading = 'text-xs font-semibold text-slate-900'

/* ─── Data helpers ─── */
export function groupFeeItems(items: ParentFeeItem[]): ParentFeeItem[] {
  const map = new Map<string, ParentFeeItem>()
  for (const item of items) {
    const key = `${item.itemName ?? ''}::${item.bucketName}`
    const existing = map.get(key)
    if (existing) {
      existing.amount += item.amount
      existing.amountPaid += item.amountPaid
      existing.balance += item.balance
    } else {
      map.set(key, { ...item })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.balance - a.balance)
}

export function groupItemsByBucket(items: ParentFeeItem[]) {
  const buckets = new Map<string, ParentFeeItem[]>()
  for (const item of items) {
    const list = buckets.get(item.bucketName) ?? []
    list.push(item)
    buckets.set(item.bucketName, list)
  }
  return Array.from(buckets.entries())
    .map(([bucket, lines]) => ({
      bucket,
      lines,
      totalBilled: lines.reduce((s, l) => s + l.amount, 0),
      totalPaid: lines.reduce((s, l) => s + l.amountPaid, 0),
      totalDue: lines.reduce((s, l) => s + l.balance, 0),
    }))
    .sort((a, b) => b.totalDue - a.totalDue)
}

export function planProgress(plan: ParentFeePlanBreakdown): number {
  if (plan.totalBilled <= 0) return plan.totalPaid > 0 ? 100 : 0
  return Math.min(100, Math.round((plan.totalPaid / plan.totalBilled) * 100))
}

export function childInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/* ─── Primitives ─── */
export function FeesProgressRing({
  progress,
  size = 88,
  className,
}: {
  progress: number
  size?: number
  className?: string
}) {
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-emerald-500 transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-900">
        <span className="text-sm font-semibold tabular-nums leading-none">{progress}%</span>
      </div>
    </div>
  )
}

export function FeesSectionBlock({
  id,
  index,
  title,
  subtitle,
  children,
  defaultOpen = true,
  collapsible = false,
}: {
  id: string
  index: string
  title: string
  subtitle?: string
  children: ReactNode
  defaultOpen?: boolean
  collapsible?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section id={id} className="scroll-mt-4 border-t border-slate-100 first:border-t-0">
      <div className="flex items-center gap-2 px-3 py-2">
        <span className={feesSectionNumber}>{index}</span>
        <div className="min-w-0 flex-1">
          {collapsible ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <div className="min-w-0">
                <h3 className={feesHeading}>{title}</h3>
                {subtitle ? <p className={cn('truncate', feesMuted, 'text-[10px]')}>{subtitle}</p> : null}
              </div>
              {open ? (
                <ChevronUp className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              )}
            </button>
          ) : (
            <div className="min-w-0">
              <h3 className={feesHeading}>{title}</h3>
              {subtitle ? <p className={cn('truncate', feesMuted, 'text-[10px]')}>{subtitle}</p> : null}
            </div>
          )}
        </div>
      </div>
      {open ? <div className="px-3 pb-3">{children}</div> : null}
    </section>
  )
}

export function FeesLedgerCell({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'neutral' | 'paid' | 'due' | 'credit'
}) {
  return (
    <div className="border-l border-slate-200 bg-white px-2 py-1.5 first:border-l-0 sm:px-2.5">
      <p className="text-[9px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p
        className={cn(
          'mt-0.5 text-xs font-semibold tabular-nums',
          tone === 'paid' && 'text-emerald-700',
          tone === 'due' && 'text-amber-700',
          tone === 'credit' && 'text-emerald-700',
          tone === 'neutral' && 'text-slate-900',
        )}
      >
        {value}
      </p>
    </div>
  )
}

/* ─── Statement hero ─── */
export function FeesStatementHero({
  overview,
  childName,
  loading,
  onRefresh,
  onViewPaymentHistory,
  onRecordPayment,
  refreshing,
}: {
  overview: ParentChildFeeOverview | null
  childName?: string
  loading?: boolean
  onRefresh?: () => void
  onViewPaymentHistory?: () => void
  onRecordPayment?: () => void
  refreshing?: boolean
}) {
  if (!overview && !loading) return null

  const status = overview?.paymentStatus
  const progress =
    overview && overview.totalBilled > 0
      ? Math.min(100, Math.round((overview.totalPaid / overview.totalBilled) * 100))
      : 0
  const outstanding = overview?.outstanding ?? 0
  const cleared = outstanding <= 0 && (overview?.totalBilled ?? 0) > 0

  const showPayCta = outstanding > 0 && onRecordPayment

  return (
    <header
      id="fees-account"
      className="scroll-mt-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 px-3 py-3"
    >
      {loading && !overview ? (
        <div className="h-16 animate-pulse rounded-md bg-slate-200/80" />
      ) : overview ? (
        <>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className={cn('truncate text-xs font-medium', feesText)}>
                  {childName ?? 'Account'}
                </p>
                {status ? (
                  <span
                    className={cn(
                      'rounded px-1.5 py-0 text-[9px] font-medium',
                      parentPaymentStatusBadgeClass(status),
                    )}
                  >
                    {formatParentPaymentStatus(status)}
                  </span>
                ) : null}
              </div>
              <p
                className={cn(
                  'mt-0.5 text-xl font-semibold tabular-nums leading-tight',
                  cleared ? 'text-emerald-700' : 'text-amber-700',
                )}
              >
                {cleared ? 'Settled' : formatCurrency(outstanding)}
              </p>
            </div>
            {overview.totalBilled > 0 ? (
              <FeesProgressRing progress={progress} size={52} />
            ) : null}
            {onRefresh ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={loading || refreshing}
                className="h-7 w-7 shrink-0 p-0 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
              >
                <RefreshCw
                  className={cn('h-3.5 w-3.5', (loading || refreshing) && 'animate-spin')}
                />
                <span className="sr-only">Refresh</span>
              </Button>
            ) : null}
          </div>

          <div className="mt-2 grid grid-cols-4 gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200/80">
            <FeesLedgerCell label="Billed" value={formatCurrency(overview.totalBilled)} />
            <FeesLedgerCell label="Paid" value={formatCurrency(overview.totalPaid)} tone="paid" />
            <FeesLedgerCell
              label="Due"
              value={formatCurrency(overview.outstanding)}
              tone="due"
            />
            {overview.creditBalance > 0 ? (
              <FeesLedgerCell
                label="Credit"
                value={formatCurrency(overview.creditBalance)}
                tone="credit"
              />
            ) : (
              <FeesLedgerCell label="Done" value={`${progress}%`} tone="paid" />
            )}
          </div>

          {cleared && overview.totalBilled > 0 ? (
            <div className="mt-2 flex items-center gap-2 rounded-md border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-2 text-[11px] text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>All fees for this account are settled. Thank you.</span>
            </div>
          ) : null}

          {showPayCta ? (
            <>
              <FeesPayJourneyStrip className="mt-2" />
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="h-9 flex-1 gap-1.5 text-xs shadow-sm"
                  onClick={onRecordPayment}
                >
                  <Wallet className="h-3.5 w-3.5" />
                  Record payment
                </Button>
                {onViewPaymentHistory ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 shrink-0 px-3 text-xs"
                    onClick={onViewPaymentHistory}
                  >
                    History
                  </Button>
                ) : null}
              </div>
            </>
          ) : null}

          {overview.recentPayments.length > 0 ? (
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-200 pt-2">
              <ul className="min-w-0 flex-1 space-y-0.5">
                {overview.recentPayments.slice(0, 2).map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2 text-[11px]"
                  >
                    <span className="truncate font-mono text-slate-500">{p.receiptNumber}</span>
                    <span className="shrink-0 tabular-nums text-emerald-700">
                      {formatCurrency(Number(p.amount))}
                    </span>
                  </li>
                ))}
              </ul>
              {onViewPaymentHistory ? (
                <button
                  type="button"
                  onClick={onViewPaymentHistory}
                  className="shrink-0 text-[10px] font-medium text-primary hover:underline"
                >
                  All →
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </header>
  )
}

function FeesPayJourneyStrip({ className }: { className?: string }) {
  const steps = ['Pay school', 'Save code', 'Record here']
  return (
    <p
      className={cn(
        'flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5 rounded-md border border-slate-200/80 bg-white/80 px-2 py-1.5 text-center text-[9px] font-medium text-slate-600',
        className,
      )}
    >
      {steps.map((label, i) => (
        <span key={label} className="inline-flex items-center gap-1">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">
            {i + 1}
          </span>
          {label}
          {i < steps.length - 1 ? (
            <ArrowRight className="h-2.5 w-2.5 text-slate-300" aria-hidden />
          ) : null}
        </span>
      ))}
    </p>
  )
}

/** Household total when multiple children owe fees */
export function FeesHouseholdBanner({
  totalOutstanding,
  childCount,
}: {
  totalOutstanding: number
  childCount: number
}) {
  if (totalOutstanding <= 0 || childCount < 2) return null
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2">
      <p className="text-[11px] text-amber-950">
        <span className="font-semibold">Household due</span>
        <span className="text-amber-800"> · {childCount} children</span>
      </p>
      <p className="text-sm font-semibold tabular-nums text-amber-800">
        {formatCurrency(totalOutstanding)}
      </p>
    </div>
  )
}

/* ─── Child selector ─── */
export function FeesChildSelector({
  children,
  selectedIndex,
  onSelect,
  feeByStudentId,
}: {
  children: Array<{ studentId: string; name: string }>
  selectedIndex: number
  onSelect: (index: number) => void
  feeByStudentId: Map<string, { outstanding: number }>
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children.map((child, index) => {
        const active = selectedIndex === index
        const due = (feeByStudentId.get(child.studentId)?.outstanding ?? 0) > 0
        const outstanding = feeByStudentId.get(child.studentId)?.outstanding ?? 0

        return (
          <button
            key={child.studentId}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              'flex min-w-[120px] shrink-0 items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-colors',
              active
                ? 'border-primary/40 bg-primary/10 text-slate-900 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-semibold',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-slate-100 text-slate-600',
              )}
            >
              {childInitials(child.name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium">{child.name}</span>
              <span
                className={cn(
                  'text-[10px] tabular-nums',
                  active
                    ? due
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                    : due
                      ? 'text-amber-600'
                      : 'text-slate-500',
                )}
              >
                {due ? formatCurrency(outstanding) : 'Settled'}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ─── Structure row ─── */
export function FeesStructureRow({ plan }: { plan: ParentFeePlanBreakdown }) {
  const progress = planProgress(plan)
  const cleared = plan.arrears <= 0 && plan.totalBilled > 0

  return (
    <div className={cn(feesSurface, 'px-2.5 py-2')}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={cn('truncate text-xs font-medium', feesText)}>{plan.feeStructureName}</p>
          <p className={cn('truncate font-mono text-[10px]', feesMuted)}>
            {plan.termName} · {plan.academicYearName}
          </p>
        </div>
        <p
          className={cn(
            'shrink-0 text-xs font-semibold tabular-nums',
            cleared ? 'text-emerald-700' : 'text-amber-700',
          )}
        >
          {cleared ? '✓' : formatCurrency(plan.arrears)}
        </p>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className={cn('h-full rounded-full', cleared ? 'bg-emerald-500' : 'bg-amber-500')}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="w-8 text-right font-mono text-[10px] tabular-nums text-slate-500">
          {progress}%
        </span>
      </div>
    </div>
  )
}

/* ─── Bucket ledger ─── */
export function FeesBucketLedger({
  items,
  filter,
  onFilterChange,
  search,
  onSearchChange,
}: {
  items: ParentFeeItem[]
  filter: 'all' | 'due' | 'settled'
  onFilterChange: (f: 'all' | 'due' | 'settled') => void
  search: string
  onSearchChange: (s: string) => void
}) {
  const [expandedBuckets, setExpandedBuckets] = useState<Set<string>>(() => new Set())

  const buckets = useMemo(() => groupItemsByBucket(items), [items])

  const toggleBucket = (bucket: string) => {
    setExpandedBuckets((prev) => {
      const next = new Set(prev)
      if (next.has(bucket)) next.delete(bucket)
      else next.add(bucket)
      return next
    })
  }

  const filters = [
    { key: 'due' as const, label: 'Due' },
    { key: 'settled' as const, label: 'Settled' },
    { key: 'all' as const, label: 'All' },
  ]

  if (items.length === 0) {
    return (
      <p className={cn(feesSurface, 'py-6 text-center text-xs', feesMuted)}>
        No line items in this view.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilterChange(f.key)}
            className={cn(
              'rounded px-2 py-0.5 text-[10px] font-medium transition-colors',
              filter === f.key
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            {f.label}
          </button>
        ))}
        <div className="relative ml-auto min-w-[140px] flex-1">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search…"
            className="h-7 border-slate-200 bg-white pl-7 pr-7 text-[11px] text-slate-800 placeholder:text-slate-400"
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-1">
        {buckets.map((group) => {
          const open =
            expandedBuckets.has(group.bucket) ||
            buckets.length <= 3 ||
            group.totalDue > 0
          const hasDue = group.totalDue > 0

          return (
            <div key={group.bucket} className={cn(feesSurface, 'overflow-hidden')}>
              <button
                type="button"
                onClick={() => toggleBucket(group.bucket)}
                className="flex w-full items-center gap-2 px-2 py-1.5 text-left"
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold',
                    hasDue
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800',
                  )}
                >
                  {group.lines.length}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block truncate text-xs font-medium', feesText)}>
                    {group.bucket}
                  </span>
                </span>
                <span
                  className={cn(
                    'shrink-0 text-[11px] font-semibold tabular-nums',
                    hasDue ? 'text-amber-700' : 'text-emerald-700',
                  )}
                >
                  {hasDue ? formatCurrency(group.totalDue) : '—'}
                </span>
                {open ? (
                  <ChevronUp className="h-3 w-3 shrink-0 text-slate-600" />
                ) : (
                  <ChevronDown className="h-3 w-3 shrink-0 text-slate-600" />
                )}
              </button>
              {open ? (
                <ul className="border-t border-slate-200 bg-white">
                  {group.lines.map((line) => (
                    <li
                      key={`${line.itemName}-${line.bucketName}`}
                      className="flex items-center justify-between gap-2 border-b border-slate-100 px-2 py-1 text-[11px] last:border-0"
                    >
                      <span className="min-w-0 truncate text-slate-600">
                        {line.itemName ?? line.bucketName}
                      </span>
                      <span className="shrink-0 font-mono tabular-nums text-slate-500">
                        {line.balance > 0 ? (
                          <span className="text-amber-700">{formatCurrency(line.balance)}</span>
                        ) : (
                          <span className="text-emerald-600">✓</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Payment timeline ─── */
function PaymentMethodIcon({ method }: { method?: string | null }) {
  const n = (method ?? '').toUpperCase()
  if (n.includes('MPESA')) return <Smartphone className="h-4 w-4 text-emerald-600" />
  if (n.includes('BANK') || n.includes('CHEQUE')) return <Banknote className="h-4 w-4 text-slate-500" />
  return <Receipt className="h-4 w-4 text-primary" />
}

export function FeesPaymentTimeline({
  paymentsByMonth,
  downloadingId,
  onDownload,
  onCopy,
}: {
  paymentsByMonth: [string, ParentPaymentRecord[]][]
  downloadingId: string | null
  onDownload: (id: string, receipt: string) => void
  onCopy: (receipt: string) => void
}) {
  return (
    <div className="space-y-3">
      {paymentsByMonth.map(([month, monthPayments]) => {
        const monthTotal = monthPayments.reduce((s, p) => s + Number(p.amount), 0)
        return (
          <div key={month}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <h4 className={cn(feesHeading)}>{month}</h4>
              <span className="font-mono text-[10px] tabular-nums text-emerald-700">
                +{formatCurrency(monthTotal)}
              </span>
            </div>
            <ul className="space-y-1">
              {monthPayments.map((payment) => (
                <li
                  key={payment.id}
                  className={cn(feesSurface, 'flex flex-wrap items-center gap-2 px-2 py-1.5')}
                >
                  <PaymentMethodIcon method={payment.paymentMethod} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[11px] text-slate-800">
                      {payment.receiptNumber}
                    </p>
                    <p className={cn('text-[10px]', feesMuted)}>
                      {formatFeeDate(payment.paymentDate)} ·{' '}
                      {formatPaymentMethodLabel(payment.paymentMethod)}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-semibold tabular-nums text-emerald-700">
                    {formatCurrency(Number(payment.amount))}
                  </p>
                  <div className="flex w-full justify-end gap-0.5 border-t border-slate-100 pt-1 sm:w-auto sm:border-0 sm:pt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] text-slate-500 hover:text-slate-800"
                      onClick={() => onCopy(payment.receiptNumber)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] text-slate-500 hover:text-slate-800"
                      disabled={downloadingId === payment.id}
                      onClick={() => onDownload(payment.id, payment.receiptNumber)}
                    >
                      {downloadingId === payment.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Sticky TOC ─── */
const TOC_LINKS = [
  { id: 'fees-account', label: 'Summary' },
  { id: 'fees-structures', label: 'Structures' },
  { id: 'fees-ledger', label: 'Line items' },
  { id: 'fees-records', label: 'Payments' },
] as const

export function FeesCompactNav() {
  const [activeId, setActiveId] = useState<string>(TOC_LINKS[0].id)

  useEffect(() => {
    const elements = TOC_LINKS.map((l) => document.getElementById(l.id)).filter(
      Boolean,
    ) as HTMLElement[]
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.15, 0.4] },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <nav
      className="sticky top-0 z-10 -mx-1 flex gap-1 overflow-x-auto rounded-lg border border-slate-200/80 bg-white/95 px-1 py-1 backdrop-blur-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Jump to section"
    >
      {TOC_LINKS.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          className={cn(
            'shrink-0 rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors',
            activeId === link.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}

/** @deprecated Use FeesCompactNav */
export const FeesTableOfContents = FeesCompactNav

/* ─── Metric strip (below document) ─── */
export function FeesRecordsEmpty({
  onRecordPayment,
}: {
  onRecordPayment?: () => void
}) {
  return (
    <div className={cn(feesSurface, 'px-3 py-6 text-center')}>
      <Receipt className="mx-auto h-8 w-8 text-slate-300" />
      <p className="mt-2 text-xs font-medium text-slate-700">No payments yet</p>
      <p className={cn('mt-1 text-[10px]', feesMuted)}>
        After you pay via M-Pesa or bank, record it here so finance can confirm.
      </p>
      {onRecordPayment ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3 h-8 text-xs"
          onClick={onRecordPayment}
        >
          Record your first payment
        </Button>
      ) : null}
    </div>
  )
}

export function FeesStatusNote({
  status,
  onRecordPayment,
}: {
  status?: ParentPaymentStatus
  onRecordPayment?: () => void
}) {
  return (
    <div className={cn(feesSurface, 'space-y-2 px-2.5 py-2.5')}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        How recording works
      </p>
      <ul className="space-y-1.5 text-[10px] leading-relaxed text-slate-600">
        <li className="flex gap-2">
          <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
          Pay using school M-Pesa or bank details, then tap Record payment.
        </li>
        <li className="flex gap-2">
          <Banknote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
          Add your confirmation code and a photo of the slip when you can.
        </li>
        <li className="flex gap-2">
          <Receipt className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          Finance verifies and issues an official receipt number.
        </li>
      </ul>
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-2">
        {status ? (
          <span
            className={cn(
              'inline-flex rounded px-1.5 py-0.5 text-[9px] font-medium',
              parentPaymentStatusBadgeClass(status),
            )}
          >
            {formatParentPaymentStatus(status)}
          </span>
        ) : null}
        {onRecordPayment ? (
          <button
            type="button"
            onClick={onRecordPayment}
            className="text-[10px] font-medium text-primary hover:underline"
          >
            Record payment →
          </button>
        ) : null}
      </div>
    </div>
  )
}
