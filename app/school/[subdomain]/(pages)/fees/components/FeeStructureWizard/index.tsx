'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { WizardProgress } from './WizardProgress'
import { StepFees, type StepFeesValue, groupGradesByTermAmount, representativeTermTotal } from './steps/StepFees'
import {
    StepBreakdown,
    breakdownRemainingIsZero,
} from './steps/StepBreakdown'
import { Step4Document } from './steps/Step4Document'
import {
    createDefaultSchoolDetails,
    createDefaultPaymentModes,
} from '../../lib/feesDocumentDefaults'
import type { FeeWizardFormData } from '../../lib/feesWizardPdfForm'
import { useGraphQLFeeStructures, GraphQLFeeStructure } from '../../hooks/useGraphQLFeeStructures'
import { FeeStructureForm } from '../../types'
import {
    clearFeesSetupDraft,
    applyDraftToWizardForm,
    buildBucketPrefillFromDraft,
    type FeesSetupWizardResult,
} from '../../lib/feesSetupDraft'
import { roundToNearestTen } from '../../lib/feesAmounts'
import {
    ensureBucketsForCategories,
    fetchActiveFeeBuckets,
} from '../../lib/feeBucketsApi'
import {
    buildFeeStructureItemUpdates,
    buildItemUpdatesForStructure,
    buildItemsForTerm,
    hasDifferentAmountsPerTerm,
    isCombinedMultiTermStructure,
    stripTermSuffixFromPlanName,
    type StructureWithItems,
} from '../../lib/feeStructureItemUpdates'
import {
    dedupeTermsById,
    getFeePlanGroupKey,
    resolvePlanLabel,
    type FeeStructureGroupSource,
} from '../../lib/feePlanGrouping'
import { sortTermsForLetter } from '../../lib/sortTermsForLetter'
import { FEES_BRAND } from '../../lib/fees-ui'
import { buildDefaultFeePlanName } from '../../lib/feePlanStats'
import { useToast } from '@/components/ui/use-toast'
import { getDisplayErrorMessage } from '@/lib/utils/graphql-errors'
import { Input } from '@/components/ui/input'

interface FeeStructureWizardProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => void
    initialData?: FeeStructureForm
    mode?: 'create' | 'edit'
    availableGrades?: any[]
    structureId?: string
    structureData?: GraphQLFeeStructure
    processedStructureData?: any
    /** @deprecated Dual setup wizard removed — kept for call-site compat */
    draftSyncKey?: number
    /** @deprecated Dual setup wizard removed — kept for call-site compat */
    onEditSetup?: () => void
}

const steps = [
    { number: 1, title: 'Fees' },
    { number: 2, title: 'Breakdown' },
    { number: 3, title: 'Letter' },
]

const emptyFeesValue = (): StepFeesValue => ({
    academicYearId: '',
    academicYearName: '',
    terms: [],
    selectedGrades: [],
    sameFeeForAll: true,
    termTotalKes: 0,
    gradeAmounts: {},
    categories: ['Tuition'],
})

/** Scale line items so they sum to toTotal, keeping the same mix as fromTotal */
function scaleFeeItems(
    items: Array<{
        feeBucketId: string
        amount: number
        isMandatory: boolean
        termIds: string[]
    }>,
    fromTotal: number,
    toTotal: number,
) {
    if (fromTotal <= 0 || fromTotal === toTotal || items.length === 0) {
        return items.map((item) => ({
            ...item,
            amount: roundToNearestTen(item.amount),
        }))
    }
    const ratio = toTotal / fromTotal
    let allocated = 0
    return items.map((item, index) => {
        if (index === items.length - 1) {
            return {
                ...item,
                amount: roundToNearestTen(Math.max(0, toTotal - allocated)),
            }
        }
        const amount = roundToNearestTen(item.amount * ratio)
        allocated += amount
        return { ...item, amount }
    })
}

function gradeBandLabel(grades: string[]): string {
    if (grades.length === 1) return grades[0]
    if (grades.length <= 3) return grades.join(', ')
    return `${grades[0]}–${grades[grades.length - 1]}`
}

