'use client'

import React from 'react'
import { Check } from 'lucide-react'

interface Step {
  id: number
  name: string
  description: string
}

interface ProgressStepperProps {
  steps: Step[]
  currentStep: number
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <div className="flex flex-wrap gap-x-12 gap-y-5">
      {steps.map((step) => {
        const isActive = step.id === currentStep
        const isCompleted = step.id < currentStep
        return (
          <div key={step.id} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[0.5625rem] tabular-nums transition-colors ${
                isActive
                  ? 'border-[#1c3d32] bg-[#1c3d32] text-[#f7f4ec]'
                  : isCompleted
                    ? 'border-[#1c3d32]/25 text-[#1c3d32]'
                    : 'border-[#14201b]/15 text-[#14201b]/30'
              }`}
            >
              {isCompleted ? <Check className="h-2.5 w-2.5" strokeWidth={2.5} /> : String(step.id).padStart(2, '0')}
            </span>
            <div>
              <p
                className={`text-[0.75rem] leading-none transition-colors ${
                  isActive ? 'text-[#14201b]' : isCompleted ? 'text-[#4d574f]' : 'text-[#14201b]/40'
                }`}
              >
                {step.name}
              </p>
              <p className="mt-2 text-[0.625rem] leading-none text-[#7c857d]">
                {step.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
