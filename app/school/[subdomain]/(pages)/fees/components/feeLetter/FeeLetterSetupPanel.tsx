'use client'

import { Button } from '@/components/ui/button'
import { Download, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FeeLetterPinnedBar } from '../FeeLetterPinnedBar'
import { FEES_BRAND, FEES_BTN, FEES_LAYOUT, FEES_MOBILE } from '../../lib/fees-ui'
import { LetterTemplateSelector } from './LetterTemplateSelector'
import { FeeLetterSetupHero } from './FeeLetterSetupHero'
import { FeeLetterContentPlanner } from './FeeLetterContentPlanner'
import { LetterIdentityPanel } from './LetterIdentityPanel'
import { LetterGradeSelector } from '../FeeStructureWizard/LetterGradeSelector'
import { LetterTermSelector } from '../FeeStructureWizard/LetterTermSelector'
import type { LetterSchoolDetailsPayload } from '../../lib/feeLetter/letterSchoolDetails'
import { FEE_LETTER_TEMPLATES } from '../../lib/feeLetter/templates'
import type { FeeLetterTemplateId } from '../../lib/feeLetter/types'
import { FeeLetterPreviewSettingsDrawer } from './FeeLetterPreviewSettingsDrawer'

function buildLetterSettingsSummary(
  previewGrade: string,
  terms: Array<{ id: string; name: string }>,
  selectedTermIds: string[],
  templateId: FeeLetterTemplateId,
): string | null {
  const parts: string[] = []
  if (previewGrade) parts.push(previewGrade)
  const selectedTerms = terms.filter((t) => selectedTermIds.includes(t.id))
  if (selectedTerms.length > 0) {
    parts.push(
      selectedTerms.length === terms.length
        ? 'All terms'
        : selectedTerms.map((t) => t.name).join(', '),
    )
  }
  const template = FEE_LETTER_TEMPLATES.find((t) => t.id === templateId)
  if (template) parts.push(template.label)
  return parts.length > 0 ? parts.join(' · ') : null
}

type FeeLetterSetupPanelProps = {
  grades: string[]
  previewGrade: string
  onGradeChange: (grade: string) => void
  terms: Array<{ id: string; name: string }>
  selectedTermIds: string[]
  onTermIdsChange: (ids: string[]) => void
  templateId: FeeLetterTemplateId
  onTemplateChange: (id: FeeLetterTemplateId) => void
  letterDetails: LetterSchoolDetailsPayload
  onLetterDetailsChange: (next: LetterSchoolDetailsPayload) => void
  onSaveLetterDetails?: (next: LetterSchoolDetailsPayload) => Promise<void>
  letterDetailsSaving?: boolean
  letterDetailsLoading?: boolean
  letterDetailsError?: string | null
  schoolLogoKey: string
  portalUrl: string
  letterAmountsReady: boolean
  onPreview: () => void
  onPrint: () => void
  termScopeHint?: string | null
  readinessMessage?: string | null
  className?: string
  compact?: boolean
  /** Pin Preview / Print to the viewport bottom (plan detail). */
  pinActions?: boolean
  /** Inside preview dialog — hide Preview/Print (header has Download). */
  embeddedInPreview?: boolean
}

function FieldLabel({
  children,
  dense,
}: {
  children: React.ReactNode
  dense?: boolean
}) {
  return (
    <p
      className={cn(
        'font-semibold uppercase text-slate-400',
        dense
          ? 'text-[9px] tracking-wide'
          : 'text-[10px] tracking-wide text-slate-500',
      )}
    >
      {children}
    </p>
  )
}

