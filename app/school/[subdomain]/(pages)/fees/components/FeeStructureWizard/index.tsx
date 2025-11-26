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
            const feeStructureData = {
                name: formData.name,
                grade: formData.grade,
                boardingType: formData.boardingType,
                academicYear: formData.academicYear,
                termStructures: [{
                    term: 'Term 1' as const,
                    dueDate: '',
                    latePaymentFee: '',
                    earlyPaymentDiscount: '',
                    earlyPaymentDeadline: '',
                    buckets: Object.values(formData.bucketAmounts).map(bucket => ({
                        type: bucket.id as any,
                        name: bucket.name,
                        description: bucket.name,
                        isOptional: !bucket.isMandatory,
                        components: [{
                            name: bucket.name,
                            description: '',
                            amount: bucket.amount.toString(),
                            category: bucket.id
                        }]
                    }))
                }]
            }

            await onSave(feeStructureData)

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
