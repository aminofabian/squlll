'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WizardProgressProps {
    currentStep: number
    steps: { number: number; title: string }[]
}

export const WizardProgress = ({ currentStep, steps }: WizardProgressProps) => {
    const progress = ((currentStep - 1) / (steps.length - 1)) * 100

    return (
        <div className="relative pb-6">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200">
                <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
                {steps.map((step) => {
                    const isCompleted = step.number < currentStep
                    const isCurrent = step.number === currentStep

                    return (
                        <div key={step.number} className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all font-semibold text-sm z-10",
                                    isCompleted && "bg-primary border-primary text-white",
                                    isCurrent && "bg-white border-primary text-primary ring-4 ring-primary/10",
                                    !isCompleted && !isCurrent && "bg-white border-slate-300 text-slate-400"
                                )}
                            >
                                {isCompleted ? <Check className="h-5 w-5" /> : step.number}
                            </div>

                            <div
                                className={cn(
                                    "mt-2 text-xs font-medium",
                                    isCurrent && "text-primary",
                                    isCompleted && "text-slate-700",
                                    !isCompleted && !isCurrent && "text-slate-400"
                                )}
                            >
                                {step.title}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
