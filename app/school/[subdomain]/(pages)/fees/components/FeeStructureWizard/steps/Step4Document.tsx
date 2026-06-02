'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { FeesWizardSection } from '../FeesWizardLayout'
import { FeeStructureLetterPreview } from '../FeeStructureLetterPreview'
import {
    buildPdfFormFromWizard,
    sortWizardTerms,
    type FeeWizardFormData,
} from '../../../lib/feesWizardPdfForm'
import { FeeLetterSetupPanel } from '../../feeLetter/FeeLetterSetupPanel'
import { FeeLetterPreviewDialog } from '../../feeLetter/FeeLetterPreviewDialog'
import { buildLetterTermScopeLabel } from '../../../lib/feeLetter/termScopeLabel'
import { getSchoolPortalUrl } from '../../../lib/feeLetter/schoolPortalUrl'
import {
    readFeeLetterTemplate,
    writeFeeLetterTemplate,
} from '../../../lib/feeLetter/storage'
import type { FeeLetterTemplateId } from '../../../lib/feeLetter/types'
import { DEFAULT_FEE_LETTER_TEMPLATE } from '../../../lib/feeLetter/templates'
import { printFeeStructureLetter } from '../../../lib/feesPrint'
import { useParams } from 'next/navigation'
import { getLayoutSchoolName } from '@/lib/schoolLogo'
import { useTenantFeeLetterSettings } from '../../../hooks/useTenantFeeLetterSettings'
import type { LetterSchoolDetailsPayload } from '../../../lib/feeLetter/letterSchoolDetails'

interface Step4DocumentProps {
    formData: FeeWizardFormData
    onChange: (field: string, value: unknown) => void
    errors?: Record<string, string>
}

