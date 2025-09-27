'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DrawerFooterProps {
  currentStep: number
  totalSteps: number
  isCurrentStepValid: boolean
  validationErrors: any[]
  selectedGrades: string[]
  goToPrevStep: () => void
  goToNextStep: () => void
  onClose: () => void
  onSave: () => void
  steps: { id: number; title: string }[]
  isLoading?: boolean
  error?: string | null
}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({
  currentStep,
  totalSteps,
  isCurrentStepValid,
  validationErrors,
  selectedGrades,
  goToPrevStep,
  goToNextStep,
  onClose,
  onSave,
  steps,
  isLoading = false,
  error = null
}) => {
  return (
    <div className="border-t border-slate-200 p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between bg-white shadow-md gap-3 sm:gap-0">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              onClick={goToPrevStep}
              size="sm"
              className="flex items-center gap-1 sm:gap-2 border-slate-300 hover:bg-slate-100 transition-colors duration-200 h-8 sm:h-9 text-xs sm:text-sm"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Back</span>
            </Button>
          )}
          
          <div className="flex flex-row sm:flex-col text-xs sm:text-sm items-center sm:items-start">
            <div className="flex items-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 text-primary flex items-center justify-center text-[10px] sm:text-xs font-medium mr-1 sm:mr-2">
                {currentStep}
              </div>
              <span className="text-slate-700 font-medium">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            {selectedGrades.length > 0 && (
              <span className="text-[10px] sm:text-xs text-slate-500 sm:mt-0.5 ml-2 sm:ml-0">
                Will create {selectedGrades.length} fee structure{selectedGrades.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        
        {error && (
          <div className="text-xs text-red-600 max-w-[200px] sm:max-w-xs truncate">
            Error: {error}
          </div>
        )}
      </div>
      
      <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
        <Button 
          variant="outline" 
          onClick={onClose}
          size="sm"
          className="border-slate-300 hover:bg-slate-100 transition-colors duration-200 h-9 text-xs sm:text-sm flex-1 sm:flex-initial"
        >
          Cancel
        </Button>
        
        {currentStep < totalSteps ? (
          <Button 
            onClick={goToNextStep}
            disabled={!isCurrentStepValid}
            size="sm"
            className="flex items-center justify-center gap-1 sm:gap-2 bg-primary hover:bg-primary/90 text-white transition-colors duration-200 shadow-sm hover:shadow h-9 text-xs sm:text-sm flex-1 sm:flex-initial"
          >
            <span className="truncate">Continue to {steps[currentStep].title}</span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          </Button>
        ) : (
          <Button 
            onClick={onSave}
            disabled={validationErrors.length > 0 || isLoading}
            size="sm"
            className="flex items-center justify-center gap-1 sm:gap-2 bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 shadow-sm hover:shadow h-9 text-xs sm:text-sm flex-1 sm:flex-initial"
          >
            {isLoading ? (
              <>
                <span className="inline-block h-3 w-3 sm:h-4 sm:w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Save Fee Structure</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
