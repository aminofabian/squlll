'use client'

import React from 'react'
import { Info, GraduationCap, Calendar, DollarSign, FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Import the Grade interface from fees types
import { Grade } from '../types'

// Define GradeLevel interface
interface GradeLevel {
  id: string
  name: string
  isActive?: boolean
}

interface AcademicYear {
  id: string
  name: string
  terms: Term[]
}

interface Term {
  id: string
  name: string
}

interface TermStructure {
  term: string
  academicYear: string
  academicYearId: string
  dueDate: string
  latePaymentFee: string
  earlyPaymentDiscount: string
  earlyPaymentDeadline: string
  buckets: FeeBucket[]
}

interface FeeBucket {
  type: string
  name: string
  description: string
  isOptional: boolean
  components: FeeComponent[]
}

interface FeeComponent {
  name: string
  description: string
  amount: string
  category: string
}

interface FeeStructureFormData {
  name: string
  academicYear: string
  boardingType: 'day' | 'boarding' | 'both'
  termStructures: TermStructure[]
}

// These types should match the ones in your FeeStructureDrawer component
interface FeeStructureStepProps {
  currentStep: number
  formData: FeeStructureFormData
  setFormData: React.Dispatch<React.SetStateAction<FeeStructureFormData>>
  academicYears: AcademicYear[]
  academicYearsLoading: boolean
  setShowCreateAcademicYearModal: React.Dispatch<React.SetStateAction<boolean>>
  handleBoardingTypeChange: (value: 'day' | 'boarding' | 'both') => void
  selectedGrades: string[]
  handleGradeToggle: (gradeId: string) => void
  availableGrades: Grade[]
  activeGradeTab: 'classes' | 'gradelevels'
  setActiveGradeTab: React.Dispatch<React.SetStateAction<'classes' | 'gradelevels'>>
  gradeLevels: GradeLevel[]
  isLoadingGradeLevels: boolean
  gradeLevelsError: Error | null
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
                {academicYears.map((year: AcademicYear) => (
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
            onValueChange={(value: 'day' | 'boarding' | 'both') => setFormData({...formData, boardingType: value})}
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
      
      <div className="mt-4">
        {/* Tab selection for grade levels vs classes */}
        <div className="border-b flex">
          <button 
            onClick={() => setActiveGradeTab('gradelevels')} 
            className={`px-4 py-2 font-medium text-sm ${activeGradeTab === 'gradelevels' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          >
            Grade Levels
          </button>
          <button 
            onClick={() => setActiveGradeTab('classes')} 
            className={`px-4 py-2 font-medium text-sm ${activeGradeTab === 'classes' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          >
            Classes
          </button>
        </div>

        {/* Grade selection content */}
        <div className="mt-4">
          {isLoadingGradeLevels ? (
            <div className="p-8 text-center text-gray-500">Loading available grades...</div>
          ) : gradeLevelsError ? (
            <div className="p-8 text-center text-red-500">Error loading grades: {String(gradeLevelsError)}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {activeGradeTab === 'gradelevels' ? (
                // Show grade levels
                gradeLevels.map((level: GradeLevel) => (
                  <div 
                    key={level.id} 
                    onClick={() => handleGradeToggle(level.id)} 
                    className={`
                      border rounded-lg p-3 text-center cursor-pointer transition-colors
                      ${selectedGrades.includes(level.id) 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-gray-50 border-gray-200'}
                    `}
                  >
                    <p className="font-medium">{level.name}</p>
                    {selectedGrades.includes(level.id) && (
                      <span className="text-xs text-primary mt-1 block">Selected</span>
                    )}
                  </div>
                ))
              ) : (
                // Show classes
                availableGrades.map((grade: Grade) => (
                  <div 
                    key={grade.id} 
                    onClick={() => handleGradeToggle(grade.id)} 
                    className={`
                      border rounded-lg p-3 text-center cursor-pointer transition-colors
                      ${selectedGrades.includes(grade.id) 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-gray-50 border-gray-200'}
                    `}
                  >
                    <p className="font-medium">{grade.name}</p>
                    <p className="text-xs text-gray-500">{grade.section}</p>
                    {selectedGrades.includes(grade.id) && (
                      <span className="text-xs text-primary mt-1 block">Selected</span>
                    )}
                  </div>
                ))
              )}
              
              {/* Show empty state if no grades are available */}
              {((activeGradeTab === 'gradelevels' && gradeLevels.length === 0) || 
                (activeGradeTab === 'classes' && availableGrades.length === 0)) && (
                <div className="col-span-full p-8 text-center text-gray-500 border border-dashed rounded-lg">
                  No {activeGradeTab === 'gradelevels' ? 'grade levels' : 'classes'} available. 
                  Please create some first in the school configuration.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected grades summary */}
        {selectedGrades.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800">Selected ({selectedGrades.length})</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedGrades.map((gradeId: string) => {
                // Find the grade in either availableGrades or gradeLevels
                const grade = activeGradeTab === 'classes'
                  ? availableGrades.find(g => g.id === gradeId)
                  : gradeLevels.find(g => g.id === gradeId);
                  
                return grade ? (
                  <div key={gradeId} className="bg-white border border-blue-200 rounded-full px-3 py-1 text-sm flex items-center gap-2">
                    {grade.name}
                    <button 
                      onClick={() => handleGradeToggle(gradeId)}
                      className="text-blue-500 hover:text-blue-700 font-bold text-xs"
                    >
                      ×
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const Step3_TermsSetup: React.FC<FeeStructureStepProps> = ({ 
  formData, 
  setFormData, 
  academicYears,
  academicYearsLoading
 }) => {
  // Debug academic years information
  console.log('Term Setup Step:', { 
    academicYears, 
    selectedYear: formData.academicYear, 
    formData 
  });
  
  // Find the currently selected academic year object
  const selectedAcademicYear = academicYears.find(year => year.name === formData.academicYear);
  
  // Get terms for the selected academic year
  const availableTerms = selectedAcademicYear?.terms || [];
  
  // Debug terms information
  console.log('Available terms:', { 
    selectedAcademicYear, 
    availableTerms, 
    termCount: availableTerms.length 
  });
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
      
      {/* Terms configuration */}
      <div className="mt-6 space-y-6">
        {/* Academic Year Selection - Read Only */}
        <div className="space-y-2">
          <Label htmlFor="academic-year" className="text-sm font-medium">Academic Year</Label>
          <div className="p-3 bg-gray-50 border rounded-md">
            <p className="text-sm">{formData.academicYear || 'No academic year selected'}</p>
            {selectedAcademicYear ? (
              <>
                <p className="text-xs text-gray-500 mt-1">
                  {availableTerms.length} term{availableTerms.length !== 1 ? 's' : ''} available • 
                  ID: {selectedAcademicYear.id.substring(0, 8)}...
                </p>
                {availableTerms.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {availableTerms.map(term => (
                      <span key={term.id} className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                        {term.name}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : academicYearsLoading ? (
              <p className="text-xs text-gray-500 mt-1">Loading academic years...</p>
            ) : (
              <p className="text-xs text-red-500 mt-1">Academic year not found in database</p>
            )}
          </div>
        </div>

        {/* Terms Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">Term Structure</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Add a new empty term structure
                // If there's only one available term that isn't yet used, pre-select it
                let termName = '';
                if (availableTerms.length === 1) {
                  termName = availableTerms[0].name;
                } else if (availableTerms.length > 1) {
                  // Find a term that isn't already used
                  const usedTerms = formData.termStructures.map(t => t.term);
                  const unusedTerm = availableTerms.find(t => !usedTerms.includes(t.name));
                  if (unusedTerm) {
                    termName = unusedTerm.name;
                  }
                }
                
                setFormData(prev => ({
                  ...prev,
                  termStructures: [...prev.termStructures, {
                    term: termName,
                    academicYear: prev.academicYear,
                    academicYearId: selectedAcademicYear?.id || '',
                    dueDate: '',
                    latePaymentFee: '0',
                    earlyPaymentDiscount: '0',
                    earlyPaymentDeadline: '',
                    buckets: [{
                      type: 'tuition',
                      name: 'Tuition Fees',
                      description: 'Core academic fees',
                      isOptional: false,
                      components: [{
                        name: 'Base Tuition',
                        description: 'Standard tuition fee',
                        amount: '0',
                        category: 'academic'
                      }]
                    }]
                  }]
                }));
              }}
            >
              Add Term
            </Button>
          </div>

          {formData.termStructures.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-lg">
              <p className="text-gray-500">No terms added yet. Click "Add Term" to create your first term.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.termStructures.map((term, index: number) => (
                <div key={index} className="border rounded-md p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Term {index + 1}</h4>
                    {formData.termStructures.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          // Remove this term
                          setFormData(prev => ({
                            ...prev,
                            termStructures: prev.termStructures.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Term Name */}
                    <div className="space-y-2">
                      <Label htmlFor={`term-${index}`} className="text-sm font-medium">Term Name</Label>
                      <Select 
                        value={term.term} 
                        onValueChange={(value) => {
                          const updatedTerms = [...formData.termStructures];
                          updatedTerms[index].term = value;
                          setFormData({...formData, termStructures: updatedTerms});
                        }}
                      >
                        <SelectTrigger id={`term-${index}`}>
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTerms.length > 0 ? (
                            availableTerms.map((termItem: Term) => (
                              <SelectItem key={termItem.id} value={termItem.name}>
                                {termItem.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>No terms available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                      <Label htmlFor={`due-date-${index}`} className="text-sm font-medium">Payment Due Date</Label>
                      <Input
                        type="date"
                        id={`due-date-${index}`}
                        value={term.dueDate}
                        onChange={(e) => {
                          const updatedTerms = [...formData.termStructures];
                          updatedTerms[index].dueDate = e.target.value;
                          setFormData({...formData, termStructures: updatedTerms});
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {/* Late Payment Fee */}
                    <div className="space-y-2">
                      <Label htmlFor={`late-fee-${index}`} className="text-sm font-medium">Late Payment Fee (KES)</Label>
                      <Input
                        type="number"
                        id={`late-fee-${index}`}
                        value={term.latePaymentFee}
                        onChange={(e) => {
                          const updatedTerms = [...formData.termStructures];
                          updatedTerms[index].latePaymentFee = e.target.value;
                          setFormData({...formData, termStructures: updatedTerms});
                        }}
                      />
                    </div>

                    {/* Early Payment Discount */}
                    <div className="space-y-2">
                      <Label htmlFor={`early-discount-${index}`} className="text-sm font-medium">Early Payment Discount (KES)</Label>
                      <Input
                        type="number"
                        id={`early-discount-${index}`}
                        value={term.earlyPaymentDiscount}
                        onChange={(e) => {
                          const updatedTerms = [...formData.termStructures];
                          updatedTerms[index].earlyPaymentDiscount = e.target.value;
                          setFormData({...formData, termStructures: updatedTerms});
                        }}
                      />
                    </div>
                  </div>

                  {/* Early Payment Deadline */}
                  {term.earlyPaymentDiscount && parseFloat(term.earlyPaymentDiscount) > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor={`early-deadline-${index}`} className="text-sm font-medium">Early Payment Deadline</Label>
                      <Input
                        type="date"
                        id={`early-deadline-${index}`}
                        value={term.earlyPaymentDeadline}
                        onChange={(e) => {
                          const updatedTerms = [...formData.termStructures];
                          updatedTerms[index].earlyPaymentDeadline = e.target.value;
                          setFormData({...formData, termStructures: updatedTerms});
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const Step4_FeeBuckets: React.FC<FeeStructureStepProps> = ({ formData, setFormData }) => {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-700">Fee Buckets</h4>
            <p className="text-sm text-blue-600 mt-1">
              Add fee buckets for each term:
            </p>
            <ul className="text-xs text-blue-600 mt-2 space-y-1 list-disc pl-4">
              <li><strong>Fee Buckets</strong> - Group related fees (e.g., Tuition, Transport)</li>
              <li><strong>Optional Fees</strong> - Mark buckets as optional if needed</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Fee components configuration */}
      <div className="mt-6 space-y-8">
        {formData.termStructures.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-lg">
            <p className="text-gray-500">Please set up terms in the previous step before configuring fee components.</p>
          </div>
        ) : (
          formData.termStructures.map((term: TermStructure, termIndex: number) => (
            <div key={termIndex} className="border rounded-lg p-4 space-y-5">
              <h3 className="text-lg font-medium text-gray-900">{term.term || `Term ${termIndex + 1}`}</h3>
              
              {/* Buckets section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-medium">Fee Buckets</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Add a new bucket to this term
                      const updatedTerms = [...formData.termStructures];
                      updatedTerms[termIndex].buckets.push({
                        type: 'tuition',
                        name: '',
                        description: '',
                        isOptional: false,
                        components: [
                          {
                            name: '',
                            description: '',
                            amount: '0',
                            category: 'academic'
                          }
                        ]
                      });
                      setFormData({...formData, termStructures: updatedTerms});
                    }}
                  >
                    Add Bucket
                  </Button>
                </div>
                
                {term.buckets.map((bucket, bucketIndex) => (
                  <div key={bucketIndex} className="border rounded-md p-4 space-y-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium">Bucket {bucketIndex + 1}</h5>
                      {term.buckets.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            // Remove this bucket
                            const updatedTerms = [...formData.termStructures];
                            updatedTerms[termIndex].buckets = updatedTerms[termIndex].buckets.filter((_, i) => i !== bucketIndex);
                            setFormData({...formData, termStructures: updatedTerms});
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bucket Name */}
                      <div className="space-y-2">
                        <Label htmlFor={`bucket-name-${termIndex}-${bucketIndex}`} className="text-sm font-medium">Bucket Name</Label>
                        <Input
                          id={`bucket-name-${termIndex}-${bucketIndex}`}
                          value={bucket.name}
                          placeholder="e.g. Tuition Fees"
                          onChange={(e) => {
                            const updatedTerms = [...formData.termStructures];
                            updatedTerms[termIndex].buckets[bucketIndex].name = e.target.value;
                            setFormData({...formData, termStructures: updatedTerms});
                          }}
                        />
                      </div>
                      
                      {/* Bucket Type */}
                      <div className="space-y-2">
                        <Label htmlFor={`bucket-type-${termIndex}-${bucketIndex}`} className="text-sm font-medium">Bucket Type</Label>
                        <Select 
                          value={bucket.type} 
                          onValueChange={(value: string) => {
                            const updatedTerms = [...formData.termStructures];
                            updatedTerms[termIndex].buckets[bucketIndex].type = value;
                            setFormData({...formData, termStructures: updatedTerms});
                          }}
                        >
                          <SelectTrigger id={`bucket-type-${termIndex}-${bucketIndex}`}>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tuition">Tuition</SelectItem>
                            <SelectItem value="transport">Transport</SelectItem>
                            <SelectItem value="meals">Meals</SelectItem>
                            <SelectItem value="boarding">Boarding</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Bucket Description */}
                    <div className="space-y-2">
                      <Label htmlFor={`bucket-desc-${termIndex}-${bucketIndex}`} className="text-sm font-medium">Description</Label>
                      <Input
                        id={`bucket-desc-${termIndex}-${bucketIndex}`}
                        value={bucket.description}
                        placeholder="Brief description of this fee bucket"
                        onChange={(e) => {
                          const updatedTerms = [...formData.termStructures];
                          updatedTerms[termIndex].buckets[bucketIndex].description = e.target.value;
                          setFormData({...formData, termStructures: updatedTerms});
                        }}
                      />
                    </div>
                    
                    {/* Optional checkbox */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`bucket-optional-${termIndex}-${bucketIndex}`}
                        checked={bucket.isOptional}
                        onChange={(e) => {
                          const updatedTerms = [...formData.termStructures];
                          updatedTerms[termIndex].buckets[bucketIndex].isOptional = e.target.checked;
                          setFormData({...formData, termStructures: updatedTerms});
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`bucket-optional-${termIndex}-${bucketIndex}`} className="text-sm">This fee bucket is optional</Label>
                    </div>
                    
                    <div className="p-2 rounded bg-blue-50 mt-2">
                      <p className="text-xs text-blue-600">Fee components for this bucket will be configured in the next step</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export const Step5_FeeComponents: React.FC<FeeStructureStepProps> = ({ formData, setFormData }) => {
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
              Add detailed fee components within each bucket:
            </p>
            <ul className="text-xs text-blue-600 mt-2 space-y-1 list-disc pl-4">
              <li><strong>Fee Components</strong> - Individual line items within buckets</li>
              <li><strong>Component Amounts</strong> - Set specific costs for each component</li>
              <li><strong>Categories</strong> - Organize components by category for reporting</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Fee components configuration */}
      <div className="mt-6 space-y-8">
        {formData.termStructures.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-lg">
            <p className="text-gray-500">Please set up terms and buckets in the previous steps before configuring fee components.</p>
          </div>
        ) : (
          formData.termStructures.map((term: TermStructure, termIndex: number) => (
            <div key={termIndex} className="border rounded-lg p-4 space-y-5">
              <h3 className="text-lg font-medium text-gray-900">{term.term || `Term ${termIndex + 1}`}</h3>
              
              {/* Go through each bucket */}
              {term.buckets.length === 0 ? (
                <div className="p-4 text-center border border-dashed rounded">
                  <p className="text-gray-500">No buckets found for this term. Please add buckets in the previous step.</p>
                </div>
              ) : (
                term.buckets.map((bucket: FeeBucket, bucketIndex: number) => (
                  <div key={bucketIndex} className="border rounded-md p-4 space-y-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium">{bucket.name || `Bucket ${bucketIndex + 1}`} ({bucket.type})</h5>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {bucket.isOptional ? 'Optional' : 'Required'}
                      </span>
                    </div>
                    
                    {/* Components section */}
                    <div className="pt-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h6 className="text-sm font-medium">Fee Components</h6>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            // Add a new component to this bucket
                            const updatedTerms = [...formData.termStructures];
                            updatedTerms[termIndex].buckets[bucketIndex].components.push({
                              name: '',
                              description: '',
                              amount: '0',
                              category: 'academic'
                            });
                            setFormData({...formData, termStructures: updatedTerms});
                          }}
                        >
                          Add Component
                        </Button>
                      </div>
                      
                      {bucket.components.length === 0 ? (
                        <div className="p-3 text-center border border-dashed rounded bg-white">
                          <p className="text-gray-500 text-sm">No components added yet. Click "Add Component" to create your first component.</p>
                        </div>
                      ) : (
                        bucket.components.map((component: FeeComponent, componentIndex: number) => (
                          <div key={componentIndex} className="border rounded p-3 bg-white space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">Component {componentIndex + 1}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 text-xs"
                                onClick={() => {
                                  // Remove this component
                                  const updatedTerms = [...formData.termStructures];
                                  updatedTerms[termIndex].buckets[bucketIndex].components = 
                                    updatedTerms[termIndex].buckets[bucketIndex].components.filter((_, i: number) => i !== componentIndex);
                                  setFormData({...formData, termStructures: updatedTerms});
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Component Name */}
                              <div className="space-y-1">
                                <Label htmlFor={`comp-name-${termIndex}-${bucketIndex}-${componentIndex}`} className="text-xs">Name</Label>
                                <Input
                                  id={`comp-name-${termIndex}-${bucketIndex}-${componentIndex}`}
                                  value={component.name}
                                  placeholder="e.g. Base Tuition"
                                  className="h-8 text-sm"
                                  onChange={(e) => {
                                    const updatedTerms = [...formData.termStructures];
                                    updatedTerms[termIndex].buckets[bucketIndex].components[componentIndex].name = e.target.value;
                                    setFormData({...formData, termStructures: updatedTerms});
                                  }}
                                />
                              </div>
                              
                              {/* Component Amount */}
                              <div className="space-y-1">
                                <Label htmlFor={`comp-amount-${termIndex}-${bucketIndex}-${componentIndex}`} className="text-xs">Amount (KES)</Label>
                                <Input
                                  id={`comp-amount-${termIndex}-${bucketIndex}-${componentIndex}`}
                                  type="number"
                                  value={component.amount}
                                  className="h-8 text-sm"
                                  onChange={(e) => {
                                    const updatedTerms = [...formData.termStructures];
                                    updatedTerms[termIndex].buckets[bucketIndex].components[componentIndex].amount = e.target.value;
                                    setFormData({...formData, termStructures: updatedTerms});
                                  }}
                                />
                              </div>
                            </div>
                            
                            {/* Component Description */}
                            <div className="space-y-1">
                              <Label htmlFor={`comp-desc-${termIndex}-${bucketIndex}-${componentIndex}`} className="text-xs">Description</Label>
                              <Input
                                id={`comp-desc-${termIndex}-${bucketIndex}-${componentIndex}`}
                                value={component.description}
                                placeholder="Brief description of this fee component"
                                className="h-8 text-sm"
                                onChange={(e) => {
                                  const updatedTerms = [...formData.termStructures];
                                  updatedTerms[termIndex].buckets[bucketIndex].components[componentIndex].description = e.target.value;
                                  setFormData({...formData, termStructures: updatedTerms});
                                }}
                              />
                            </div>
                            
                            {/* Component Category */}
                            <div className="space-y-1">
                              <Label htmlFor={`comp-category-${termIndex}-${bucketIndex}-${componentIndex}`} className="text-xs">Category</Label>
                              <Select 
                                value={component.category} 
                                onValueChange={(value: string) => {
                                  const updatedTerms = [...formData.termStructures];
                                  updatedTerms[termIndex].buckets[bucketIndex].components[componentIndex].category = value;
                                  setFormData({...formData, termStructures: updatedTerms});
                                }}
                              >
                                <SelectTrigger id={`comp-category-${termIndex}-${bucketIndex}-${componentIndex}`} className="h-8 text-sm">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="academic">Academic</SelectItem>
                                  <SelectItem value="activities">Activities</SelectItem>
                                  <SelectItem value="assessment">Assessment</SelectItem>
                                  <SelectItem value="transport">Transport</SelectItem>
                                  <SelectItem value="meals">Meals</SelectItem>
                                  <SelectItem value="accommodation">Accommodation</SelectItem>
                                  <SelectItem value="utilities">Utilities</SelectItem>
                                  <SelectItem value="special_programs">Special Programs</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export const Step6_Review: React.FC<FeeStructureStepProps> = ({ formData, setFormData }) => {
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
      return <Step4_FeeBuckets {...props} currentStep={currentStep} />
    case 5:
      return <Step5_FeeComponents {...props} currentStep={currentStep} />
    case 6:
      return <Step6_Review {...props} currentStep={currentStep} />
    default:
      return <Step1_BasicInfo {...props} currentStep={currentStep} />
  }
}
