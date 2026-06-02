'use client'

import Link from 'next/link'
import { useState, useMemo, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Edit, 
  Trash2, 
  Link2,
  Calendar,
  Coins,
  Building2,
  Eye,
} from 'lucide-react'
import { FeeStructure, FeeStructureForm } from '../../types'
import { ProcessedFeeStructure } from './types'
import { cn } from '@/lib/utils'
import { FeeStructureLetterPreview } from '../FeeStructureWizard/FeeStructureLetterPreview'
import { FeeLetterPreviewDialog } from '../feeLetter/FeeLetterPreviewDialog'
import {
  readFeeLetterTemplate,
  writeFeeLetterTemplate,
} from '../../lib/feeLetter/storage'
import type { FeeLetterTemplateId } from '../../lib/feeLetter/types'
import { DEFAULT_FEE_LETTER_TEMPLATE } from '../../lib/feeLetter/templates'
import { buildLetterTermScopeLabel } from '../../lib/feeLetter/termScopeLabel'
import { useParams } from 'next/navigation'
import { FeeTermsMatrixTable } from '../FeeTermsMatrixTable'
import { FEES_BRAND, FEES_BTN, FEES_DETAIL, FEES_LAYOUT } from '../../lib/fees-ui'
import { feesOverviewHref } from '../../lib/feesRoutes'
import { printFeeStructureLetter } from '../../lib/feesPrint'
import { getLayoutSchoolName } from '@/lib/schoolLogo'
import { useTenantFeeLetterSettings } from '../../hooks/useTenantFeeLetterSettings'
import { getSchoolPortalUrl } from '../../lib/feeLetter/schoolPortalUrl'
import { FeeLetterSetupPanel } from '../feeLetter/FeeLetterSetupPanel'
import { sortTermsForLetter } from '../../lib/sortTermsForLetter'
import { FeePlanSection } from './FeePlanSection'
import {
  feeLetterGradeStorageKey,
  termsShareSameCategories,
  termsShareSameTotals,
} from '../../lib/feePlanDetailUrl'
import { getInactivePlanDetail } from '../../lib/feePlanLifecycle'

interface FeeStructureCardProps {
  structure: ProcessedFeeStructure
  index?: number
  /** card = list; page = legacy embed; detail = full plan slug page */
  layout?: 'card' | 'page' | 'detail'
  /** On detail page: render only amounts or only letter block */
  detailPart?: 'amounts' | 'letter'
  hideHeader?: boolean
  /** Controlled term (detail page — shared with fee letter). */
  selectedTermId?: string
  onSelectedTermIdChange?: (termId: string) => void
  planSlug?: string
  letterPreviewOpen?: boolean
  onLetterPreviewOpenChange?: (open: boolean) => void
  onEdit: (feeStructure: FeeStructure) => void
  onAssignToGrade: (feeStructureId: string, name: string, academicYear?: string, academicYearId?: string, termId?: string) => void
  onGenerateInvoices: (feeStructureId: string, term: string) => void
  onDelete?: (id: string, name: string) => void
  onUpdateFeeItem: (itemId: string, amount: number, isMandatory: boolean, bucketName: string, feeStructureName: string, bucketId?: string) => void
  isDeleting?: boolean
  canManage?: boolean
}

function toLegacyFeeStructure(s: ProcessedFeeStructure): FeeStructure {
  return {
    id: s.structureId,
    name: s.structureName,
    isActive: s.isActive,
    academicYear: s.academicYear,
    grade: '',
    boardingType: 'day',
    createdDate: s.createdAt || '',
    lastModified: s.updatedAt || '',
    termStructures: [],
  }
}

function termTotalFromMap(
  termFeesMap: ProcessedFeeStructure['termFeesMap'],
  termId: string,
): number {
  const buckets = termFeesMap?.[termId]
  if (!buckets?.length) return 0
  return buckets.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
}

