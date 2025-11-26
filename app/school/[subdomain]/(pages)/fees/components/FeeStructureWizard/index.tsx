'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { WizardProgress } from './WizardProgress'
import { Step1QuickSetup } from './steps/Step1QuickSetup'
import { Step2Amounts } from './steps/Step2Amounts'
import { Step3Review } from './steps/Step3Review'
import { useGraphQLFeeStructures } from '../../hooks/useGraphQLFeeStructures'

interface FeeStructureWizardProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => void
}

const steps = [
    { number: 1, title: 'Setup' },
    { number: 2, title: 'Amounts' },
    { number: 3, title: 'Review' }
]

export const FeeStructureWizard = ({ isOpen, onClose, onSave }: FeeStructureWizardProps) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [isSaving, setIsSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const { createFeeStructureWithItems } = useGraphQLFeeStructures()

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
                    const termItems: Array<{ feeBucketId: string; amount: number; isMandatory: boolean }> = []
                    const usedBucketIds = new Set<string>()
                    
                    validBucketIds.forEach(bucketId => {
                        if (usedBucketIds.has(bucketId)) return // Skip duplicates
                        
                        const bucket = termAmounts[bucketId] || formData.bucketAmounts[bucketId]
                        if (bucket && bucket.amount > 0) {
                            termItems.push({
                                feeBucketId: bucketId,
                                amount: bucket.amount,
                                isMandatory: bucket.isMandatory
                            })
                            usedBucketIds.add(bucketId)
                        }
                    })
                    
                    if (termItems.length === 0) {
                        console.warn(`No items with amounts > 0 for ${term.name}, skipping`)
                        continue
                    }
                    
                    // Create fee structure for this term
                    const termStructureName = `${formData.name} - ${term.name}`
                    console.log(`Creating fee structure for ${term.name}:`, {
                        name: termStructureName,
                        academicYearId: formData.academicYearId,
                        termIds: [term.id],
                        gradeLevelIds,
                        itemsCount: termItems.length
                    })
                    
                    const createdStructure = await createFeeStructureWithItems({
                        name: termStructureName,
                        academicYearId: formData.academicYearId,
                        termIds: [term.id], // Only this term
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
                    terms: formData.terms.map(t => t.name).join(', '),
                    grades: formData.selectedGrades.join(', ')
                })
            } else {
                // All terms have the same amounts (or only one term) - create one structure for all terms
                let allItems: Array<{ feeBucketId: string; amount: number; isMandatory: boolean }> = []
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
                                isMandatory: bucket.isMandatory
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
                                isMandatory: bucket.isMandatory
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
                        isMandatory: item.isMandatory
                    }))
                })

                // Create the fee structure using GraphQL
                const createdStructure = await createFeeStructureWithItems({
                    name: formData.name,
                    academicYearId: formData.academicYearId,
                    termIds: termIds,
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
                    terms: formData.terms.map(t => t.name).join(', '),
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
                    <SheetTitle className="text-xl font-bold">Create Fee Structure</SheetTitle>
                    <SheetDescription className="text-sm text-slate-600 mt-1">
                        Set up fee components and amounts
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-8">
                    <WizardProgress currentStep={currentStep} steps={steps} />

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
                                    'Create'
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
