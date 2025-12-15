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
    <div className="mb-3">
      <div className="py-1.5">
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
                      className={`absolute left-0 right-1/2 top-1/2 h-[1.5px] -translate-y-1/2 transition-colors duration-150 ${isCompleted ? 'bg-[#246a59]' : 'bg-gray-200'}`}
                      aria-hidden="true"
                      style={{ zIndex: 0 }}
                    />
                  )}
                  {/* Line after */}
                  {index < steps.length - 1 && (
                    <div 
                      className={`absolute left-1/2 right-0 top-1/2 h-[1.5px] -translate-y-1/2 transition-colors duration-150 ${step.id < currentStep ? 'bg-[#246a59]' : 'bg-gray-200'}`}
                      aria-hidden="true"
                      style={{ zIndex: 0 }}
                    />
                  )}
                  {/* Step circle */}
                  <div 
                    className={`relative flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-150 ${isActive ? 'border-[#246a59] bg-[#246a59]/10 shadow-sm' : isCompleted ? 'border-[#246a59] bg-[#246a59] text-white' : 'border-gray-300 bg-white'}`}
                    style={{ zIndex: 1 }}
                  >
                    {isCompleted ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className={`text-[10px] font-bold ${isActive ? 'text-[#246a59]' : 'text-gray-500'}`}>{step.id}</span>
                    )}
                  </div>
                </div>
                <div className="mt-1 text-center">
                  <div className={`text-[10px] font-semibold ${isActive ? 'text-[#246a59]' : isCompleted ? 'text-gray-700' : 'text-gray-500'}`}>{step.name}</div>
                  <div className="text-[9px] text-gray-500 hidden sm:block mt-0.5">{step.description}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