export const FeeStructureCard = ({
  structure,
  index,
  layout = 'card',
  detailPart,
  hideHeader = false,
  selectedTermId: selectedTermIdProp,
  onSelectedTermIdChange,
  planSlug,
  letterPreviewOpen: letterPreviewOpenProp,
  onLetterPreviewOpenChange,
  onEdit,
  onAssignToGrade,
  onDelete,
  isDeleting = false,
  canManage = true,
}: FeeStructureCardProps) => {
  const params = useParams()
  const subdomain = params.subdomain as string
  const [internalTermId, setInternalTermId] = useState(
    () => structure.termId || structure.terms?.[0]?.id || '',
  )
  const selectedTermId = selectedTermIdProp ?? internalTermId
  const setSelectedTermId = onSelectedTermIdChange ?? setInternalTermId
  const [showPDFPreviewInternal, setShowPDFPreviewInternal] = useState(false)
  const showPDFPreview = letterPreviewOpenProp ?? showPDFPreviewInternal
  const setShowPDFPreview = onLetterPreviewOpenChange ?? setShowPDFPreviewInternal
  const [letterTermIds, setLetterTermIds] = useState<string[]>([])
  const [previewGrade, setPreviewGrade] = useState('')
  const [letterTemplateId, setLetterTemplateId] = useState<FeeLetterTemplateId>(
    DEFAULT_FEE_LETTER_TEMPLATE,
  )
  const [gradesExpanded, setGradesExpanded] = useState(false)

  const letterTemplateScope = planSlug || subdomain || 'school'
  const sidebarSchoolName = getLayoutSchoolName(subdomain)
  const {
    details: letterDetails,
    setDetails: setLetterDetails,
    saveNow: saveLetterDetails,
    saving: letterDetailsSaving,
    loading: letterDetailsLoading,
    error: letterDetailsError,
  } = useTenantFeeLetterSettings(subdomain)
  const [schoolPortalUrl, setSchoolPortalUrl] = useState('')
  useEffect(() => {
    setSchoolPortalUrl(getSchoolPortalUrl())
  }, [])

  const schoolName = useMemo(() => {
    if (!subdomain) return "KANYAWANGA HIGH SCHOOL"
    return subdomain
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .replace(/\bSchool\b/i, '')
      .trim() + ' School'
  }, [subdomain])

  const sortedTerms = useMemo(() => {
    if (!structure.terms || structure.terms.length === 0) return []
    return sortTermsForLetter(structure.terms)
  }, [structure.terms])

  const displayBuckets = useMemo(() => {
    if (structure.termFeesMap && selectedTermId) {
      const buckets = structure.termFeesMap[selectedTermId]
      if (buckets && buckets.length > 0) return buckets
    }
    return structure.buckets || []
  }, [structure.termFeesMap, structure.buckets, selectedTermId])

  const termTotal = displayBuckets.reduce((sum: number, bucket: { totalAmount: number }) => sum + bucket.totalAmount, 0)

  const yearTotal = useMemo(() => {
    if (!structure.termFeesMap || Object.keys(structure.termFeesMap).length === 0) {
      return termTotal * Math.max(structure.terms.length, 1)
    }
    return Object.values(structure.termFeesMap).reduce((yearSum, termBuckets) => {
      const termSum = termBuckets.reduce((sum: number, bucket: { totalAmount: number }) => sum + bucket.totalAmount, 0)
      return yearSum + termSum
    }, 0)
  }, [structure.termFeesMap, structure.terms.length, termTotal])

  const gradeLabels = useMemo(() => {
    if (!structure.gradeLevels?.length) return []
    const labels = structure.gradeLevels.map(
      (grade) => grade.shortName || grade.gradeLevel?.name || grade.name || 'Grade',
    )
    return [...new Set(labels)]
  }, [structure.gradeLevels])

  useEffect(() => {
    if (gradeLabels.length === 0) {
      setPreviewGrade('')
      return
    }
    const storageKey = planSlug ? feeLetterGradeStorageKey(planSlug) : null
    const saved =
      storageKey && typeof window !== 'undefined'
        ? window.localStorage.getItem(storageKey)
        : null
    setPreviewGrade((prev) => {
      if (saved && gradeLabels.includes(saved)) return saved
      if (prev && gradeLabels.includes(prev)) return prev
      return gradeLabels[0]
    })
  }, [structure.structureId, gradeLabels, planSlug])

  useEffect(() => {
    if (!planSlug || !previewGrade) return
    try {
      window.localStorage.setItem(
        feeLetterGradeStorageKey(planSlug),
        previewGrade,
      )
    } catch {
      /* ignore quota */
    }
  }, [planSlug, previewGrade])

  useEffect(() => {
    setLetterTemplateId(readFeeLetterTemplate(letterTemplateScope))
  }, [letterTemplateScope])

  useEffect(() => {
    writeFeeLetterTemplate(letterTemplateScope, letterTemplateId)
  }, [letterTemplateScope, letterTemplateId])

  const configuredTermCount = useMemo(() => {
    if (!structure.termFeesMap) return 0
    return sortedTerms.filter((t) => termTotalFromMap(structure.termFeesMap, t.id) > 0).length
  }, [sortedTerms, structure.termFeesMap])

  const termTotals = useMemo(
    () =>
      sortedTerms.map((t) => ({
        id: t.id,
        name: t.name,
        total: termTotalFromMap(structure.termFeesMap, t.id),
      })),
    [sortedTerms, structure.termFeesMap],
  )

  const termIds = useMemo(() => sortedTerms.map((t) => t.id), [sortedTerms])

  const allTermsSameAmount = useMemo(
    () => termsShareSameTotals(structure, termIds),
    [structure, termIds],
  )

  const allTermsSameCategories = useMemo(
    () => termsShareSameCategories(structure, termIds),
    [structure, termIds],
  )

  const isDetailLayout = layout === 'detail'
  const isPageLayout = layout === 'page'
  const collapseTermTabs =
    isDetailLayout &&
    allTermsSameAmount &&
    allTermsSameCategories &&
    (termTotals[0]?.total ?? 0) > 0 &&
    termTotals.every((t) => t.total > 0)

  const convertToPDFForm = useMemo((): FeeStructureForm => {
    const termsToUse = sortedTerms.length > 0 ? sortedTerms : (structure.terms || [])
    const termStructures = termsToUse.map((term) => {
      const termBuckets = structure.termFeesMap?.[term.id] || structure.buckets || []
      return {
        term: term.name as 'Term 1' | 'Term 2' | 'Term 3',
        academicYear: structure.academicYear,
        dueDate: '',
        latePaymentFee: '',
        earlyPaymentDiscount: '',
        earlyPaymentDeadline: '',
        buckets: termBuckets.map(bucket => ({
          id: bucket.feeBucketId,
          type: 'tuition' as const,
          name: bucket.name,
          description: '',
          isOptional: bucket.isOptional,
          components: [{
            name: bucket.name,
            description: '',
            amount: bucket.totalAmount.toString(),
            category: 'fee'
          }]
        })),
        existingBucketAmounts: {}
      }
    })
    return {
      name: structure.structureName,
      grade: '',
      boardingType: 'both',
      academicYear: structure.academicYear,
      academicYearId: structure.academicYearId,
      termStructures: termStructures.length > 0 ? termStructures : [{
        term: structure.termName as 'Term 1' | 'Term 2' | 'Term 3',
        academicYear: structure.academicYear,
        dueDate: '',
        latePaymentFee: '',
        earlyPaymentDiscount: '',
        earlyPaymentDeadline: '',
        buckets: (structure.buckets || []).map(bucket => ({
          id: bucket.feeBucketId,
          type: 'tuition' as const,
          name: bucket.name,
          description: '',
          isOptional: bucket.isOptional,
          components: [{
            name: bucket.name,
            description: '',
            amount: bucket.totalAmount.toString(),
            category: 'fee'
          }]
        })),
        existingBucketAmounts: {}
      }]
    }
  }, [structure, sortedTerms])

  useEffect(() => {
    if (sortedTerms.length === 0) {
      setLetterTermIds([])
      return
    }
    setLetterTermIds((prev) => {
      const valid = prev.filter((id) => sortedTerms.some((t) => t.id === id))
      if (valid.length > 0) return valid
      return sortedTerms.map((t) => t.id)
    })
  }, [structure.structureId, sortedTerms])

  const selectedLetterTermIds = useMemo(() => {
    const valid = letterTermIds.filter((id) =>
      sortedTerms.some((t) => t.id === id),
    )
    return valid.length > 0 ? valid : sortedTerms.map((t) => t.id)
  }, [letterTermIds, sortedTerms])

  const pdfFormForLetter = useMemo((): FeeStructureForm => {
    const ids = new Set(selectedLetterTermIds)
    const letterGrade =
      previewGrade || gradeLabels[0] || convertToPDFForm.grade || ''
    const byTermName = new Map(
      convertToPDFForm.termStructures.map((ts) => [ts.term, ts]),
    )
    const termStructures = sortedTerms
      .filter((t) => ids.has(t.id))
      .map((t) => byTermName.get(t.name))
      .filter((ts): ts is NonNullable<typeof ts> => Boolean(ts))
    return {
      ...convertToPDFForm,
      grade: letterGrade,
      schoolDetails: letterDetails.schoolDetails,
      paymentModes: letterDetails.paymentModes,
      termStructures:
        termStructures.length > 0
          ? termStructures
          : convertToPDFForm.termStructures,
    }
  }, [
    convertToPDFForm,
    selectedLetterTermIds,
    sortedTerms,
    previewGrade,
    gradeLabels,
    letterDetails,
  ])

  const gradeLevelsForLetter = useMemo(() => {
    const letterGrade =
      previewGrade || gradeLabels[0] || ''
    if (!letterGrade) return structure.gradeLevels || []
    return [{ id: letterGrade, gradeLevel: { name: letterGrade } }]
  }, [previewGrade, gradeLabels, structure.gradeLevels])

  const { termScopeLine, totalRowLabel } = useMemo(() => {
    const names = sortedTerms
      .filter((t) => selectedLetterTermIds.includes(t.id))
      .map((t) => t.name)
    if (names.length === 0) {
      return { termScopeLine: undefined, totalRowLabel: undefined }
    }
    if (names.length === sortedTerms.length) {
      return {
        termScopeLine: 'ALL TERMS',
        totalRowLabel: undefined,
      }
    }
    if (names.length === 1) {
      return {
        termScopeLine: names[0].toUpperCase(),
        totalRowLabel: 'TOTAL',
      }
    }
    return {
      termScopeLine: names.map((n) => n.toUpperCase()).join(' · '),
      totalRowLabel: 'TOTAL (SELECTED TERMS)',
    }
  }, [sortedTerms, selectedLetterTermIds])

  const pdfPrintRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = () => {
    printFeeStructureLetter(pdfPrintRef.current)
  }

  const letterBuckets = useMemo(() => {
    const ids = selectedLetterTermIds
    if (ids.length === 1 && structure.termFeesMap?.[ids[0]]?.length) {
      return structure.termFeesMap[ids[0]]
    }
    if (ids.length > 1 && structure.termFeesMap) {
      const firstWithBuckets = ids.find(
        (id) => (structure.termFeesMap?.[id]?.length ?? 0) > 0,
      )
      if (firstWithBuckets) {
        return structure.termFeesMap![firstWithBuckets]
      }
    }
    return displayBuckets
  }, [selectedLetterTermIds, structure.termFeesMap, displayBuckets])

  const letterTermsHaveAmounts = useMemo(() => {
    if (!structure.termFeesMap || selectedLetterTermIds.length === 0) {
      return termTotal > 0 && displayBuckets.length > 0
    }
    return selectedLetterTermIds.every((id) => {
      const buckets = structure.termFeesMap?.[id]
      if (!buckets?.length) return false
      return buckets.reduce((sum, b) => sum + (b.totalAmount || 0), 0) > 0
    })
  }, [
    structure.termFeesMap,
    selectedLetterTermIds,
    termTotal,
    displayBuckets.length,
  ])

  const letterTermLabel = useMemo(
    () => buildLetterTermScopeLabel(sortedTerms, selectedLetterTermIds),
    [sortedTerms, selectedLetterTermIds],
  )

  const letterPreviewMeta = useMemo(
    () => ({
      grade: previewGrade || null,
      academicYear: structure.academicYear || null,
      terms: letterTermLabel,
    }),
    [previewGrade, structure.academicYear, letterTermLabel],
  )

  const letterAmountsReady = letterTermsHaveAmounts && !!previewGrade

  const mapBucketsForLetter = (buckets: typeof displayBuckets) =>
    buckets.map((b) => ({
      id: b.feeBucketId,
      name: b.name,
      description: "",
    }))

  const letterReadinessMessage = !letterAmountsReady
    ? !previewGrade
      ? 'Select a grade to preview the letter.'
      : !letterTermsHaveAmounts
        ? `Add fee amounts for the selected term${selectedLetterTermIds.length > 1 ? 's' : ''} before generating a letter.`
        : 'No fee categories to show on the letter.'
    : null

  const letterSetupPanelBase = {
    grades: gradeLabels,
    previewGrade,
    onGradeChange: setPreviewGrade,
    terms: sortedTerms,
    selectedTermIds: selectedLetterTermIds,
    onTermIdsChange: setLetterTermIds,
    templateId: letterTemplateId,
    onTemplateChange: setLetterTemplateId,
    letterDetails,
    onLetterDetailsChange: setLetterDetails,
    onSaveLetterDetails: saveLetterDetails,
    letterDetailsSaving,
    letterDetailsLoading,
    letterDetailsError,
    schoolLogoKey: sidebarSchoolName,
    portalUrl: schoolPortalUrl,
    letterAmountsReady,
    onPreview: () => setShowPDFPreview(true),
    onPrint: handleDownloadPDF,
    termScopeHint:
      isDetailLayout && letterTermLabel ? letterTermLabel : null,
    readinessMessage: letterReadinessMessage,
    compact: true as const,
  }

  const letterPreviewControls = (
    <FeeLetterSetupPanel
      {...letterSetupPanelBase}
      pinActions={isDetailLayout}
    />
  )

  const letterPreviewDialogControls = (
    <FeeLetterSetupPanel
      {...letterSetupPanelBase}
      embeddedInPreview
      pinActions={false}
    />
  )

  const openEditPlan = onEdit
    ? () => onEdit(toLegacyFeeStructure(structure))
    : undefined

  const feeByTermMatrix = (
    <>
      <FeeTermsMatrixTable
        terms={sortedTerms}
        termFeesMap={structure.termFeesMap}
        fallbackBuckets={structure.buckets}
        yearTotal={yearTotal}
        uniformAcrossTerms={collapseTermTabs}
        onEditPlan={canManage && structure.isActive ? openEditPlan : undefined}
      />
    </>
  )

  const pdfDialog = (
    <>
      <div
        className="pointer-events-none fixed left-[-9999px] top-0 w-[210mm] opacity-0"
        aria-hidden
      >
        <FeeStructureLetterPreview
          containerRef={pdfPrintRef}
          formData={pdfFormForLetter}
          schoolName={schoolName}
          feeBuckets={mapBucketsForLetter(letterBuckets)}
          gradeLevels={gradeLevelsForLetter}
          termScopeLine={termScopeLine}
          totalRowLabel={totalRowLabel}
          templateId={letterTemplateId}
          schoolLogoKey={sidebarSchoolName}
          logoUrl={letterDetails.logoUrl}
          schoolMotto={letterDetails.schoolMotto}
          schoolWebsiteUrl={schoolPortalUrl}
        />
      </div>

      <FeeLetterPreviewDialog
        open={showPDFPreview}
        onOpenChange={setShowPDFPreview}
        meta={letterPreviewMeta}
        onPrint={handleDownloadPDF}
        headerActions={letterPreviewDialogControls}
      >
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-slate-300/40">
            <FeeStructureLetterPreview
              formData={pdfFormForLetter}
              schoolName={schoolName}
              feeBuckets={mapBucketsForLetter(letterBuckets)}
              gradeLevels={gradeLevelsForLetter}
              termScopeLine={termScopeLine}
              totalRowLabel={totalRowLabel}
              templateId={letterTemplateId}
              schoolLogoKey={sidebarSchoolName}
              logoUrl={letterDetails.logoUrl}
              schoolMotto={letterDetails.schoolMotto}
              schoolWebsiteUrl={schoolPortalUrl}
            />
          </div>
        </div>
      </FeeLetterPreviewDialog>
    </>
  )

  if (isDetailLayout && detailPart === 'amounts') {
    return (
      <FeePlanSection
        id="term-amounts"
        lead
        compact
        hideStep
        title="Amounts by term"
        description={
          sortedTerms.length > 0
            ? collapseTermTabs
              ? 'Same fees every term · use Edit amounts to change'
              : `${sortedTerms.length} term${sortedTerms.length === 1 ? '' : 's'} · ${structure.buckets?.length ?? 0} categories`
            : 'Add term amounts in Edit plan'
        }
        action={
          canManage && structure.isActive && openEditPlan ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={cn(FEES_BTN.secondary, "h-9 gap-1.5 text-xs max-md:rounded-xl")}
              onClick={openEditPlan}
              disabled={isDeleting}
            >
              <Edit className="h-3.5 w-3.5 shrink-0" />
              Edit
            </Button>
          ) : undefined
        }
      >
        {feeByTermMatrix}
      </FeePlanSection>
    )
  }

  if (isDetailLayout && detailPart === 'letter') {
    return (
      <>
        <FeePlanSection
          id="fee-letter"
          compact
          hideStep
          title="Parent letter"
          description="PDF for parents — letterhead, grade, terms, then preview"
        >
          {gradeLabels.length === 0 ? (
            <p className="text-xs text-amber-800">Link classes first.</p>
          ) : (
            letterPreviewControls
          )}
        </FeePlanSection>
        {pdfDialog}
      </>
    )
  }

  if (isDetailLayout) {
    return (
      <>
        <FeePlanSection id="term-amounts" lead compact hideStep title="Amounts by term">
          {feeByTermMatrix}
        </FeePlanSection>
        <FeePlanSection id="fee-letter" compact hideStep title="Parent letter">
          {gradeLabels.length === 0 ? (
            <p className="text-xs text-amber-800">Link classes first.</p>
          ) : (
            letterPreviewControls
          )}
        </FeePlanSection>
        {pdfDialog}
      </>
    )
  }

  return (
    <Card className={cn(
      "overflow-hidden bg-white",
      isPageLayout
        ? "rounded-2xl border border-slate-200/80 shadow-sm"
        : "rounded-2xl border border-slate-200/90 shadow-sm transition-shadow hover:shadow-md",
      !structure.isActive && "opacity-80",
    )}>
      {!hideHeader && (
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {index !== undefined && (
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: FEES_BRAND.primary }}
                >
                  {index}
                </span>
              )}
              <CardTitle className="break-words text-base font-semibold text-slate-900 sm:text-lg">
                {structure.structureName}
              </CardTitle>
              {structure.isActive ? (
                <Badge className="bg-emerald-600 text-[10px] text-white">Active</Badge>
              ) : (
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-[10px] text-slate-500">
                  Inactive
                </Badge>
              )}
            </div>
            {!structure.isActive ? (
              <p className="mb-2 text-[11px] text-slate-500">
                {getInactivePlanDetail(structure)}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 font-medium">
                <Calendar className="h-3.5 w-3.5" style={{ color: FEES_BRAND.primary }} />
                {structure.academicYear}
              </span>
              {sortedTerms.length > 0 && (
                <span className="text-slate-500">
                  {configuredTermCount}/{sortedTerms.length} terms configured
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            {canManage ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title={structure.isActive ? "Edit fee plan" : "Inactive plans cannot be edited"}
              disabled={!structure.isActive}
              onClick={() => onEdit({
                id: structure.structureId,
                name: structure.structureName,
                isActive: structure.isActive,
                academicYear: structure.academicYear,
                grade: '',
                boardingType: 'day',
                createdDate: '',
                lastModified: '',
                termStructures: []
              })}
            >
              <Edit className="h-4 w-4" />
            </Button>
            ) : null}
            {onDelete && canManage ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                onClick={() => onDelete(structure.structureId, structure.structureName)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>

        {gradeLabels.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {gradeLabels.length === 1
                ? "1 grade covered"
                : `All ${gradeLabels.length} grades covered`}
            </p>
            <div
              className={cn(
                "flex flex-wrap gap-1.5",
                !gradesExpanded && gradeLabels.length > 8 && "max-h-[4.5rem] overflow-hidden",
              )}
            >
              {gradeLabels.map((label) => (
                <Badge
                  key={label}
                  variant="outline"
                  className="border-slate-200 bg-white text-[11px] font-medium text-slate-700"
                >
                  {label}
                </Badge>
              ))}
            </div>
            {gradeLabels.length > 8 && (
              <button
                type="button"
                className="mt-1.5 text-xs font-medium text-emerald-700 hover:underline"
                onClick={() => setGradesExpanded((v) => !v)}
              >
                {gradesExpanded ? "Show fewer" : `Show all ${gradeLabels.length} grades`}
              </button>
            )}
          </div>
        )}
      </CardHeader>
      )}

      <CardContent className={cn(
        "space-y-3 px-4 sm:px-5",
        hideHeader ? "py-3" : "py-3",
      )}>
        {feeByTermMatrix}

        {!hideHeader && (
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
            <Button
              size="sm"
              className="flex-1 text-white"
              style={{ backgroundColor: FEES_BRAND.primary }}
              onClick={() => onAssignToGrade(
                structure.structureId,
                structure.structureName,
                structure.academicYear,
                structure.academicYearId,
                selectedTermId,
              )}
            >
              <Link2 className="mr-2 h-4 w-4" />
              Link plan to classes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="sm:w-auto"
              onClick={() => setShowPDFPreview(true)}
              title="Preview printable fee structure"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview PDF
            </Button>
          </div>
        )}
        {!hideHeader && (
          <p className="text-[11px] leading-snug text-slate-500">
            To bill students, use{" "}
            <strong className="font-medium text-slate-700">Send term invoices</strong>{" "}
            on the{" "}
            <Link
              href={feesOverviewHref()}
              scroll={false}
              className="font-medium text-primary underline underline-offset-2"
            >
              Overview
            </Link>{" "}
            tab after classes are linked.
          </p>
        )}
        {hideHeader && !isDetailLayout && (
          <div className="flex border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPDFPreview(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview fee letter
            </Button>
          </div>
        )}
      </CardContent>

      {pdfDialog}
    </Card>
  )
}
