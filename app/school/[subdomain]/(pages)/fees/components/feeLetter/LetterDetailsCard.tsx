'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  PenLine,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FEES_BRAND, FEES_BTN, FEES_LAYOUT } from '../../lib/fees-ui'
import {
  copyPortalUrl,
  formatPortalUrlForDisplay,
} from '../../lib/feeLetter/schoolPortalUrl'
import type { LetterSchoolDetailsPayload } from '../../lib/feeLetter/letterSchoolDetails'
import { LetterSchoolDetailsSheet } from './LetterSchoolDetailsSheet'
import { GeneratedSchoolLogo } from '@/components/school/GeneratedSchoolLogo'

type LetterDetailsCardProps = {
  details: LetterSchoolDetailsPayload
  onChange: (next: LetterSchoolDetailsPayload) => void
  onSave?: (next: LetterSchoolDetailsPayload) => Promise<void>
  schoolLogoKey: string
  portalUrl: string
  loading?: boolean
  saving?: boolean
  error?: string | null
  variant?: 'default' | 'compact' | 'panel' | 'featured' | 'dense'
  className?: string
}

function paymentSummary(details: LetterSchoolDetailsPayload): string {
  const banks = details.paymentModes.bankAccounts.filter(
    (b) => b.bankName?.trim(),
  ).length
  const parts: string[] = []
  if (details.schoolDetails.principalName?.trim()) {
    parts.push(details.schoolDetails.principalName.trim())
  }
  if (details.schoolDetails.address?.trim()) {
    parts.push(details.schoolDetails.address.trim())
  }
  if (banks > 0) {
    parts.push(`${banks} bank${banks === 1 ? '' : 's'}`)
  }
  return parts.join(' · ') || 'Tap Edit to add school and payment details'
}

function LetterDetailsActionRow({
  portalUrl,
  copied,
  onCopy,
  onEdit,
  loading,
  editLabel,
  primary,
  compactActions,
}: {
  portalUrl: string
  copied: boolean
  onCopy: () => void
  onEdit: () => void
  loading: boolean
  editLabel: string
  primary: boolean
  compactActions?: boolean
}) {
  const showPortal = !!portalUrl

  return (
    <div
      className={cn(
        'flex w-full flex-row flex-nowrap items-center gap-1.5',
        compactActions && 'shrink-0',
      )}
    >
      <Button
        type="button"
        variant={primary ? 'default' : 'outline'}
        size="sm"
        className={cn(
          'h-8 min-w-0 shrink-0 text-xs',
          primary
            ? 'flex-1 px-3 text-white shadow-sm hover:opacity-90 sm:flex-none'
            : cn('flex-1 px-2 sm:flex-none', FEES_BTN.secondary),
        )}
        style={primary ? { backgroundColor: FEES_BRAND.primary } : undefined}
        onClick={onEdit}
        disabled={loading}
      >
        <PenLine className="mr-1 h-3 w-3 shrink-0" />
        {editLabel}
      </Button>
      {showPortal ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1 border-slate-200 bg-white px-2 text-[11px] text-slate-700"
            onClick={onCopy}
          >
            <Copy className="h-3 w-3 shrink-0" />
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 border-slate-200 bg-white text-slate-700"
            asChild
          >
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open parent portal"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </>
      ) : null}
    </div>
  )
}

