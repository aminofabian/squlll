'use client'

import React, { useState, useMemo } from 'react'
import { FileText, GraduationCap, Calendar, DollarSign, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeeStructureForm } from '../../types'

export interface Step {
  id: number
  title: string
  description: string
  icon: React.FC<{ className?: string }>
}

interface StepWizardProps {
  currentStep: number
  totalSteps: number
  onNextStep: () => void
  onPrevStep: () => void
  isCurrentStepValid: boolean
  formData: FeeStructureForm
  selectedGrades: string[]
  onClose: () => void
  onSave: () => void
  validationErrors: { message: string; anchorId?: string }[]
}

export const steps: Step[] = [
  { id: 1, title: 'Basic Info', description: 'Name, academic year & type', icon: FileText },
  { id: 2, title: 'Grades', description: 'Select applicable grades', icon: GraduationCap },
  { id: 3, title: 'Terms', description: 'Configure academic terms', icon: Calendar },
  { id: 4, title: 'Buckets', description: 'Create fee categories', icon: DollarSign },
  { id: 5, title: 'Components', description: 'Add detailed fee items', icon: DollarSign },
  { id: 6, title: 'Review', description: 'Preview & finalize', icon: CheckCircle },
]

export const StepWizard: React.FC<StepWizardProps> = ({
  currentStep,
  totalSteps,
  onNextStep,
  onPrevStep,
  isCurrentStepValid,
  formData,
  selectedGrades,
  onClose,
  onSave,
  validationErrors
}) => {
  // Step indicators display
  const renderStepIndicators = () => {
    return (
      <div className="mb-6 px-4">
        {/* Progress bar */}
        <div className="relative mb-4">
          <div className="h-1 bg-gray-200 w-full absolute rounded"></div>
          <div 
            className="h-1 bg-primary absolute rounded transition-all duration-300" 
            style={{ width: `${(currentStep - 1) / (totalSteps - 1) * 100}%` }}
          ></div>
        </div>
        
        {/* Step indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step) => {
            const StepIcon = step.icon
            const isActive = step.id === currentStep
            const isPast = step.id < currentStep
            
            return (
              <div key={step.id} className="flex flex-col items-center group relative">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all
                    ${isActive ? 'bg-primary text-white shadow-md' : 
                      isPast ? 'bg-primary/20 text-primary border border-primary/30' : 
                      'bg-gray-200 text-gray-500'}
                  `}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                  {step.title}
                </span>
                
                {/* Tooltip with description - show on hover */}
                <div className="absolute bottom-full mb-2 w-32 bg-gray-800 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                  {step.description}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Step navigation footer
  return (
    <>
      {/* Step indicators at the top */}
      {renderStepIndicators()}

      {/* Footer with step navigation - this will be rendered at the bottom of the drawer */}
      <div className="border-t border-primary/20 p-6 flex items-center justify-between bg-primary/5">
        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              onClick={onPrevStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          
          <div className="text-sm text-slate-600">
            {selectedGrades.length > 0 && (
              <span>Will create {selectedGrades.length} fee structure(s)</span>
            )}
            <span className="ml-2 text-primary">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          {currentStep < totalSteps ? (
            <Button 
              onClick={onNextStep}
              disabled={!isCurrentStepValid}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={onSave}
              disabled={validationErrors.length > 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Fee Structure
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
