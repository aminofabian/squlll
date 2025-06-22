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
  currentStep
}) => {
  return (
    <div className="mb-8">
      <div className="py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = step.id < currentStep
            return (
              <div key={step.id} className="flex-1 relative">
                <div className="flex items-center justify-center">
                  {/* Line before */}
                  {index > 0 && (
                    <div 
                      className={`absolute left-0 right-1/2 top-1/2 h-0.5 -translate-y-1/2 transition-colors duration-300 ${isCompleted ? 'bg-[#246a59]' : 'bg-gray-200'}`}
                    aria-hidden="true"
                    style={{ zIndex: 0 }}
                    />
                  )}
                  {/* Line after */}
                  {index < steps.length - 1 && (
                    <div 
                      className={`absolute left-1/2 right-0 top-1/2 h-0.5 -translate-y-1/2 transition-colors duration-300 ${step.id < currentStep ? 'bg-[#246a59]' : 'bg-gray-200'}`}
                      aria-hidden="true"
                      style={{ zIndex: 0 }}
                    />
                  )}
                  {/* Step circle */}
                  <div 
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${isActive ? 'border-[#246a59] bg-[#246a59]/10 shadow-md' : isCompleted ? 'border-[#246a59] bg-[#246a59] text-white' : 'border-gray-300 bg-white'}`}
                    style={{ zIndex: 1 }}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className={`text-sm font-medium ${isActive ? 'text-[#246a59]' : 'text-gray-500'}`}>{step.id}</span>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${isActive ? 'text-[#246a59]' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>{step.name}</div>
                  <div className="text-xs text-gray-500 hidden sm:block">{step.description}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