export function LetterDetailsCard({
  details,
  onChange,
  onSave,
  schoolLogoKey,
  portalUrl,
  loading = false,
  saving = false,
  error = null,
  variant = 'default',
  className,
}: LetterDetailsCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const host = formatPortalUrlForDisplay(portalUrl)
  const compact = variant === 'compact'
  const panel = variant === 'panel'
  const featured = variant === 'featured'
  const dense = variant === 'dense'
  const schoolName = details.schoolDetails.name || 'School name'
  const meta = paymentSummary(details)
  const primaryActions = panel || featured || dense
  const editLabel = dense
    ? 'Edit'
    : compact && !featured
      ? 'Edit'
      : 'Edit details'

  const handleCopy = async () => {
    const ok = await copyPortalUrl(portalUrl)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const actionRow = (
    <LetterDetailsActionRow
      portalUrl={compact ? '' : portalUrl}
      copied={copied}
      onCopy={handleCopy}
      onEdit={() => setSheetOpen(true)}
      loading={loading}
      editLabel={editLabel}
      primary={primaryActions}
      compactActions={dense}
    />
  )

  const logoNode = (
    <div className="shrink-0">
      {details.logoUrl ? (
        <img
          src={details.logoUrl}
          alt=""
          className={cn(
            'rounded-lg object-contain ring-1 ring-slate-200/80',
            dense
              ? 'h-8 w-8'
              : panel || featured
                ? 'h-12 w-12'
                : compact
                  ? 'h-11 w-11'
                  : 'h-12 w-12',
          )}
        />
      ) : (
        <GeneratedSchoolLogo
          schoolKey={schoolLogoKey}
          className={
            dense
              ? 'w-8 aspect-[88/96]'
              : panel
                ? 'w-11 aspect-[88/96]'
                : compact
                  ? 'w-10 aspect-[88/96]'
                  : 'w-11 aspect-[88/96]'
          }
        />
      )}
    </div>
  )

  const textNode = (
    <div className="min-w-0 flex-1">
      <p
        className={cn(
          'font-semibold text-slate-900',
          FEES_LAYOUT.textWrap,
          dense
            ? 'text-xs'
            : panel || featured
              ? 'text-base'
              : compact
                ? 'text-sm'
                : 'text-base',
        )}
      >
        {loading ? 'Loading…' : schoolName}
      </p>
      {!dense ? (
        <p className={cn('mt-0.5 text-xs text-slate-500', FEES_LAYOUT.textWrap)}>
          {meta}
        </p>
      ) : null}
      {portalUrl && !compact && !dense ? (
        <p
          className={cn(
            'mt-1 flex min-w-0 items-center gap-1 text-[10px] text-slate-500',
          )}
        >
          <Globe
            className="h-3 w-3 shrink-0"
            style={{ color: FEES_BRAND.primary }}
            aria-hidden
          />
          <span className={cn('min-w-0 truncate font-mono', FEES_LAYOUT.textWrap)}>
            {host}
          </span>
        </p>
      ) : null}
      {(error || saving) && (
        <p
          className={cn(
            'mt-1 inline-flex items-center gap-1 text-xs',
            error ? 'text-rose-600' : 'text-slate-500',
          )}
        >
          {error ? (
            error
          ) : (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving…
            </>
          )}
        </p>
      )}
    </div>
  )

  return (
    <>
      <div
        className={cn(
          'relative rounded-xl bg-white',
          panel
            ? 'overflow-x-hidden ring-1 ring-slate-200/90 shadow-sm'
            : featured
              ? 'overflow-x-hidden shadow-sm ring-1 ring-emerald-200/70'
              : dense
                ? 'overflow-x-hidden ring-1 ring-slate-200/70'
                : 'ring-1 ring-slate-200/70',
          compact && !featured && !dense && 'p-2 ring-slate-200/60',
          !compact && !panel && !featured && !dense && 'overflow-x-hidden',
          className,
        )}
        style={featured ? { backgroundColor: '#fff' } : undefined}
      >
        {panel || featured ? (
          <div
            className="absolute inset-y-0 left-0 w-1 rounded-l-xl"
            style={{ backgroundColor: FEES_BRAND.primary }}
            aria-hidden
          />
        ) : null}

        {dense ? (
          <div
            className="relative flex flex-row items-center gap-2 px-2 py-1.5"
            style={{ backgroundColor: `${FEES_BRAND.primaryLight}55` }}
          >
            {logoNode}
            {textNode}
            {actionRow}
          </div>
        ) : (
          <div
            className={cn(
              'relative flex flex-col gap-2.5',
              panel && 'px-4 py-4 sm:px-5',
              featured && 'px-3 py-3 sm:px-4',
              compact && !panel && !featured && 'gap-2 p-0',
              !compact && !panel && !featured && 'px-4 py-3',
            )}
            style={
              featured
                ? {
                    background: `linear-gradient(105deg, ${FEES_BRAND.primaryLight} 0%, #fff 55%)`,
                  }
                : panel
                  ? {
                      background: `linear-gradient(105deg, ${FEES_BRAND.primary}08 0%, #fff 42%)`,
                    }
                  : !compact
                    ? {
                        background: `linear-gradient(135deg, ${FEES_BRAND.primary}10, ${FEES_BRAND.surface})`,
                      }
                    : undefined
            }
          >
            <div className="flex min-w-0 gap-3">
              {logoNode}
              {textNode}
            </div>
            {actionRow}
          </div>
        )}
      </div>

      <LetterSchoolDetailsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        value={details}
        onChange={onChange}
        onSave={onSave}
        saving={saving}
        schoolLogoKey={schoolLogoKey}
        portalUrl={portalUrl}
      />
    </>
  )
}
