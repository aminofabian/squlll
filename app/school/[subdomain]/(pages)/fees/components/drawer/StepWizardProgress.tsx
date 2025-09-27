'use client'

import React from 'react'
import { CheckCircle } from "lucide-react"

interface Step {
  id: number
  title: string
  description: string
  icon: React.ElementType
}

interface StepWizardProgressProps {
  steps: Step[]
  currentStep: number
  goToStep: (step: number) => void
}

export const StepWizardProgress: React.FC<StepWizardProgressProps> = ({
  steps,
  currentStep,
  goToStep
}) => {
  return (
    <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id
        const isCompleted = currentStep > step.id
        const StepIcon = step.icon
        
        return (
          <React.Fragment key={step.id}>
            {index > 0 && (
              <div className={`w-6 sm:w-10 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-primary/30'} hidden sm:block`}></div>
            )}
            <button
              type="button"
              onClick={() => goToStep(step.id)}
              className={`flex items-center gap-2 sm:gap-3 group ${isActive ? 'text-primary' : isCompleted ? 'text-green-700' : 'text-slate-500'} hover:text-primary transition-colors duration-200`}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs font-semibold shadow-md transition-all duration-200
                ${isActive ? 'bg-primary text-white ring-2 sm:ring-4 ring-primary/20' : 
                  isCompleted ? 'bg-green-600 text-white' : 
                  'bg-white border-2 border-primary/30 text-primary/70 group-hover:border-primary/50 group-hover:shadow-lg'}
              `}>
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </div>
              <div className="flex flex-col hidden sm:block">
                <span className="text-sm font-bold tracking-wide">{step.title}</span>
                <span className="text-xs text-slate-500 group-hover:text-primary/70 transition-colors">{step.description}</span>
              </div>
              <span className="text-xs font-medium sm:hidden">{step.title}</span>
            </button>
          </React.Fragment>
        )
      })}
    </div>
  )
}