export function FeeLetterSetupPanel({
  grades,
  previewGrade,
  onGradeChange,
  terms,
  selectedTermIds,
  onTermIdsChange,
  templateId,
  onTemplateChange,
  letterDetails,
  onLetterDetailsChange,
  onSaveLetterDetails,
  letterDetailsSaving,
  letterDetailsLoading,
  letterDetailsError,
  schoolLogoKey,
  portalUrl,
  letterAmountsReady,
  onPreview,
  onPrint,
  termScopeHint,
  readinessMessage,
  className,
  compact = false,
  pinActions = false,
  embeddedInPreview = false,
}: FeeLetterSetupPanelProps) {
  const scopeLabel =
    termScopeHint ||
    (previewGrade ? `${previewGrade}` : 'Pick grade & terms')

  const actionBar = (
    <div
      className={cn(
        'flex items-center gap-2 py-2.5',
        pinActions ? 'py-2' : 'px-2 sm:px-2.5',
      )}
    >
      <p
        className={cn(
          'hidden min-w-0 flex-1 text-[11px] text-slate-500 min-[400px]:block',
          FEES_LAYOUT.textWrap,
        )}
      >
        {readinessMessage ? (
          <span className="font-medium text-amber-800">{readinessMessage}</span>
        ) : (
          <span className="font-medium text-slate-700">{scopeLabel}</span>
        )}
      </p>
      <div className="grid w-full grid-cols-2 gap-2 min-[400px]:ml-auto min-[400px]:w-auto min-[400px]:flex min-[400px]:shrink-0">
        <Button
          type="button"
          size="sm"
          className={cn(
            FEES_BTN.primary,
            'h-11 gap-1.5 text-xs shadow-md min-[400px]:h-9',
          )}
          onClick={onPreview}
          disabled={!letterAmountsReady}
        >
          <Eye className="h-4 w-4 shrink-0" />
          Preview
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            FEES_BTN.secondary,
            'h-11 gap-1.5 border-slate-300 bg-white text-xs shadow-sm min-[400px]:h-9',
          )}
          onClick={onPrint}
          disabled={!letterAmountsReady}
        >
          <Download className="h-4 w-4 shrink-0" />
          Print
        </Button>
      </div>
    </div>
  )

  const showActionBar = !pinActions && !embeddedInPreview

  if (compact && embeddedInPreview) {
    const summary = buildLetterSettingsSummary(
      previewGrade,
      terms,
      selectedTermIds,
      templateId,
    )

    return (
      <FeeLetterPreviewSettingsDrawer
        className={className}
        summary={summary}
        readinessMessage={readinessMessage}
      >
        <div className="max-w-full space-y-3">
          <div
            className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/80"
            style={{ backgroundColor: `${FEES_BRAND.primaryLight}40` }}
          >
            <div className="px-3 py-3">
              <LetterIdentityPanel
                compact
                details={letterDetails}
                onChange={onLetterDetailsChange}
                onSave={onSaveLetterDetails}
                saving={letterDetailsSaving}
                loading={letterDetailsLoading}
                error={letterDetailsError}
                schoolLogoKey={schoolLogoKey}
                portalUrl={portalUrl}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200/80 sm:grid-cols-2">
            <div className="min-w-0 space-y-1">
              <FieldLabel>Grade on letter</FieldLabel>
              <LetterGradeSelector
                grades={grades}
                value={previewGrade}
                onChange={onGradeChange}
                variant="compact"
                showHelper
              />
            </div>
            {terms.length > 0 ? (
              <div className="min-w-0 space-y-1">
                <FieldLabel>Terms to print</FieldLabel>
                <LetterTermSelector
                  terms={terms}
                  selectedIds={selectedTermIds}
                  onChange={onTermIdsChange}
                  variant="compact"
                  showHelper={false}
                />
              </div>
            ) : null}
          </div>

          <div className="rounded-xl bg-slate-50/90 p-3 ring-1 ring-slate-200/70">
            <LetterTemplateSelector
              value={templateId}
              onChange={onTemplateChange}
              minimal
            />
          </div>
        </div>
      </FeeLetterPreviewSettingsDrawer>
    )
  }

  if (compact) {
    return (
      <>
        <div
          className={cn(
            FEES_MOBILE.card,
            'md:rounded-lg md:ring-1 md:ring-slate-200/80',
            pinActions &&
              'mb-0 max-md:!rounded-none max-md:!bg-transparent max-md:!shadow-none max-md:!ring-0',
            className,
          )}
        >
        <div
          className={cn(
            "border-b border-slate-100 px-4 py-3 sm:px-4",
            pinActions && "max-md:px-0 max-md:pt-0",
          )}
          style={{ backgroundColor: `${FEES_BRAND.primaryLight}40` }}
        >
          <LetterIdentityPanel
            compact
            details={letterDetails}
            onChange={onLetterDetailsChange}
            onSave={onSaveLetterDetails}
            saving={letterDetailsSaving}
            loading={letterDetailsLoading}
            error={letterDetailsError}
            schoolLogoKey={schoolLogoKey}
            portalUrl={portalUrl}
          />
        </div>

        <div className="divide-y divide-slate-100 bg-white max-md:px-0 md:grid md:grid-cols-2 md:gap-2 md:divide-y-0 md:border-b md:border-slate-100 md:p-2.5">
          <div className="min-w-0 space-y-1.5 py-3.5 md:space-y-0.5 md:py-0">
            <FieldLabel>Grade on letter</FieldLabel>
            <LetterGradeSelector
              grades={grades}
              value={previewGrade}
              onChange={onGradeChange}
              variant="compact"
              showHelper
            />
          </div>
          {terms.length > 0 ? (
            <div className="min-w-0 space-y-1.5 py-3.5 md:space-y-0.5 md:py-0">
              <FieldLabel>Terms to print</FieldLabel>
              <LetterTermSelector
                terms={terms}
                selectedIds={selectedTermIds}
                onChange={onTermIdsChange}
                variant="compact"
                showHelper
              />
            </div>
          ) : null}
        </div>

        <div className="bg-slate-50/90 px-4 py-3.5 max-md:px-0 md:px-2.5 md:py-2">
          <LetterTemplateSelector
            value={templateId}
            onChange={onTemplateChange}
            minimal
          />
        </div>

        {showActionBar ? (
          <div className="border-t border-slate-100">{actionBar}</div>
        ) : null}
      </div>

      {pinActions ? <FeeLetterPinnedBar>{actionBar}</FeeLetterPinnedBar> : null}
      </>
    )
  }

  return (
    <>
    <div
      className={cn(
        'fee-letter-setup-panel overflow-hidden rounded-2xl bg-slate-100/40 ring-1 ring-slate-200/60',
        className,
      )}
    >
      <FeeLetterSetupHero />

      <div className="space-y-4 px-4 pb-4 sm:space-y-5 sm:px-5 sm:pb-5">
        <FeeLetterContentPlanner
          grades={grades}
          previewGrade={previewGrade}
          onGradeChange={onGradeChange}
          terms={terms}
          selectedTermIds={selectedTermIds}
          onTermIdsChange={onTermIdsChange}
          termScopeHint={termScopeHint}
        />

        <LetterIdentityPanel
          details={letterDetails}
          onChange={onLetterDetailsChange}
          onSave={onSaveLetterDetails}
          saving={letterDetailsSaving}
          loading={letterDetailsLoading}
          error={letterDetailsError}
          schoolLogoKey={schoolLogoKey}
          portalUrl={portalUrl}
        />

        <section className="fee-letter-style-section overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3 sm:px-5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: FEES_BRAND.primaryDark }}
            >
              <span className="text-[10px] font-bold">3</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Letter style
              </p>
              <p className="text-xs text-slate-600">Layout for print and PDF</p>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <LetterTemplateSelector
              value={templateId}
              onChange={onTemplateChange}
              compact
            />
          </div>
        </section>
      </div>

      {showActionBar ? (
        <div
          className="border-t border-slate-200/80"
          style={{
            background: `linear-gradient(180deg, #fff 0%, ${FEES_BRAND.surface} 100%)`,
          }}
        >
          {actionBar}
        </div>
      ) : null}
    </div>
    {pinActions && !embeddedInPreview ? (
      <FeeLetterPinnedBar>{actionBar}</FeeLetterPinnedBar>
    ) : null}
    </>
  )
}