export const FeeStructureWizard = ({ isOpen, onClose, onSave, initialData, mode = 'create', availableGrades = [], structureId, structureData, processedStructureData }: FeeStructureWizardProps) => {
    const params = useParams()
    const subdomain = params?.subdomain as string | undefined
    const [currentStep, setCurrentStep] = useState(1)
    const [isSaving, setIsSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [isLoadingStructure, setIsLoadingStructure] = useState(false)
    const { createFeeStructureWithItems, updateFeeStructure, fetchFeeStructures } = useGraphQLFeeStructures()
    const { toast } = useToast()
    const isEditMode = mode === 'edit'
    const [saveError, setSaveError] = useState<string | null>(null)

    const emptyForm = (): FeeWizardFormData => ({
        name: '',
        grade: '',
        boardingType: 'day',
        academicYear: new Date().getFullYear().toString(),
        academicYearId: '',
        selectedGrades: [],
        selectedBuckets: [],
        terms: [],
        bucketAmounts: {},
        termBucketAmounts: {},
        schoolDetails: createDefaultSchoolDetails(subdomain),
        paymentModes: createDefaultPaymentModes(),
        logoUrl: null,
        schoolMotto: undefined,
        previewGrade: '',
        previewTermIds: [],
    })

    const [formData, setFormData] = useState<FeeWizardFormData>(emptyForm)
    const [feesValue, setFeesValue] = useState<StepFeesValue>(emptyFeesValue)
    const [categorySplits, setCategorySplits] = useState<Record<string, number>>({
        Tuition: 100,
    })
    const [isProvisioningSetup, setIsProvisioningSetup] = useState(false)
    const [setupProvisionError, setSetupProvisionError] = useState<string | null>(null)

    const updateFeesValue = useCallback((partial: Partial<StepFeesValue>) => {
        setFeesValue((prev) => ({ ...prev, ...partial }))
    }, [])

    // Initialize form data from structureData when in edit mode
    useEffect(() => {
        const initializeStructureData = () => {
            if (isEditMode && isOpen) {
                // Use structureData if provided, otherwise we'll need to fetch
                const structure = structureData
                
                if (!structure) {
                    // If no structureData provided, try to fetch it
                    if (structureId) {
                        setIsLoadingStructure(true)
                        fetch('/api/graphql', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                query: `
                                    query GetFeeStructure($id: ID!) {
                                        feeStructure(id: $id) {
                                            id
                                            name
                                            planLabel
                                            isActive
                                            academicYear {
                                                id
                                                name
                                            }
                                            terms {
                                                id
                                                name
                                            }
                                            gradeLevels {
                                                id
                                                shortName
                                                gradeLevel {
                                                    id
                                                    name
                                                }
                                            }
                                            items {
                                                id
                                                feeBucket {
                                                    id
                                                    name
                                                }
                                                amount
                                                isMandatory
                                            }
                                        }
                                    }
                                `,
                                variables: { id: structureId }
                            })
                        })
                        .then(response => response.json())
                        .then(result => {
                            if (result.errors || !result.data?.feeStructure) {
                                console.error('Error fetching fee structure:', result.errors)
                                setIsLoadingStructure(false)
                                return
                            }
                            populateFormData(result.data.feeStructure, processedStructureData)
                            setIsLoadingStructure(false)
                        })
                        .catch(error => {
                            console.error('Error fetching fee structure:', error)
                            setIsLoadingStructure(false)
                        })
                    }
                    return
                }

                // Use the provided structureData directly
                // Note: populateFormData will use processedStructureData for all terms if available
                populateFormData(structure, processedStructureData)
            } else if (!isEditMode && isOpen) {
                setCurrentStep(1)
                setFeesValue(emptyFeesValue())
                setCategorySplits({ Tuition: 100 })
                setFormData(emptyForm())
                setSetupProvisionError(null)
            }
        }

        const populateFormData = (structure: GraphQLFeeStructure, processedData?: any) => {
            // Extract grade names from gradeLevels
            const gradeNames = structure.gradeLevels?.map((gl: any) => 
                gl.gradeLevel?.name || gl.shortName || ''
            ).filter((name: string) => name) || []

            // Extract terms - use all terms from processedStructureData if available (has all terms from grouped structures)
            // Otherwise use terms from the single structure
            let terms: Array<{ id: string; name: string }> = []
            if (processedData?.allStructures?.length > 0) {
                terms = dedupeTermsById(
                    processedData.allStructures.flatMap(
                        (struct: { terms?: Array<{ id: string; name: string }> }) =>
                            struct.terms ?? [],
                    ),
                )
            } else if (processedData?.terms && processedData.terms.length > 0) {
                terms = sortTermsForLetter(processedData.terms).map((term: any) => ({
                    id: term.id,
                    name: term.name,
                }))
            } else {
                // Fallback to terms from single structure
                terms = structure.terms?.map((term: any) => ({
                    id: term.id,
                    name: term.name
                })) || []
            }

            // Extract buckets and amounts - use actual term-specific data from allStructures
            const selectedBuckets: string[] = []
            const bucketAmounts: Record<string, { id: string; name: string; amount: number; isMandatory: boolean; itemId?: string }> = {}
            const termBucketAmounts: Record<string, Record<string, { id: string; name: string; amount: number; isMandatory: boolean; itemId?: string }>> = {}
            
            // If we have processedData with allStructures, use actual term-specific amounts
            if (processedData?.allStructures && processedData.allStructures.length > 0) {
                processedData.allStructures.forEach((struct: any) => {
                    const structTerms = struct.terms || []
                    const primaryTerm = structTerms[0]
                    if (!primaryTerm?.id) return

                    struct.items?.forEach((item: any) => {
                        const bucketId = item.feeBucket?.id
                        if (!bucketId) return

                        if (!selectedBuckets.includes(bucketId)) {
                            selectedBuckets.push(bucketId)
                        }

                        if (!termBucketAmounts[primaryTerm.id]) {
                            termBucketAmounts[primaryTerm.id] = {}
                        }

                        termBucketAmounts[primaryTerm.id][bucketId] = {
                            id: bucketId,
                            name: item.feeBucket.name,
                            amount: item.amount,
                            isMandatory: item.isMandatory,
                            itemId: item.id,
                        }
                    })
                })
                
                // Also populate global bucketAmounts (use first term's amounts as default/fallback)
                if (terms.length > 0 && termBucketAmounts[terms[0].id]) {
                    Object.assign(bucketAmounts, termBucketAmounts[terms[0].id])
                }
            } else {
                structure.items?.forEach((item: any) => {
                    const bucketId = item.feeBucket?.id
                    if (!bucketId) return

                    if (!selectedBuckets.includes(bucketId)) {
                        selectedBuckets.push(bucketId)
                    }

                    bucketAmounts[bucketId] = {
                        id: bucketId,
                        name: item.feeBucket.name,
                        amount: item.amount,
                        isMandatory: item.isMandatory,
                        itemId: item.id,
                    }
                })

                terms.forEach((term) => {
                    termBucketAmounts[term.id] = {}
                    selectedBuckets.forEach((bucketId) => {
                        const bucket = bucketAmounts[bucketId]
                        if (bucket) {
                            termBucketAmounts[term.id][bucketId] = { ...bucket }
                        }
                    })
                })
            }

            const docDefaults = emptyForm()
            const displayPlanName =
                processedData?.planLabel ??
                processedData?.structureName ??
                structure.planLabel ??
                stripTermSuffixFromPlanName(structure.name)

            const firstTermId = terms[0]?.id
            const termTotalKes = firstTermId
                ? Object.values(termBucketAmounts[firstTermId] || {}).reduce(
                      (sum, row) => sum + (row.amount || 0),
                      0,
                  )
                : Object.values(bucketAmounts).reduce(
                      (sum, row) => sum + (row.amount || 0),
                      0,
                  )

            const categories = selectedBuckets.map(
                (id) => bucketAmounts[id]?.name || id,
            )
            if (!categories.includes('Tuition') && categories.length === 0) {
                categories.push('Tuition')
            }

            setFeesValue({
                academicYearId: structure.academicYear?.id || '',
                academicYearName: structure.academicYear?.name || '',
                terms,
                selectedGrades: gradeNames,
                sameFeeForAll: true,
                termTotalKes,
                gradeAmounts: Object.fromEntries(
                    gradeNames.map((g) => [g, termTotalKes]),
                ),
                categories: categories.length ? categories : ['Tuition'],
            })

            setFormData({
                ...docDefaults,
                name: displayPlanName || structure.name || '',
                planLabel: displayPlanName || undefined,
                grade: gradeNames[0] || '',
                boardingType: 'day',
                academicYear: structure.academicYear?.name || new Date().getFullYear().toString(),
                academicYearId: structure.academicYear?.id || '',
                selectedGrades: gradeNames,
                selectedBuckets: selectedBuckets,
                terms: terms,
                bucketAmounts: bucketAmounts,
                termBucketAmounts: termBucketAmounts,
                previewGrade: gradeNames[0] || '',
                previewTermIds: terms.map((t) => t.id),
            })

            setCurrentStep(1)
        }

        initializeStructureData()
    }, [isEditMode, structureId, isOpen, structureData, processedStructureData])

    const provisionFromFees = async (): Promise<boolean> => {
        setIsProvisioningSetup(true)
        setSetupProvisionError(null)
        try {
            const grades = feesValue.selectedGrades
            const bands = groupGradesByTermAmount(feesValue)
            if (bands.length === 0) {
                throw new Error('Enter a term total greater than 0 for at least one grade')
            }
            const repTotal = representativeTermTotal(feesValue)
            const gradeAmounts = feesValue.sameFeeForAll
                ? Object.fromEntries(grades.map((g) => [g, repTotal]))
                : { ...feesValue.gradeAmounts }

            const splits: Record<string, number> = Object.fromEntries(
                feesValue.categories.map((c) => [
                    c,
                    c === 'Tuition' ? 100 : 0,
                ]),
            )
            setCategorySplits(splits)

            const draft: FeesSetupWizardResult = {
                academicYearId: feesValue.academicYearId,
                academicYearName: feesValue.academicYearName,
                termCount: feesValue.terms.length,
                categories: feesValue.categories,
                categorySplits: splits,
                gradeAmounts,
            }

            const existing = await fetchActiveFeeBuckets()
            const ensured = await ensureBucketsForCategories(
                feesValue.categories,
                existing,
            )
            const terms = sortTermsForLetter(feesValue.terms)
            const prefill = buildBucketPrefillFromDraft(
                draft,
                ensured,
                terms,
                grades.find((g) => (gradeAmounts[g] ?? 0) > 0) || grades[0],
            )
            if (prefill.selectedBuckets.length === 0) {
                throw new Error(
                    'Could not create fee lines from your selection. Try again.',
                )
            }

            const hasBoarding = feesValue.categories.some((c) =>
                c.toLowerCase().includes('boarding'),
            )
            const boardingType = hasBoarding ? 'both' : 'day'
            const defaultName = buildDefaultFeePlanName({
                academicYearName: feesValue.academicYearName,
                boardingType,
                selectedGrades: grades,
            })

            setFeesValue((prev) => ({
                ...prev,
                termTotalKes: repTotal,
                gradeAmounts,
            }))

            setFormData((prev) => ({
                ...applyDraftToWizardForm(draft, prev),
                name: prev.name?.trim() ? prev.name : defaultName,
                academicYearId: feesValue.academicYearId,
                academicYear: feesValue.academicYearName,
                selectedGrades: grades,
                terms,
                selectedBuckets: prefill.selectedBuckets,
                bucketAmounts: prefill.bucketAmounts,
                termBucketAmounts: prefill.termBucketAmounts,
                boardingType,
                previewGrade:
                    grades.find((g) => (gradeAmounts[g] ?? 0) > 0) ||
                    grades[0] ||
                    '',
                previewTermIds: terms.map((t) => t.id),
            }))
            return true
        } catch (err) {
            setSetupProvisionError(
                err instanceof Error ? err.message : 'Could not prepare fee lines',
            )
            return false
        } finally {
            setIsProvisioningSetup(false)
        }
    }

    const [errors, setErrors] = useState<Record<string, string>>({})

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const validateFeeAmounts = (newErrors: Record<string, string>) => {
        if ((formData.selectedBuckets || []).length === 0) {
            newErrors.selectedBuckets = 'Select at least one fee line'
            return
        }
        if (
            !breakdownRemainingIsZero(
                formData,
                representativeTermTotal(feesValue),
            )
        ) {
            newErrors.remaining =
                'Each term’s remaining must be 0. Use Auto-fill Tuition or adjust lines.'
        }
    }

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {}

        if (step === 1) {
            if (!feesValue.academicYearId) {
                newErrors.academicYearId = 'Select an academic year'
            }
            if (feesValue.terms.length === 0) {
                newErrors.academicYearId =
                    newErrors.academicYearId ||
                    'This year needs at least one term'
            }
            if (feesValue.selectedGrades.length === 0) {
                newErrors.selectedGrades = 'Select at least one grade'
            }
            if (groupGradesByTermAmount(feesValue).length === 0) {
                newErrors.termTotalKes =
                    'Enter a term total greater than 0 for at least one grade'
            }
            if (
                !feesValue.categories.includes('Tuition') ||
                feesValue.categories.length === 0
            ) {
                newErrors.categories = 'Tuition is required'
            }
        } else if (step === 2) {
            validateFeeAmounts(newErrors)
        } else if (step === 3) {
            if (!formData.name.trim()) {
                newErrors.name = 'Schedule name is required'
            }
            if (!formData.schoolDetails?.name?.trim()) {
                newErrors.schoolName = 'School name is required on the letter'
            }
            if (
                (formData.selectedGrades?.length ?? 0) > 1 &&
                !formData.previewGrade?.trim()
            ) {
                newErrors.previewGrade = 'Select a grade to preview'
            }
            const validTermIds = (formData.previewTermIds || []).filter((id) =>
                (formData.terms || []).some((t) => t.id === id),
            )
            if ((formData.terms?.length ?? 0) > 0 && validTermIds.length === 0) {
                newErrors.previewTerms = 'Select at least one term for the letter'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = async () => {
        if (!validateStep(currentStep)) return

        if (currentStep === 1) {
            if (isEditMode && formData.selectedBuckets.length > 0) {
                setFormData((prev) => ({
                    ...prev,
                    academicYearId: feesValue.academicYearId || prev.academicYearId,
                    academicYear: feesValue.academicYearName || prev.academicYear,
                    selectedGrades: feesValue.selectedGrades,
                    terms:
                        feesValue.terms.length > 0
                            ? sortTermsForLetter(feesValue.terms)
                            : prev.terms,
                    previewGrade:
                        prev.previewGrade || feesValue.selectedGrades[0] || '',
                }))
            } else {
                const ok = await provisionFromFees()
                if (!ok) return
            }
        }

        if (currentStep === 2) {
            setFormData((prev) => ({
                ...prev,
                ...(prev.selectedGrades?.length && !prev.previewGrade
                    ? { previewGrade: prev.selectedGrades[0] }
                    : {}),
                ...(prev.terms?.length && !prev.previewTermIds?.length
                    ? { previewTermIds: prev.terms.map((t) => t.id) }
                    : {}),
            }))
        }

        setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    }

    const handleBack = () =>
        setCurrentStep((prev) => Math.max(prev - 1, 1))

    const handleSave = async () => {
        if (!validateStep(3)) return
        setIsSaving(true)
        setSaveError(null)

        try {
            // Validate required fields
            if (!formData.academicYearId) {
                throw new Error('Academic year is required')
            }
            if (!formData.terms || formData.terms.length === 0) {
                throw new Error('At least one term is required')
            }
            if (formData.selectedGrades.length === 0) {
                throw new Error('At least one grade is required')
            }
            if (formData.selectedBuckets.length === 0) {
                throw new Error('At least one fee line is required')
            }

            // Handle edit mode - use update mutation
            if (isEditMode && structureId) {
                // Fetch grade level IDs for the selected grades
                const gradeLevelsResponse = await fetch('/api/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: `
                            query GradeLevelsForSchoolType {
                                gradeLevelsForSchoolType {
                                    id
                                    shortName
                                    gradeLevel {
                                        id
                                        name
                                    }
                                }
                            }
                        `
                    })
                })

                if (!gradeLevelsResponse.ok) {
                    throw new Error('Failed to fetch grade levels')
                }

                const gradeLevelsResult = await gradeLevelsResponse.json()
                if (gradeLevelsResult.errors) {
                    throw new Error(gradeLevelsResult.errors[0]?.message || 'Failed to fetch grade levels')
                }

                const allGradeLevels = gradeLevelsResult.data?.gradeLevelsForSchoolType || []
                const gradeLevelIds = formData.selectedGrades
                    .map(gradeName => {
                        const gradeLevel = allGradeLevels.find((gl: any) => 
                            gl.gradeLevel?.name === gradeName || gl.shortName === gradeName
                        )
                        return gradeLevel?.id
                    })
                    .filter((id): id is string => !!id)

                if (gradeLevelIds.length === 0) {
                    throw new Error('Could not find grade level IDs for selected grades. Please try again.')
                }

                // Validate structureId
                if (!structureId || structureId.trim() === '') {
                    throw new Error('Invalid fee structure ID. Please refresh the page and try again.')
                }

                // Log the update details for debugging
                if (!formData.academicYearId) {
                    throw new Error('Academic year is required')
                }

                const basePlanName = stripTermSuffixFromPlanName(
                    processedStructureData?.structureName ||
                        structureData?.name ||
                        formData.name,
                )
                const planLabel = resolvePlanLabel(
                    formData.planLabel ??
                        processedStructureData?.planLabel ??
                        structureData?.planLabel,
                    basePlanName,
                )
                const bucketIds = formData.selectedBuckets
                const amountsDifferByTerm = hasDifferentAmountsPerTerm(
                    formData,
                    bucketIds,
                )

                let grouped: StructureWithItems[] =
                    (processedStructureData?.allStructures as StructureWithItems[]) ??
                    []

                if (grouped.length === 0) {
                    const allFromApi = await fetchFeeStructures()
                    const planKey = getFeePlanGroupKey({
                        name: basePlanName,
                        academicYear: { id: formData.academicYearId },
                    })
                    grouped =
                        (allFromApi as StructureWithItems[] | null)?.filter(
                            (s) =>
                                getFeePlanGroupKey(
                                    s as FeeStructureGroupSource,
                                ) === planKey,
                        ) ?? []
                }

                if (grouped.length === 0 && structureData) {
                    grouped = [structureData as StructureWithItems]
                }

                const combinedStructures = grouped.filter(isCombinedMultiTermStructure)
                const perTermStructures = grouped.filter(
                    (s) => !isCombinedMultiTermStructure(s),
                )

                const perTermByTermId = new Map<string, StructureWithItems>()
                for (const struct of perTermStructures) {
                    const term = struct.terms?.[0]
                    if (term?.id) perTermByTermId.set(term.id, struct)
                }

                const mapItemUpdates = (updates: ReturnType<typeof buildItemUpdatesForStructure>) =>
                    updates.length > 0
                        ? updates.map(({ itemId, amount, isMandatory }) => ({
                              id: itemId,
                              amount,
                              isMandatory,
                          }))
                        : undefined

                let updatedStructureId = structureId

                const persistTermPlan = async (term: { id: string; name: string }) => {
                    const termItems = buildItemsForTerm(formData, term.id, bucketIds)
                    const existing = perTermByTermId.get(term.id)

                    if (existing?.id) {
                        const itemUpdates = buildItemUpdatesForStructure(
                            formData,
                            existing,
                        )
                        await updateFeeStructure(existing.id, {
                            name: `${basePlanName} - ${term.name}`,
                            planLabel,
                            isActive: true,
                            gradeLevelIds,
                            itemUpdates: mapItemUpdates(itemUpdates),
                        })
                        return existing.id
                    }

                    if (termItems.length === 0) return null

                    const created = await createFeeStructureWithItems({
                        name: `${basePlanName} - ${term.name}`,
                        planLabel,
                        academicYearId: formData.academicYearId!,
                        gradeLevelIds,
                        items: termItems,
                    })
                    return created?.id ?? null
                }

                if (amountsDifferByTerm) {
                    for (const term of formData.terms ?? []) {
                        const id = await persistTermPlan(term)
                        if (id && !updatedStructureId) updatedStructureId = id
                    }
                    for (const struct of combinedStructures) {
                        if (struct.id) {
                            await updateFeeStructure(struct.id, { isActive: false })
                        }
                    }
                    await fetchFeeStructures()
                } else if (combinedStructures.length > 0) {
                    const target = combinedStructures[0]
                    const targetId = target?.id ?? structureId
                    const lineUpdates = buildItemUpdatesForStructure(formData, target)
                    updatedStructureId =
                        (await updateFeeStructure(targetId, {
                            name: formData.name,
                            isActive: true,
                            gradeLevelIds,
                            itemUpdates: mapItemUpdates(lineUpdates),
                        })) ?? targetId
                    for (const struct of perTermStructures) {
                        if (struct.id) {
                            await updateFeeStructure(struct.id, { isActive: false })
                        }
                    }
                } else if (perTermByTermId.size > 0) {
                    for (const term of formData.terms ?? []) {
                        const id = await persistTermPlan(term)
                        if (id && updatedStructureId === structureId) {
                            updatedStructureId = id
                        }
                    }
                    await fetchFeeStructures()
                } else {
                    const target = grouped[0]
                    const targetId = target?.id ?? structureId
                    const lineUpdates = target
                        ? buildItemUpdatesForStructure(formData, target)
                        : buildFeeStructureItemUpdates(formData, { allStructures: grouped })

                    updatedStructureId =
                        (await updateFeeStructure(targetId, {
                            name: formData.name,
                            planLabel,
                            isActive: true,
                            gradeLevelIds,
                            itemUpdates: mapItemUpdates(lineUpdates),
                        })) ?? targetId
                }

                if (!updatedStructureId) {
                    throw new Error(
                        'Failed to update fee structure: No structure ID returned',
                    )
                }

                // Call onSave with the updated data
                await onSave({
                    id: updatedStructureId,
                    name: formData.name,
                    selectedGrades: formData.selectedGrades,
                    academicYear: formData.academicYear,
                    terms: formData.terms?.map(t => t.name).join(', ') || ''
                })

                setShowSuccess(true)
                setTimeout(() => {
                    setShowSuccess(false)
                    onClose()
                    setCurrentStep(1)
                }, 1500)
                return
            }

            // Continue with create mode logic below...

            // Fetch grade level IDs from the API
            const gradeLevelsResponse = await fetch('/api/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
                        query GradeLevelsForSchoolType {
                            gradeLevelsForSchoolType {
                                id
                                shortName
                                gradeLevel {
                                    id
                                    name
                                }
                            }
                        }
                    `
                })
            })

            if (!gradeLevelsResponse.ok) {
                throw new Error('Failed to fetch grade levels')
            }

            const gradeLevelsResult = await gradeLevelsResponse.json()
            if (gradeLevelsResult.errors) {
                throw new Error(gradeLevelsResult.errors[0]?.message || 'Failed to fetch grade levels')
            }

            const allGradeLevels = gradeLevelsResult.data?.gradeLevelsForSchoolType || []

            const resolveGradeLevelIds = (gradeNames: string[]) =>
                gradeNames
                    .map((gradeName) => {
                        const gradeLevel = allGradeLevels.find(
                            (gl: {
                                id: string
                                shortName?: string
                                gradeLevel?: { name?: string }
                            }) =>
                                gl.gradeLevel?.name === gradeName ||
                                gl.shortName === gradeName,
                        )
                        return gradeLevel?.id
                    })
                    .filter((id): id is string => !!id)

            const amountBands = groupGradesByTermAmount(feesValue)
            if (amountBands.length === 0) {
                throw new Error(
                    'Enter a term total greater than 0 for at least one grade',
                )
            }

            if (!formData.terms || formData.terms.length === 0) {
                throw new Error('No terms selected. Please select at least one term.')
            }
            const termIds = formData.terms.map((t) => t.id)
            const hasTermSpecificAmounts =
                formData.termBucketAmounts &&
                Object.keys(formData.termBucketAmounts).length > 0

            const bucketValidationResponse = await fetch('/api/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
                        query GetFeeBuckets {
                            feeBuckets {
                                id
                                name
                                isActive
                            }
                        }
                    `,
                }),
            })

            let validBucketIds: string[] = []
            if (bucketValidationResponse.ok) {
                const validationResult = await bucketValidationResponse.json()
                if (validationResult.data?.feeBuckets) {
                    const allBuckets = validationResult.data.feeBuckets
                    validBucketIds = formData.selectedBuckets.filter(
                        (bucketId) => {
                            const bucket = allBuckets.find(
                                (b: { id: string; isActive?: boolean }) =>
                                    b.id === bucketId,
                            )
                            return bucket && bucket.isActive
                        },
                    )

                    const invalidBuckets = formData.selectedBuckets.filter(
                        (bucketId) => {
                            const bucket = allBuckets.find(
                                (b: { id: string; isActive?: boolean }) =>
                                    b.id === bucketId,
                            )
                            return !bucket || !bucket.isActive
                        },
                    )

                    if (invalidBuckets.length > 0) {
                        throw new Error(
                            'One or more fee lines are missing or inactive. Refresh and try again.',
                        )
                    }
                } else {
                    validBucketIds = formData.selectedBuckets
                }
            } else {
                validBucketIds = formData.selectedBuckets
            }

            const buildBaseItems = () => {
                const items: Array<{
                    feeBucketId: string
                    amount: number
                    isMandatory: boolean
                    termIds: string[]
                }> = []
                const used = new Set<string>()
                const firstTerm = formData.terms![0]
                const termAmounts =
                    (hasTermSpecificAmounts &&
                        formData.termBucketAmounts?.[firstTerm.id]) ||
                    {}

                for (const bucketId of validBucketIds) {
                    if (used.has(bucketId)) continue
                    const bucket =
                        termAmounts[bucketId] || formData.bucketAmounts[bucketId]
                    if (bucket && bucket.amount > 0) {
                        items.push({
                            feeBucketId: bucketId,
                            amount: roundToNearestTen(bucket.amount),
                            isMandatory: bucket.isMandatory,
                            termIds,
                        })
                        used.add(bucketId)
                    }
                }
                return items
            }

            const baseItems = buildBaseItems()
            if (baseItems.length === 0) {
                throw new Error('At least one fee line must have an amount greater than 0')
            }

            const baseTotal = representativeTermTotal(feesValue)
            const sharedPlanLabel = resolvePlanLabel(
                formData.planLabel,
                formData.name,
            )
            const hasBoarding = feesValue.categories.some((c) =>
                c.toLowerCase().includes('boarding'),
            )
            const boardingType = hasBoarding ? 'both' : 'day'

            const createdStructures = []
            for (const band of amountBands) {
                const gradeLevelIds = resolveGradeLevelIds(band.grades)
                if (gradeLevelIds.length === 0) {
                    throw new Error(
                        `Could not find grade IDs for: ${band.grades.join(', ')}`,
                    )
                }
                const items = scaleFeeItems(baseItems, baseTotal, band.amount)
                const scheduleName =
                    amountBands.length === 1
                        ? formData.name
                        : buildDefaultFeePlanName({
                              academicYearName: feesValue.academicYearName,
                              boardingType,
                              selectedGrades: band.grades,
                          }) ||
                          `${formData.name} · ${gradeBandLabel(band.grades)}`

                const createdStructure = await createFeeStructureWithItems({
                    name: scheduleName,
                    planLabel:
                        amountBands.length === 1
                            ? sharedPlanLabel
                            : scheduleName,
                    academicYearId: formData.academicYearId!,
                    gradeLevelIds,
                    items,
                })
                createdStructures.push(createdStructure)
            }

            await onSave({
                id: createdStructures[0].id,
                name:
                    amountBands.length === 1
                        ? createdStructures[0].name
                        : `${createdStructures.length} fee schedules`,
                academicYear: formData.academicYear,
                terms:
                    formData.terms?.map((t) => t.name).join(', ') ||
                    createdStructures[0].terms?.map((t: { name: string }) => t.name).join(', ') ||
                    '',
                grades: feesValue.selectedGrades.join(', '),
            })
            clearFeesSetupDraft()

            setShowSuccess(true)
            setTimeout(() => {
                setShowSuccess(false)
                onClose()
                setCurrentStep(1)
                setFormData(emptyForm())
                setFeesValue(emptyFeesValue())
            }, 1500)
        } catch (error) {
            const message = getDisplayErrorMessage(error)
            console.error('Failed to save:', error)
            setSaveError(message)
            toast({
                title: isEditMode ? 'Could not update fee schedule' : 'Could not create fee schedule',
                description: message,
                variant: 'destructive',
            })
        } finally {
            setIsSaving(false)
        }
    }

    const stepSubtitle =
        currentStep === 1
            ? 'Year, grades, and term total'
            : currentStep === 2
              ? 'Split into fee lines'
              : 'Name, letter preview, and save'

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className={`w-full p-0 flex flex-col gap-0 border-l border-slate-200 ${
                    currentStep === 3 ? 'sm:max-w-4xl' : 'sm:max-w-3xl'
                }`}
            >
                <SheetHeader
                    className="shrink-0 border-b border-slate-100 px-5 py-4 text-left"
                    style={{ backgroundColor: FEES_BRAND.primaryLight }}
                >
                    <SheetTitle className="text-lg font-semibold text-slate-900">
                        {isEditMode ? 'Edit fee schedule' : "Set this year's fees"}
                    </SheetTitle>
                    <SheetDescription className="text-sm text-slate-600">
                        Step {currentStep} of {steps.length} · {stepSubtitle}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto bg-slate-50/50 px-5 py-5">
                    <WizardProgress currentStep={currentStep} steps={steps} />

                    {isLoadingStructure || isProvisioningSetup ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2
                                className="h-7 w-7 animate-spin"
                                style={{ color: FEES_BRAND.primary }}
                            />
                            <span className="text-sm text-slate-600">
                                {isProvisioningSetup ? 'Preparing fee lines…' : 'Loading…'}
                            </span>
                        </div>
                    ) : setupProvisionError ? (
                        <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                            <p className="mb-3">{setupProvisionError}</p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void provisionFromFees()}
                            >
                                Retry
                            </Button>
                        </div>
                    ) : (
                        <div className="mt-6">
                            {currentStep === 1 && (
                                <StepFees
                                    value={feesValue}
                                    onChange={updateFeesValue}
                                    errors={errors}
                                    readOnlyYear={isEditMode}
                                />
                            )}
                            {currentStep === 2 && (
                                <StepBreakdown
                                    formData={formData}
                                    termTotalKes={representativeTermTotal(feesValue)}
                                    categories={feesValue.categories}
                                    categorySplits={categorySplits}
                                    onChange={updateFormData}
                                    onCategorySplitsChange={setCategorySplits}
                                    errors={errors}
                                />
                            )}
                            {currentStep === 3 && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
                                            Schedule name
                                        </label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) =>
                                                updateFormData('name', e.target.value)
                                            }
                                            placeholder="e.g. 2026-2027 · All grades"
                                            className={
                                                errors?.name ? 'border-red-500' : undefined
                                            }
                                        />
                                        {errors?.name ? (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.name}
                                            </p>
                                        ) : null}
                                    </div>
                                    <Step4Document
                                        formData={formData}
                                        onChange={updateFormData}
                                        errors={errors}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {saveError ? (
                    <div
                        className="shrink-0 mx-5 mb-0 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
                        role="alert"
                    >
                        {saveError}
                    </div>
                ) : null}

                <div className="shrink-0 flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-3">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep <= 1 || isProvisioningSetup}
                        size="sm"
                        className="text-slate-600"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={onClose} size="sm" className="text-slate-500">
                            Cancel
                        </Button>

                        {currentStep < steps.length ? (
                            <Button
                                onClick={() => void handleNext()}
                                disabled={isProvisioningSetup}
                                size="sm"
                                className="text-white"
                                style={{ backgroundColor: FEES_BRAND.primary }}
                            >
                                {isProvisioningSetup ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : null}
                                Continue
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                size="sm"
                                className="text-white"
                                style={{ backgroundColor: FEES_BRAND.primary }}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving…
                                    </>
                                ) : isEditMode ? (
                                    'Save'
                                ) : (
                                    'Save fee schedule'
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {showSuccess && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95">
                        <p className="text-lg font-semibold text-emerald-800">Schedule saved</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

export default FeeStructureWizard
