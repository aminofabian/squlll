'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { WizardProgress } from './WizardProgress'
import { Step1QuickSetup } from './steps/Step1QuickSetup'
import { Step2Amounts } from './steps/Step2Amounts'
import { Step3Review } from './steps/Step3Review'

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
    const [saveError, setSaveError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        boardingType: 'day' as 'day' | 'boarding' | 'both',
        academicYear: new Date().getFullYear().toString(),
        selectedGrades: [] as string[],
        selectedBuckets: [] as string[],
        bucketAmounts: {} as Record<string, { id: string; name: string; amount: number; isMandatory: boolean }>
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
                const hasValidAmounts = selectedBucketIds.every(bucketId => {
                    const bucket = formData.bucketAmounts[bucketId]
                    return bucket && bucket.amount > 0
                })
                if (!hasValidAmounts) {
                    newErrors.bucketAmounts = 'Enter amounts for all selected components'
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
            // Step 1: Fetch academic years to get the academic year ID
            const academicYearsResponse = await fetch('/api/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
                        query GetAcademicYears {
                            academicYears {
                                id
                                name
                                terms {
                                    id
                                    name
                                }
                            }
                        }
                    `
                })
            })

            const academicYearsResult = await academicYearsResponse.json()
            if (academicYearsResult.errors) {
                throw new Error(academicYearsResult.errors[0]?.message || 'Failed to fetch academic years')
            }

            // Find the academic year by name
            const academicYear = academicYearsResult.data.academicYears.find(
                (ay: any) => ay.name === formData.academicYear || ay.name.includes(formData.academicYear)
            )

            if (!academicYear) {
                throw new Error(`Academic year "${formData.academicYear}" not found`)
            }

            // Get all term IDs for this academic year
            const termIds = academicYear.terms.map((term: any) => term.id)
            if (termIds.length === 0) {
                throw new Error(`No terms found for academic year "${formData.academicYear}"`)
            }

            // Step 2: Fetch grades to get grade level IDs
            const gradesResponse = await fetch('/api/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
                        query GetGrades {
                            grades {
                                id
                                name
                                gradeLevel {
                                    id
                                }
                            }
                        }
                    `
                })
            })

            const gradesResult = await gradesResponse.json()
            if (gradesResult.errors) {
                throw new Error(gradesResult.errors[0]?.message || 'Failed to fetch grades')
            }

            // Map selected grade names to grade level IDs
            const gradeLevelIds: string[] = []
            const missingGrades: string[] = []
            
            formData.selectedGrades.forEach((gradeName: string) => {
                const grade = gradesResult.data.grades.find((g: any) => 
                    g.name === gradeName || g.name.includes(gradeName) || gradeName.includes(g.name)
                )
                if (grade?.gradeLevel?.id) {
                    gradeLevelIds.push(grade.gradeLevel.id)
                } else {
                    missingGrades.push(gradeName)
                }
            })

            if (gradeLevelIds.length === 0) {
                throw new Error(
                    missingGrades.length > 0 
                        ? `No valid grade levels found for: ${missingGrades.join(', ')}`
                        : 'No valid grade levels found for selected grades'
                )
            }
            
            if (missingGrades.length > 0 && gradeLevelIds.length > 0) {
                console.warn(`Some grades could not be mapped: ${missingGrades.join(', ')}`)
            }

            // Step 3: Create fee structure items from bucket amounts
            const items = formData.selectedBuckets.map((bucketId: string) => {
                const bucket = formData.bucketAmounts[bucketId]
                if (!bucket) {
                    throw new Error(`Bucket data missing for ${bucketId}`)
                }
                return {
                    feeBucketId: bucketId,
                    amount: bucket.amount,
                    isMandatory: bucket.isMandatory
                }
            })

            // Step 4: Create the fee structure via GraphQL
            const createResponse = await fetch('/api/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
                        mutation CreateFeeStructureWithItems($input: CreateFeeStructureWithItemsInput!) {
                            createFeeStructureWithItems(input: $input) {
                                id
                                name
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
                    variables: {
                        input: {
                            name: formData.name,
                            academicYearId: academicYear.id,
                            termIds: termIds,
                            gradeLevelIds: gradeLevelIds,
                            items: items
                        }
                    }
                })
            })

            const createResult = await createResponse.json()
            if (createResult.errors) {
                throw new Error(createResult.errors[0]?.message || 'Failed to create fee structure')
            }

            if (!createResult.data?.createFeeStructureWithItems) {
                throw new Error('Failed to create fee structure')
            }

            // Call the parent's onSave callback
            await onSave({
                name: formData.name,
                grade: formData.selectedGrades.join(', '),
                boardingType: formData.boardingType,
                academicYear: formData.academicYear,
                termStructures: []
            })

            setSaveError(null)
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
                    selectedGrades: [],
                    selectedBuckets: [],
                    bucketAmounts: {}
                })
            }, 1500)
        } catch (error) {
            console.error('Failed to save:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to create fee structure'
            setSaveError(errorMessage)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
                <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
                    <h2 className="text-xl font-bold">Create Fee Structure</h2>
                    <p className="text-sm text-slate-600 mt-1">Set up fee components and amounts</p>
                </div>

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
                    
                    {/* Error Message */}
                    {saveError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600 font-medium">Error creating fee structure</p>
                            <p className="text-xs text-red-500 mt-1">{saveError}</p>
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