export const Step4Document = ({
    formData,
    onChange,
    errors,
}: Step4DocumentProps) => {
    const params = useParams()
    const subdomain = (params?.subdomain as string) || 'school'
    const templateScope = `wizard-${subdomain}`
    const sidebarSchoolName = getLayoutSchoolName(subdomain)
    const pdfPrintRef = useRef<HTMLDivElement>(null)
    const portalUrl = getSchoolPortalUrl()
    const [showPreview, setShowPreview] = useState(false)
    const [letterTemplateId, setLetterTemplateId] =
        useState<FeeLetterTemplateId>(DEFAULT_FEE_LETTER_TEMPLATE)
    const selectedGrades = formData.selectedGrades || []
    const hydratedFromApi = useRef(false)

    const {
        details: letterDetails,
        setDetails: setLetterDetails,
        saveNow: saveLetterDetails,
        saving: letterDetailsSaving,
        loading: letterDetailsLoading,
        error: letterDetailsError,
        loaded: letterDetailsLoaded,
    } = useTenantFeeLetterSettings(subdomain)

    useEffect(() => {
        setLetterTemplateId(readFeeLetterTemplate(templateScope))
    }, [templateScope])

    useEffect(() => {
        writeFeeLetterTemplate(templateScope, letterTemplateId)
    }, [templateScope, letterTemplateId])

    useEffect(() => {
        if (!letterDetailsLoaded || hydratedFromApi.current) return
        hydratedFromApi.current = true
        onChange('schoolDetails', letterDetails.schoolDetails)
        onChange('paymentModes', letterDetails.paymentModes)
        onChange('logoUrl', letterDetails.logoUrl)
        onChange('schoolMotto', letterDetails.schoolMotto)
    }, [letterDetailsLoaded, letterDetails, onChange])

    const handleLetterDetailsChange = (next: LetterSchoolDetailsPayload) => {
        setLetterDetails(next)
        onChange('schoolDetails', next.schoolDetails)
        onChange('paymentModes', next.paymentModes)
        onChange('logoUrl', next.logoUrl)
        onChange('schoolMotto', next.schoolMotto)
    }

    const sortedTerms = useMemo(
        () => sortWizardTerms(formData.terms || []),
        [formData.terms],
    )
    const termIdsKey = sortedTerms.map((t) => t.id).join(',')

    useEffect(() => {
        if (!formData.previewGrade && selectedGrades[0]) {
            onChange('previewGrade', selectedGrades[0])
        }
    }, [formData.previewGrade, selectedGrades, onChange])

    useEffect(() => {
        if (!sortedTerms.length) return
        const valid = (formData.previewTermIds || []).filter((id) =>
            sortedTerms.some((t) => t.id === id),
        )
        if (valid.length === 0) {
            onChange('previewTermIds', sortedTerms.map((t) => t.id))
        } else if (valid.length !== (formData.previewTermIds || []).length) {
            onChange('previewTermIds', valid)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when term list changes
    }, [termIdsKey])

    const previewGrade =
        formData.previewGrade ||
        selectedGrades[0] ||
        ''

    const selectedTermIds = useMemo(() => {
        const valid = (formData.previewTermIds || []).filter((id) =>
            sortedTerms.some((t) => t.id === id),
        )
        return valid.length > 0 ? valid : sortedTerms.map((t) => t.id)
    }, [formData.previewTermIds, sortedTerms])

    const pdfForm = useMemo(() => {
        const base = buildPdfFormFromWizard(formData, {
            previewGrade,
            previewTermIds: selectedTermIds,
        })
        return {
            ...base,
            schoolDetails: letterDetails.schoolDetails,
            paymentModes: letterDetails.paymentModes,
        }
    }, [formData, previewGrade, selectedTermIds, letterDetails])

    const { termScopeLine, totalRowLabel } = useMemo(() => {
        const names = sortedTerms
            .filter((t) => selectedTermIds.includes(t.id))
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
    }, [sortedTerms, selectedTermIds])

    const gradeLevelsForPdf = useMemo(
        () =>
            previewGrade
                ? [{ id: previewGrade, gradeLevel: { name: previewGrade } }]
                : [],
        [previewGrade],
    )

    const feeBuckets = useMemo(
        () =>
            formData.selectedBuckets.map((bucketId) => {
                const bucket = formData.bucketAmounts[bucketId]
                return {
                    id: bucketId,
                    name: bucket?.name || 'Unknown',
                    description: '',
                }
            }),
        [formData.selectedBuckets, formData.bucketAmounts],
    )

    const handlePrint = () => {
        printFeeStructureLetter(pdfPrintRef.current)
    }

    const letterAmountsReady = useMemo(() => {
        if (!previewGrade || selectedTermIds.length === 0) return false
        const hasTermAmounts =
            formData.termBucketAmounts &&
            Object.keys(formData.termBucketAmounts).length > 0
        if (hasTermAmounts) {
            return selectedTermIds.every((termId) => {
                const termBuckets = formData.termBucketAmounts?.[termId]
                if (!termBuckets) return false
                return Object.values(termBuckets).some((b) => (b?.amount ?? 0) > 0)
            })
        }
        return formData.selectedBuckets.some((id) => {
            const bucket = formData.bucketAmounts[id]
            return (bucket?.amount ?? 0) > 0
        })
    }, [previewGrade, selectedTermIds, formData])

    const letterReadinessMessage = !letterAmountsReady
        ? !previewGrade
            ? 'Select a grade to preview the letter.'
            : 'Add fee amounts before generating the letter.'
        : null

    const letterTermLabel = useMemo(
        () => buildLetterTermScopeLabel(sortedTerms, selectedTermIds),
        [sortedTerms, selectedTermIds],
    )

    const letterPreviewMeta = useMemo(
        () => ({
            grade: previewGrade || null,
            academicYear: formData.academicYear || null,
            terms: letterTermLabel,
        }),
        [previewGrade, formData.academicYear, letterTermLabel],
    )

    const letterPreviewProps = {
        formData: pdfForm,
        logoUrl: letterDetails.logoUrl,
        feeBuckets,
        gradeLevels: gradeLevelsForPdf,
        termScopeLine,
        totalRowLabel,
        templateId: letterTemplateId,
        schoolLogoKey: sidebarSchoolName,
        schoolMotto: letterDetails.schoolMotto,
        schoolWebsiteUrl: portalUrl,
    }

    return (
        <div className="space-y-5">
            <FeesWizardSection title="Official fee structure">
                <FeeLetterSetupPanel
                    grades={selectedGrades}
                    previewGrade={previewGrade}
                    onGradeChange={(grade) => onChange('previewGrade', grade)}
                    terms={sortedTerms}
                    selectedTermIds={selectedTermIds}
                    onTermIdsChange={(ids) => onChange('previewTermIds', ids)}
                    templateId={letterTemplateId}
                    onTemplateChange={setLetterTemplateId}
                    letterDetails={letterDetails}
                    onLetterDetailsChange={handleLetterDetailsChange}
                    onSaveLetterDetails={saveLetterDetails}
                    letterDetailsSaving={letterDetailsSaving}
                    letterDetailsLoading={letterDetailsLoading}
                    letterDetailsError={letterDetailsError}
                    schoolLogoKey={sidebarSchoolName}
                    portalUrl={portalUrl}
                    letterAmountsReady={letterAmountsReady}
                    onPreview={() => setShowPreview(true)}
                    onPrint={handlePrint}
                    readinessMessage={
                        errors?.previewGrade
                            ? errors.previewGrade
                            : letterReadinessMessage
                    }
                />
            </FeesWizardSection>

            <div
                className="pointer-events-none fixed left-[-9999px] top-0 w-[210mm] opacity-0"
                aria-hidden
            >
                <FeeStructureLetterPreview
                    {...letterPreviewProps}
                    containerRef={pdfPrintRef}
                />
            </div>

            <FeeLetterPreviewDialog
                open={showPreview}
                onOpenChange={setShowPreview}
                meta={letterPreviewMeta}
                onPrint={handlePrint}
                headerActions={
                    <FeeLetterSetupPanel
                        grades={selectedGrades}
                        previewGrade={previewGrade}
                        onGradeChange={(grade) =>
                            onChange('previewGrade', grade)
                        }
                        terms={sortedTerms}
                        selectedTermIds={selectedTermIds}
                        onTermIdsChange={(ids) =>
                            onChange('previewTermIds', ids)
                        }
                        templateId={letterTemplateId}
                        onTemplateChange={setLetterTemplateId}
                        letterDetails={letterDetails}
                        onLetterDetailsChange={handleLetterDetailsChange}
                        onSaveLetterDetails={saveLetterDetails}
                        letterDetailsSaving={letterDetailsSaving}
                        letterDetailsLoading={letterDetailsLoading}
                        letterDetailsError={letterDetailsError}
                        schoolLogoKey={sidebarSchoolName}
                        portalUrl={portalUrl}
                        letterAmountsReady={letterAmountsReady}
                        onPreview={() => setShowPreview(true)}
                        onPrint={handlePrint}
                        readinessMessage={
                            errors?.previewGrade ?? letterReadinessMessage
                        }
                        compact
                        embeddedInPreview
                    />
                }
            >
                <div className="mx-auto max-w-3xl overflow-hidden rounded-lg shadow-lg ring-1 ring-slate-300/40">
                    <FeeStructureLetterPreview {...letterPreviewProps} />
                </div>
            </FeeLetterPreviewDialog>
        </div>
    )
}
