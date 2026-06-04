'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { WizardProgress } from './WizardProgress'
import { Step1QuickSetup } from './steps/Step1QuickSetup'
import { Step2Amounts } from './steps/Step2Amounts'
import { Step3Review } from './steps/Step3Review'
import { Step4Document } from './steps/Step4Document'
import {
    createDefaultSchoolDetails,
    createDefaultPaymentModes,
} from '../../lib/feesDocumentDefaults'
import type { FeeWizardFormData } from '../../lib/feesWizardPdfForm'
import { useGraphQLFeeStructures, UpdateFeeStructureInput, GraphQLFeeStructure } from '../../hooks/useGraphQLFeeStructures'
import { FeeStructureForm } from '../../types'
import {
    loadFeesSetupDraft,
    clearFeesSetupDraft,
    saveFeesSetupDraft,
    applyDraftToWizardForm,
    buildBucketPrefillFromDraft,
} from '../../lib/feesSetupDraft'
import {
    ensureBucketsForCategories,
    fetchActiveFeeBuckets,
} from '../../lib/feeBucketsApi'
import { roundToNearestTen } from '../../lib/feesAmounts'
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
import type { FeesSetupWizardResult } from '../FeesSetupWizardDialog'
import { FeePlanLinkedFlowBanner } from '../FeePlanLinkedFlowBanner'
import { getSetupDraftSummary } from '../../lib/feePlanCreationFlow'
import { useToast } from '@/components/ui/use-toast'
import { getDisplayErrorMessage } from '@/lib/utils/graphql-errors'

interface FeeStructureWizardProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => void
    initialData?: FeeStructureForm
    mode?: 'create' | 'edit'
    availableGrades?: any[]
    structureId?: string // ID of the structure being edited
    structureData?: GraphQLFeeStructure // Full GraphQL structure data (preferred over fetching)
    processedStructureData?: any // Processed structure with all terms grouped
    /** Re-run guided provision after setup wizard saves (increment from page) */
    draftSyncKey?: number
    /** Open the 5-step setup wizard to change categories, splits, grade amounts */
    onEditSetup?: () => void
}

const steps = [
    { number: 1, title: 'Setup' },
    { number: 2, title: 'Amounts' },
    { number: 3, title: 'Review' },
    { number: 4, title: 'Letter' },
]

