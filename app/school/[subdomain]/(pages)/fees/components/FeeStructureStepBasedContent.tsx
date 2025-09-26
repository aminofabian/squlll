'use client'

import React from 'react'
import { Info, GraduationCap, Calendar, DollarSign, FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// These types should match the ones in your FeeStructureDrawer component
interface FeeStructureStepProps {
  currentStep: number
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
  academicYears: any[]
  academicYearsLoading: boolean
  setShowCreateAcademicYearModal: React.Dispatch<React.SetStateAction<boolean>>
  handleBoardingTypeChange: (value: 'day' | 'boarding' | 'both') => void
  selectedGrades: string[]
  handleGradeToggle: (gradeId: string) => void
  availableGrades: any[]
  activeGradeTab: 'classes' | 'gradelevels'
  setActiveGradeTab: React.Dispatch<React.SetStateAction<'classes' | 'gradelevels'>>
  gradeLevels: any[]
  isLoadingGradeLevels: boolean
  gradeLevelsError: any
}

export const Step1_BasicInfo: React.FC<FeeStructureStepProps> = ({ 
  formData, 
  setFormData, 
  academicYears, 
  academicYearsLoading,
  setShowCreateAcademicYearModal
}) => {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-700">Getting Started</h4>
            <p className="text-sm text-blue-600 mt-1">
              Start by providing basic information about your fee structure:
            </p>
            <ul className="text-xs text-blue-600 mt-2 space-y-1 list-disc pl-4">
              <li><strong>Name</strong> - Give your fee structure a descriptive name</li>
              <li><strong>Academic Year</strong> - Select the academic year for this fee structure</li>
              <li><strong>Boarding Type</strong> - Specify if this is for boarding, day school, or both</li>
            </ul>
            {academicYears.length === 0 && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-xs">
                <p className="font-medium">No academic years found!</p>
                <p className="mt-1">Please create an academic year using the "Create Year" button.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 px-2 text-xs border-amber-300 bg-amber-100/50"
                  onClick={() => setShowCreateAcademicYearModal(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Create Academic Year
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-5 mt-8">
        <div className="space-y-2">
          <Label htmlFor="fee-structure-name" className="text-sm font-medium">Fee Structure Name</Label>
          <Input 
            id="fee-structure-name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. Grade 7 Day School Fees 2025-2026"
            className="max-w-lg"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="main-academic-year" className="text-sm font-medium">Academic Year</Label>
          <div className="flex gap-2 items-center">
            <Select
              value={formData.academicYear}
              onValueChange={(value) => setFormData({...formData, academicYear: value})}
              disabled={academicYearsLoading || academicYears.length === 0}
            >
              <SelectTrigger id="main-academic-year" className="w-[280px]">
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.name}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm"
              className="border-green-200 text-green-600 hover:bg-green-50"
              onClick={() => setShowCreateAcademicYearModal(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Create Year
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="boarding-type" className="text-sm font-medium">Boarding Type</Label>
          <Select
            value={formData.boardingType}
            onValueChange={(value) => setFormData({...formData, boardingType: value})}
          >
            <SelectTrigger id="boarding-type" className="w-[280px]">
              <SelectValue placeholder="Select boarding type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day School Only</SelectItem>
              <SelectItem value="boarding">Boarding School Only</SelectItem>
              <SelectItem value="both">Both Day & Boarding</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export const Step2_GradeSelection: React.FC<FeeStructureStepProps> = ({
  selectedGrades,
  handleGradeToggle,
  availableGrades,
  activeGradeTab,
  setActiveGradeTab,
  gradeLevels,
  isLoadingGradeLevels,
  gradeLevelsError
}) => {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-700">Grade Selection</h4>
            <p className="text-sm text-blue-600 mt-1">
              Select which grades or grade levels this fee structure applies to:
            </p>
            <ul className="text-xs text-blue-600 mt-2 space-y-1 list-disc pl-4">
              <li><strong>Grade Levels</strong> - Higher-level grade categories (e.g., Grade 1, Grade 2)</li>
              <li><strong>Classes</strong> - Specific class sections within grades (e.g., Grade 1A, Grade 1B)</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              You can select multiple items across both tabs to create fee structures for multiple grades at once.
            </p>
          </div>
        </div>
      </div>
      
      {/* Grade selection interface would go here */}
      <div className="mt-4">
        {/* Tab selection would go here - implemented in the parent component */}
      </div>
    </div>
  )
}

export const Step3_TermsSetup: React.FC<FeeStructureStepProps> = ({ formData, setFormData }) => {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-700">Terms Setup</h4>
            <p className="text-sm text-blue-600 mt-1">
              Configure the terms for this fee structure:
            </p>
            <ul className="text-xs text-blue-600 mt-2 space-y-1 list-disc pl-4">
              <li><strong>Add Terms</strong> - You must add at least one term</li>
              <li><strong>Set Due Dates</strong> - When payments are expected</li>
              <li><strong>Late Payment Fees</strong> - Optional penalties for late payments</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Terms configuration would go here */}
    </div>
  )
}

export const Step4_FeeComponents: React.FC<FeeStructureStepProps> = ({ formData, setFormData }) => {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-700">Fee Components</h4>
            <p className="text-sm text-blue-600 mt-1">
              Add fee buckets and components for each term:
            </p>
            <ul className="text-xs text-blue-600 mt-2 space-y-1 list-disc pl-4">
              <li><strong>Fee Buckets</strong> - Group related fees (e.g., Tuition, Transport)</li>
              <li><strong>Fee Components</strong> - Individual line items within buckets</li>
              <li><strong>Optional Fees</strong> - Mark buckets as optional if needed</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Fee components configuration would go here */}
    </div>
  )
}

export const Step5_Review: React.FC<FeeStructureStepProps> = ({ formData, setFormData }) => {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-700">Review Fee Structure</h4>
            <p className="text-sm text-blue-600 mt-1">
              Review all details before saving:
            </p>
            <ul className="text-xs text-blue-600 mt-2 space-y-1 list-disc pl-4">
              <li>Verify all amounts are correctly entered</li>
              <li>Ensure all required fields are filled</li>
              <li>Check that all terms and fee buckets are set up</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Review summary would go here */}
    </div>
  )
}

export default function FeeStructureStepContent({ 
  currentStep,
  ...props 
}: FeeStructureStepProps) {
  switch (currentStep) {
    case 1:
      return <Step1_BasicInfo {...props} currentStep={currentStep} />
    case 2:
      return <Step2_GradeSelection {...props} currentStep={currentStep} />
    case 3:
      return <Step3_TermsSetup {...props} currentStep={currentStep} />
    case 4:
      return <Step4_FeeComponents {...props} currentStep={currentStep} />
    case 5:
      return <Step5_Review {...props} currentStep={currentStep} />
    default:
      return <Step1_BasicInfo {...props} currentStep={currentStep} />
  }
}
