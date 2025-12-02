'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { WizardProgress } from './WizardProgress'
import { Step1QuickSetup } from './steps/Step1QuickSetup'
import { Step2Amounts } from './steps/Step2Amounts'
import { Step3Review } from './steps/Step3Review'
import { useGraphQLFeeStructures, UpdateFeeStructureInput, GraphQLFeeStructure } from '../../hooks/useGraphQLFeeStructures'
import { FeeStructureForm } from '../../types'

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
}

const steps = [
    { number: 1, title: 'Setup' },
    { number: 2, title: 'Amounts' },
    { number: 3, title: 'Review' }
]

export const FeeStructureWizard = ({ isOpen, onClose, onSave, initialData, mode = 'create', availableGrades = [], structureId, structureData, processedStructureData }: FeeStructureWizardProps) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [isSaving, setIsSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [isLoadingStructure, setIsLoadingStructure] = useState(false)
    const { createFeeStructureWithItems, updateFeeStructure } = useGraphQLFeeStructures()
    const isEditMode = mode === 'edit'

    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        boardingType: 'day' as 'day' | 'boarding' | 'both',
        academicYear: new Date().getFullYear().toString(),
        academicYearId: '',
        selectedGrades: [] as string[],
        selectedBuckets: [] as string[],
        terms: [] as Array<{ id: string; name: string }>,
        bucketAmounts: {} as Record<string, { id: string; name: string; amount: number; isMandatory: boolean }>,
        termBucketAmounts: {} as Record<string, Record<string, { id: string; name: string; amount: number; isMandatory: boolean }>>
    })

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
                // Reset form when opening in create mode
                setCurrentStep(1)
                setFormData({
                    name: '',
                    grade: '',
                    boardingType: 'day',
                    academicYear: new Date().getFullYear().toString(),
                    academicYearId: '',
                    selectedGrades: [],
                    selectedBuckets: [],
                    terms: [],
                    bucketAmounts: {},
                    termBucketAmounts: {}
                })
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
            if (processedData?.terms && processedData.terms.length > 0) {
                // Use all terms from the processed structure (grouped)
                terms = processedData.terms.map((term: any) => ({
                    id: term.id,
                    name: term.name
                }))
                console.log('✅ Using all terms from processed structure:', terms.length, 'terms:', terms.map(t => t.name))
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
            const bucketAmounts: Record<string, { id: string; name: string; amount: number; isMandatory: boolean }> = {}
            const termBucketAmounts: Record<string, Record<string, { id: string; name: string; amount: number; isMandatory: boolean }>> = {}
            
            // If we have processedData with allStructures, use actual term-specific amounts
            if (processedData?.allStructures && processedData.allStructures.length > 0) {
                console.log('📊 Using allStructures to get term-specific amounts:', processedData.allStructures.length, 'structures')
                
                // Process each structure to get term-specific amounts
                // Each structure in allStructures represents a fee structure for specific term(s)
                processedData.allStructures.forEach((struct: any) => {
                    const structTerms = struct.terms || []
                    console.log(`  📋 Processing structure "${struct.name}" with terms:`, structTerms.map((t: any) => t.name), `and ${struct.items?.length || 0} items`)
                    
                    // Process items from this structure - these items apply to this structure's terms
                    struct.items?.forEach((item: any) => {
                        const bucketId = item.feeBucket?.id
                        if (!bucketId) return

                        // Add to selected buckets if not already there
                        if (!selectedBuckets.includes(bucketId)) {
                            selectedBuckets.push(bucketId)
                        }

                        // Map items to their specific terms (this structure's terms)
                        // Each structure's items are mapped to its own terms
                        structTerms.forEach((term: any) => {
                            if (!termBucketAmounts[term.id]) {
                                termBucketAmounts[term.id] = {}
                            }
                            
                            // Store the actual amount for this term and bucket from this structure
                            // This ensures each term gets its actual amounts, not duplicated
                            const existing = termBucketAmounts[term.id][bucketId]
                            if (existing && existing.amount !== item.amount) {
                                console.log(`  ⚠️ Term ${term.name} bucket ${item.feeBucket.name} has different amounts: ${existing.amount} vs ${item.amount}, using ${item.amount}`)
                            }
                            
                            termBucketAmounts[term.id][bucketId] = {
                                id: bucketId,
                                name: item.feeBucket.name,
                                amount: item.amount, // Use actual amount from this structure
                                isMandatory: item.isMandatory
                            }
                        })
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
                        isMandatory: item.isMandatory
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

            // Set form data with structure data
            setFormData({
                name: structure.name || '',
                grade: gradeNames[0] || '',
                boardingType: 'day',
                academicYear: structure.academicYear?.name || new Date().getFullYear().toString(),
                academicYearId: structure.academicYear?.id || '',
                selectedGrades: gradeNames,
                selectedBuckets: selectedBuckets,
                terms: terms,
                bucketAmounts: bucketAmounts,
                termBucketAmounts: termBucketAmounts // Now populated for all terms!
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

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {}

        if (step === 1) {
            if (!formData.name.trim()) {
                newErrors.name = 'Structure name is required'
            }
            if ((formData.selectedGrades || []).length === 0) {
                newErrors.selectedGrades = 'Select at least one grade'
            }
        } else if (step === 2) {
            if ((formData.selectedBuckets || []).length === 0) {
                newErrors.selectedBuckets = 'Select at least one fee component'
            } else {
                const selectedBucketIds = formData.selectedBuckets || []
                const hasTerms = formData.terms && formData.terms.length > 0
                
                if (hasTerms && formData.termBucketAmounts) {
                    // Validate term-specific amounts
                    const hasValidAmounts = formData.terms.every(term => {
                        const termAmounts = formData.termBucketAmounts?.[term.id] || {}
                        return selectedBucketIds.some(bucketId => {
                            const bucket = termAmounts[bucketId] || formData.bucketAmounts[bucketId]
                            return bucket && bucket.amount > 0
                        })
                    })
                    if (!hasValidAmounts) {
                        newErrors.bucketAmounts = 'Enter amounts for at least one component in each term'
                    }
                } else {
                    // Validate global amounts
                    const hasValidAmounts = selectedBucketIds.every(bucketId => {
                        const bucket = formData.bucketAmounts[bucketId]
                        return bucket && bucket.amount > 0
                    })
                    if (!hasValidAmounts) {
                        newErrors.bucketAmounts = 'Enter amounts for all selected components'
                    }
                }
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length))
        }
    }

    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    const handleSave = async () => {
        setIsSaving(true)

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
                console.log('🔄 Updating fee structure:', {
                    structureId,
                    name: formData.name,
                    gradeLevelIds,
                    gradeLevelCount: gradeLevelIds.length,
                    selectedGrades: formData.selectedGrades
                })

                // Update the fee structure
                const updateInput: UpdateFeeStructureInput = {
                    name: formData.name,
                    isActive: true,
                    gradeLevelIds: gradeLevelIds
                }

                const updatedStructureId = await updateFeeStructure(structureId, updateInput)
                
                if (!updatedStructureId) {
                    throw new Error('Failed to update fee structure: No structure ID returned')
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
            let hasDifferentAmountsPerTerm = false
            if (hasTermSpecificAmounts && formData.terms && formData.terms.length > 1) {
                // Check if any bucket has different amounts across terms
                for (const bucketId of validBucketIds) {
                    const amounts = formData.terms.map(term => {
                        const termAmounts = formData.termBucketAmounts?.[term.id] || {}
                        const bucket = termAmounts[bucketId] || formData.bucketAmounts[bucketId]
                        return bucket?.amount || 0
                    })
                    
                    // Check if amounts differ
                    const firstAmount = amounts[0]
                    if (amounts.some(amt => amt !== firstAmount)) {
                        hasDifferentAmountsPerTerm = true
                        break
                    }
                }
            }
            
            if (hasDifferentAmountsPerTerm) {
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
                                amount: bucket.amount,
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
                        academicYearId: formData.academicYearId,
                        gradeLevelIds: gradeLevelIds,
                        items: termItems
                    })
                    
                    if (createdStructure) {
                        createdStructures.push(createdStructure)
                    } else {
                        throw new Error(`Failed to create fee structure for ${term.name}`)
                    }
                }
                
                if (createdStructures.length === 0) {
                    throw new Error('Failed to create any fee structures')
                }
                
                // Call the onSave callback with the first created structure
                await onSave({
                    id: createdStructures[0].id,
                    name: formData.name,
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
                                amount: bucket.amount,
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
                                amount: bucket.amount,
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
                    academicYearId: formData.academicYearId,
                    gradeLevelIds: gradeLevelIds,
                    items: allItems
                })

                if (!createdStructure) {
                    throw new Error('Failed to create fee structure')
                }

                // Call the onSave callback with the created structure data
                await onSave({
                    id: createdStructure.id,
                    name: createdStructure.name,
                    academicYear: formData.academicYear,
                    terms: formData.terms?.map(t => t.name).join(', ') || createdStructure.terms?.map((t: any) => t.name).join(', ') || '',
                    grades: formData.selectedGrades.join(', ')
                })
            }

            setShowSuccess(true)
            setTimeout(() => {
                setShowSuccess(false)
                onClose()
                setCurrentStep(1)
                setFormData({
                    name: '',
                    grade: '',
                    boardingType: 'day',
                    academicYear: new Date().getFullYear().toString(),
                    academicYearId: '',
                    selectedGrades: [],
                    selectedBuckets: [],
                    terms: [],
                    bucketAmounts: {},
                    termBucketAmounts: {}
                })
            }, 1500)
        } catch (error) {
            console.error('Failed to save:', error)
            alert(error instanceof Error ? error.message : 'Failed to create fee structure')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
                <SheetHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
                    <SheetTitle className="text-xl font-bold">
                        {isEditMode ? 'Edit Fee Structure' : 'Create Fee Structure'}
                    </SheetTitle>
                    <SheetDescription className="text-sm text-slate-600 mt-1">
                        {isEditMode ? 'Update fee structure details and components' : 'Set up fee components and amounts'}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-8">
                    <WizardProgress currentStep={currentStep} steps={steps} />

                    {isLoadingStructure ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-3 text-slate-600">Loading fee structure...</span>
                        </div>
                    ) : (
                        <div className="mt-10">
                            {currentStep === 1 && (
                                <Step1QuickSetup formData={formData} onChange={updateFormData} errors={errors} />
                            )}
                            {currentStep === 2 && (
                                <Step2Amounts formData={formData} onChange={updateFormData} errors={errors} />
                            )}
                            {currentStep === 3 && (
                                <Step3Review formData={formData} onChange={updateFormData} />
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-white flex items-center justify-between flex-shrink-0">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        size="sm"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={onClose} size="sm">Cancel</Button>

                        {currentStep < steps.length ? (
                            <Button
                                onClick={handleNext}
                                className="bg-primary hover:bg-primary-dark text-white"
                                size="sm"
                            >
                                Next
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-primary hover:bg-primary-dark text-white"
                                size="sm"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    isEditMode ? 'Update' : 'Create'
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Success */}
                {showSuccess && (
                    <div className="absolute inset-0 bg-white flex items-center justify-center z-50">
                        <div className="text-center">
                            <div className="text-6xl mb-3 animate-bounce">✓</div>
                            <div className="text-xl font-bold text-primary">Created!</div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

export default FeeStructureWizard