export const FeeStructureWizard = ({ isOpen, onClose, onSave, initialData, mode = 'create', availableGrades = [], structureId, structureData, processedStructureData, draftSyncKey = 0, onEditSetup }: FeeStructureWizardProps) => {
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
    const [setupDraft, setSetupDraft] = useState<FeesSetupWizardResult | null>(null)
    const [isProvisioningSetup, setIsProvisioningSetup] = useState(false)
    const [setupProvisionError, setSetupProvisionError] = useState<string | null>(null)

    const persistSetupDraft = useCallback((draft: FeesSetupWizardResult) => {
        setSetupDraft(draft)
        saveFeesSetupDraft(draft)
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
                const draft = loadFeesSetupDraft()
                setSetupDraft(draft)
                setCurrentStep(1)
                const base = emptyForm()
                if (draft) {
                    setFormData(applyDraftToWizardForm(draft, base))
                    if (draft.academicYearId) {
                        fetch('/api/graphql', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                query: `query { academicYears { id name terms { id name } } }`,
                            }),
                        })
                            .then((r) => r.json())
                            .then((json) => {
                                const year = json.data?.academicYears?.find(
                                    (y: { id: string }) => y.id === draft.academicYearId,
                                )
                                if (year?.terms?.length) {
                                    setFormData((prev) => ({
                                        ...prev,
                                        terms: sortTermsForLetter(year.terms),
                                    }))
                                }
                            })
                            .catch(() => {})
                    }
                } else {
                    setFormData(base)
                }
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
                console.log('⚠️ Using terms from single structure:', terms.length, 'terms:', terms.map(t => t.name))
            }

            // Extract buckets and amounts - use actual term-specific data from allStructures
            const selectedBuckets: string[] = []
            const bucketAmounts: Record<string, { id: string; name: string; amount: number; isMandatory: boolean; itemId?: string }> = {}
            const termBucketAmounts: Record<string, Record<string, { id: string; name: string; amount: number; isMandatory: boolean; itemId?: string }>> = {}
            
            // If we have processedData with allStructures, use actual term-specific amounts
            if (processedData?.allStructures && processedData.allStructures.length > 0) {
                console.log('📊 Using allStructures to get term-specific amounts:', processedData.allStructures.length, 'structures')
                
                // Process each structure to get term-specific amounts
                // Each structure in allStructures represents a fee structure for specific term(s)
                processedData.allStructures.forEach((struct: any) => {
                    const structTerms = struct.terms || []
                    const primaryTerm = structTerms[0]
                    if (!primaryTerm?.id) return

                    console.log(
                        `  📋 Processing structure "${struct.name}" for term ${primaryTerm.name} (${struct.items?.length || 0} items)`,
                    )

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
                
                // Log the actual amounts per term for debugging
                console.log('✅ Populated term-specific amounts:', {
                    terms: terms.length,
                    buckets: selectedBuckets.length,
                    termAmounts: terms.map(term => {
                        const termAmounts = termBucketAmounts[term.id] || {}
                        const termTotal = Object.values(termAmounts).reduce((sum: number, b: any) => sum + (b.amount || 0), 0)
                        return {
                            term: term.name,
                            buckets: Object.keys(termAmounts).length,
                            total: termTotal
                        }
                    })
                })
            } else {
                // Fallback: use single structure's items (no term-specific data available)
                console.log('⚠️ No allStructures available, using single structure items')
                structure.items?.forEach((item: any) => {
                    const bucketId = item.feeBucket?.id
                    if (!bucketId) return

                    // Add to selected buckets if not already there
                    if (!selectedBuckets.includes(bucketId)) {
                        selectedBuckets.push(bucketId)
                    }

                    // Store bucket amount in global amounts
                    bucketAmounts[bucketId] = {
                        id: bucketId,
                        name: item.feeBucket.name,
                        amount: item.amount,
                        isMandatory: item.isMandatory,
                        itemId: item.id,
                    }
                })

                // Populate termBucketAmounts for ALL terms with the same bucket amounts (fallback)
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

            console.log('✅ Fee structure loaded for editing:', {
                name: structure.name,
                academicYearId: structure.academicYear?.id,
                termsCount: terms.length,
                bucketsCount: selectedBuckets.length,
                bucketAmounts: Object.keys(bucketAmounts).length
            })

            setCurrentStep(1)
        }

        initializeStructureData()
    }, [isEditMode, structureId, isOpen, structureData, processedStructureData])

    const runGuidedSetupProvision = async () => {
        if (!setupDraft || !formData.terms?.length) return
        setIsProvisioningSetup(true)
        setSetupProvisionError(null)
        try {
            const existing = await fetchActiveFeeBuckets()
            const ensured = await ensureBucketsForCategories(
                setupDraft.categories,
                existing,
            )
            const prefill = buildBucketPrefillFromDraft(
                setupDraft,
                ensured,
                formData.terms,
                formData.previewGrade || formData.selectedGrades[0],
            )
            if (prefill.selectedBuckets.length === 0) {
                throw new Error(
                    'Could not create fee items from your setup categories. Try again.',
                )
            }
            setFormData((prev) => ({
                ...applyDraftToWizardForm(setupDraft, prev),
                selectedBuckets: prefill.selectedBuckets,
                bucketAmounts: prefill.bucketAmounts,
                termBucketAmounts: prefill.termBucketAmounts,
            }))
        } catch (err) {
            setSetupProvisionError(
                err instanceof Error ? err.message : 'Setup failed',
            )
        } finally {
            setIsProvisioningSetup(false)
        }
    }

    useEffect(() => {
        if (!isOpen || isEditMode || !setupDraft) return
        if (!formData.terms?.length) return
        if (formData.selectedBuckets.length > 0) return
        runGuidedSetupProvision()
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run when terms arrive
    }, [
        isOpen,
        isEditMode,
        setupDraft,
        formData.terms?.length,
        formData.selectedBuckets.length,
    ])

    /** After setup wizard saves, reload draft and re-provision buckets/amounts */
    useEffect(() => {
        if (!isOpen || isEditMode || draftSyncKey === 0) return
        const draft = loadFeesSetupDraft()
        setSetupDraft(draft)
        if (!draft) return
        setSetupProvisionError(null)
        setFormData((prev) => ({
            ...applyDraftToWizardForm(draft, prev),
            selectedBuckets: [],
            bucketAmounts: {},
            termBucketAmounts: {},
        }))
        // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by draftSyncKey
    }, [draftSyncKey, isOpen, isEditMode])

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

    const skipAmountsStep = Boolean(setupDraft) && !isEditMode
    const setupDraftSummary = useMemo(
        () => getSetupDraftSummary(setupDraft),
        [setupDraft],
    )

    const validateFeeAmounts = (newErrors: Record<string, string>) => {
        if ((formData.selectedBuckets || []).length === 0) {
            newErrors.selectedBuckets = 'Select at least one fee component'
            return
        }
        const selectedBucketIds = formData.selectedBuckets || []
        const hasTerms = formData.terms && formData.terms.length > 0

        if (hasTerms && formData.termBucketAmounts) {
            const hasValidAmounts = formData.terms.every((term) => {
                const termAmounts = formData.termBucketAmounts?.[term.id] || {}
                return selectedBucketIds.some((bucketId) => {
                    const bucket =
                        termAmounts[bucketId] || formData.bucketAmounts[bucketId]
                    return bucket && bucket.amount > 0
                })
            })
            if (!hasValidAmounts) {
                newErrors.bucketAmounts =
                    'Enter a term total or amount for at least one category in each term'
            }
        } else {
            const hasValidAmounts = selectedBucketIds.every((bucketId) => {
                const bucket = formData.bucketAmounts[bucketId]
                return bucket && bucket.amount > 0
            })
            if (!hasValidAmounts) {
                newErrors.bucketAmounts =
                    'Enter amounts for all selected components'
            }
        }
    }

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {}

        if (step === 1) {
            if (!formData.name.trim()) {
                newErrors.name = 'Structure name is required'
            }
            if (
                !setupDraft &&
                (formData.selectedGrades || []).length === 0
            ) {
                newErrors.selectedGrades = 'Select at least one grade'
            }
        } else if (step === 2) {
            validateFeeAmounts(newErrors)
        } else if (step === 3 && skipAmountsStep) {
            validateFeeAmounts(newErrors)
        } else if (step === 4) {
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

    const handleNext = () => {
        if (!validateStep(currentStep)) return

        if (currentStep === 3) {
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

        setCurrentStep((prev) => {
            let next = prev + 1
            if (skipAmountsStep && next === 2) next = 3
            return Math.min(next, steps.length)
        })
    }

    const handleBack = () =>
        setCurrentStep((prev) => {
            let next = prev - 1
            if (skipAmountsStep && next === 2) next = 1
            return Math.max(next, 1)
        })

    const handleSave = async () => {
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
                throw new Error('At least one fee component is required')
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
            
            // Map selected grade names to grade level IDs
            const gradeLevelIds = formData.selectedGrades
                .map(gradeName => {
                    // Try to match by gradeLevel.name first, then by shortName
                    const gradeLevel = allGradeLevels.find((gl: any) => 
                        gl.gradeLevel?.name === gradeName || gl.shortName === gradeName
                    )
                    return gradeLevel?.id
                })
                .filter((id): id is string => !!id)

            if (gradeLevelIds.length === 0) {
                throw new Error('Could not find grade level IDs for selected grades. Please try again.')
            }
            
            // Build fee items for each term
            if (!formData.terms || formData.terms.length === 0) {
                throw new Error('No terms selected. Please select at least one term.')
            }
            const termIds = formData.terms.map(t => t.id)
            const hasTermSpecificAmounts = formData.termBucketAmounts && Object.keys(formData.termBucketAmounts).length > 0
            
            // Validate that all selected bucket IDs are valid and active
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
                    `
                })
            })

            let validBucketIds: string[] = []
            if (bucketValidationResponse.ok) {
                const validationResult = await bucketValidationResponse.json()
                if (validationResult.data?.feeBuckets) {
                    const allBuckets = validationResult.data.feeBuckets
                    validBucketIds = formData.selectedBuckets.filter(bucketId => {
                        const bucket = allBuckets.find((b: any) => b.id === bucketId)
                        return bucket && bucket.isActive
                    })
                    
                    const invalidBuckets = formData.selectedBuckets.filter(bucketId => {
                        const bucket = allBuckets.find((b: any) => b.id === bucketId)
                        return !bucket || !bucket.isActive
                    })
                    
                    if (invalidBuckets.length > 0) {
                        const invalidNames = invalidBuckets.map(id => {
                            const bucket = allBuckets.find((b: any) => b.id === id)
                            return bucket?.name || id
                        }).join(', ')
                        throw new Error(`One or more fee buckets are not found or inactive: ${invalidNames}. Please refresh the page and try again.`)
                    }
                } else {
                    // If validation query fails, use selected buckets as-is but log a warning
                    console.warn('Could not validate buckets, proceeding with selected buckets')
                    validBucketIds = formData.selectedBuckets
                }
            } else {
                // If validation query fails, use selected buckets as-is but log a warning
                console.warn('Could not validate buckets, proceeding with selected buckets')
                validBucketIds = formData.selectedBuckets
            }
            
            // Check if we have term-specific amounts with different values per term
            const shouldCreatePerTermStructures = hasDifferentAmountsPerTerm(
                formData,
                validBucketIds,
            )
            const planLabel = resolvePlanLabel(formData.planLabel, formData.name)

            if (shouldCreatePerTermStructures) {
                // Create separate fee structures for each term since amounts differ
                const createdStructures = []
                
                for (const term of formData.terms) {
                    const termAmounts = formData.termBucketAmounts?.[term.id] || {}
                    const termItems: Array<{ feeBucketId: string; amount: number; isMandatory: boolean; termIds: string[] }> = []
                    const usedBucketIds = new Set<string>()
                    
                    validBucketIds.forEach(bucketId => {
                        if (usedBucketIds.has(bucketId)) return // Skip duplicates
                        
                        const bucket = termAmounts[bucketId] || formData.bucketAmounts[bucketId]
                        if (bucket && bucket.amount > 0) {
                            termItems.push({
                                feeBucketId: bucketId,
                                amount: roundToNearestTen(bucket.amount),
                                isMandatory: bucket.isMandatory,
                                termIds: [term.id] // Each item needs termIds
                            })
                            usedBucketIds.add(bucketId)
                        }
                    })
                    
                    if (termItems.length === 0) {
                        console.warn(`No items with amounts > 0 for {term.name}, skipping`)
                        continue
                    }
                    
                    // Create fee structure for this term
                    const termStructureName = `${formData.name} - ${term.name}`
                    console.log(`Creating fee structure for {term.name}:`, {
                        name: termStructureName,
                        academicYearId: formData.academicYearId,
                        termIds: [term.id],
                        gradeLevelIds,
                        itemsCount: termItems.length
                    })
                    
                    const createdStructure = await createFeeStructureWithItems({
                        name: termStructureName,
                        planLabel,
                        academicYearId: formData.academicYearId,
                        gradeLevelIds: gradeLevelIds,
                        items: termItems
                    })
                    createdStructures.push(createdStructure)
                }
                
                // Call the onSave callback with the first created structure
                await onSave({
                    id: createdStructures[0].id,
                    name: planLabel,
                    academicYear: formData.academicYear,
                    terms: formData.terms?.map(t => t.name).join(', ') || createdStructures[0].terms?.map((t: any) => t.name).join(', ') || '',
                    grades: formData.selectedGrades.join(', ')
                })
            } else {
                // All terms have the same amounts (or only one term) - create one structure for all terms
                let allItems: Array<{ feeBucketId: string; amount: number; isMandatory: boolean; termIds: string[] }> = []
                const usedBucketIds = new Set<string>()
                
                if (hasTermSpecificAmounts && formData.terms && formData.terms.length > 0) {
                    // Use the first term's amounts (all terms should have same amounts in this case)
                    const firstTerm = formData.terms[0]
                    const termAmounts = formData.termBucketAmounts?.[firstTerm.id] || {}
                    validBucketIds.forEach(bucketId => {
                        if (usedBucketIds.has(bucketId)) return // Skip duplicates
                        
                        const bucket = termAmounts[bucketId] || formData.bucketAmounts[bucketId]
                        if (bucket && bucket.amount > 0) {
                            allItems.push({
                                feeBucketId: bucketId,
                                amount: roundToNearestTen(bucket.amount),
                                isMandatory: bucket.isMandatory,
                                termIds: termIds // All terms for this item
                            })
                            usedBucketIds.add(bucketId)
                        }
                    })
                } else {
                    // Use global amounts for all terms
                    validBucketIds.forEach(bucketId => {
                        if (usedBucketIds.has(bucketId)) return // Skip duplicates
                        
                        const bucket = formData.bucketAmounts[bucketId]
                        if (bucket && bucket.amount > 0) {
                            allItems.push({
                                feeBucketId: bucketId,
                                amount: roundToNearestTen(bucket.amount),
                                isMandatory: bucket.isMandatory,
                                termIds: termIds // All terms for this item
                            })
                            usedBucketIds.add(bucketId)
                        }
                    })
                }

                if (allItems.length === 0) {
                    throw new Error('At least one fee component must have an amount greater than 0')
                }
                
                // Log the items being sent for debugging
                console.log('Creating fee structure with items:', {
                    name: formData.name,
                    academicYearId: formData.academicYearId,
                    termIds,
                    gradeLevelIds,
                    itemsCount: allItems.length,
                    items: allItems.map(item => ({
                        feeBucketId: item.feeBucketId,
                        amount: item.amount,
                        isMandatory: item.isMandatory,
                        termIds: item.termIds
                    }))
                })

                // Create the fee structure using GraphQL
                const createdStructure = await createFeeStructureWithItems({
                    name: formData.name,
                    planLabel,
                    academicYearId: formData.academicYearId,
                    gradeLevelIds: gradeLevelIds,
                    items: allItems
                })

                // Call the onSave callback with the created structure data
                await onSave({
                    id: createdStructure.id,
                    name: createdStructure.name,
                    academicYear: formData.academicYear,
                    terms: formData.terms?.map(t => t.name).join(', ') || createdStructure.terms?.map((t: any) => t.name).join(', ') || '',
                    grades: formData.selectedGrades.join(', ')
                })
                clearFeesSetupDraft()
                setSetupDraft(null)
            }

            setShowSuccess(true)
            setTimeout(() => {
                setShowSuccess(false)
                onClose()
                setCurrentStep(1)
                setFormData(emptyForm())
            }, 1500)
        } catch (error) {
            const message = getDisplayErrorMessage(error)
            console.error('Failed to save:', error)
            setSaveError(message)
            toast({
                title: isEditMode ? 'Could not update fee structure' : 'Could not create fee structure',
                description: message,
                variant: 'destructive',
            })
        } finally {
            setIsSaving(false)
        }
    }

    const stepSubtitle =
        currentStep === 1
            ? setupDraft
              ? 'Structure name (grades already set)'
              : 'Name, year, and grades'
            : currentStep === 2
              ? setupDraft
                ? 'Confirm amounts from setup'
                : 'Term totals and categories'
              : currentStep === 3
                ? skipAmountsStep
                    ? 'Review & edit amounts'
                    : 'Confirm amounts'
                : 'Letterhead, payment & preview'

    const publishStepIndex = skipAmountsStep
        ? currentStep === 1
            ? 1
            : currentStep === 3
              ? 2
              : currentStep === 4
                ? 3
                : 1
        : currentStep
    const publishStepTotal = skipAmountsStep ? 3 : steps.length

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className={`w-full p-0 flex flex-col gap-0 border-l border-slate-200 ${
                    currentStep === 4 ? 'sm:max-w-4xl' : 'sm:max-w-3xl'
                }`}
            >
                <SheetHeader
                    className="shrink-0 border-b border-slate-100 px-5 py-4 text-left"
                    style={{ backgroundColor: FEES_BRAND.primaryLight }}
                >
                    <SheetTitle className="text-lg font-semibold text-slate-900">
                        {isEditMode
                            ? 'Edit fee structure'
                            : skipAmountsStep
                              ? 'Create fee structure'
                              : 'New fee structure'}
                    </SheetTitle>
                    <SheetDescription className="text-sm text-slate-600">
                        {skipAmountsStep
                            ? `Publish · Step ${publishStepIndex} of ${publishStepTotal} · ${stepSubtitle}`
                            : `Step ${currentStep} of ${steps.length} · ${stepSubtitle}`}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto bg-slate-50/50 px-5 py-5">
                    {skipAmountsStep ? (
                        <FeePlanLinkedFlowBanner
                            phase="plan"
                            summary={setupDraftSummary}
                            className="mb-4"
                        />
                    ) : null}
                    <WizardProgress
                        currentStep={currentStep}
                        steps={steps}
                        skippedStep={skipAmountsStep ? 2 : undefined}
                    />

                    {isLoadingStructure || isProvisioningSetup ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2
                                className="h-7 w-7 animate-spin"
                                style={{ color: FEES_BRAND.primary }}
                            />
                            <span className="text-sm text-slate-600">
                                {isProvisioningSetup ? 'Preparing items…' : 'Loading…'}
                            </span>
                        </div>
                    ) : setupProvisionError ? (
                        <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                            <p className="mb-3">{setupProvisionError}</p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => runGuidedSetupProvision()}
                            >
                                Retry
                            </Button>
                        </div>
                    ) : (
                        <div className="mt-6">
                            {currentStep === 1 && (
                                <Step1QuickSetup
                                    formData={formData}
                                    onChange={updateFormData}
                                    errors={errors}
                                    guidedFromSetup={Boolean(setupDraft)}
                                    onEditSetup={
                                        skipAmountsStep ? onEditSetup : undefined
                                    }
                                />
                            )}
                            {currentStep === 2 && !skipAmountsStep && (
                                <Step2Amounts
                                    formData={formData}
                                    onChange={updateFormData}
                                    errors={errors}
                                    setupDraft={setupDraft}
                                    guidedSetupMode={Boolean(setupDraft)}
                                />
                            )}
                            {currentStep === 3 && (
                                <Step3Review
                                    formData={formData}
                                    onChange={updateFormData}
                                    editableAmounts={skipAmountsStep}
                                    setupDraft={setupDraft}
                                    onSetupDraftChange={persistSetupDraft}
                                    onEditSetup={onEditSetup}
                                    errors={errors}
                                />
                            )}
                            {currentStep === 4 && (
                                <Step4Document
                                    formData={formData}
                                    onChange={updateFormData}
                                    errors={errors}
                                />
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
                        disabled={currentStep <= 1}
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
                                onClick={handleNext}
                                size="sm"
                                className="text-white"
                                style={{ backgroundColor: FEES_BRAND.primary }}
                            >
                                Next
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
                                    'Create structure'
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {showSuccess && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95">
                        <p className="text-lg font-semibold text-emerald-800">Structure saved</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

export default FeeStructureWizard
