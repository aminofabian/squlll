'use client'

import React from 'react'
import { Info, GraduationCap, Calendar, Coins, FileText, Plus, X, Badge} from "lucide-react"
import { Step4_FeeComponents as OriginalStep4_FeeComponents } from './Step4_FeeComponents'
import { FeeStructurePDFPreview } from './FeeStructurePDFPreview'
import { useFeeBuckets } from '@/lib/hooks/useFeeBuckets'
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
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="mt-1 bg-white p-2 rounded-full shadow-sm border border-blue-200">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-800">Getting Started</h4>
            <p className="text-sm text-blue-700 mt-1">
              Start by providing basic information about your fee structure:
            </p>
            <ul className="text-xs text-blue-600 mt-3 space-y-2 list-none pl-0">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">1</span>
                </div>
                <span><strong className="text-blue-700">Name</strong> - Give your fee structure a descriptive name</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">2</span>
                </div>
                <span><strong className="text-blue-700">Academic Year</strong> - Select the academic year for this fee structure</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">3</span>
                </div>
                <span><strong className="text-blue-700">Boarding Type</strong> - Specify if this is for boarding, day school, or both</span>
              </li>
            </ul>
            {academicYears.length === 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-xs">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-amber-100 rounded-full">
                    <Info className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">No academic years found!</p>
                    <p className="mt-1">Please create an academic year using the "Create Year" button.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 h-7 px-2 text-xs border-amber-300 bg-amber-100/50 hover:bg-amber-100 transition-colors shadow-sm"
                      onClick={() => setShowCreateAcademicYearModal(true)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Create Academic Year
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-8 mt-8 bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="fee-structure-name" className="text-sm font-medium flex items-center gap-2 mb-2 text-slate-700">
            <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary font-bold">1</div>
            <span>Fee Structure Name</span>
          </Label>
          <Input 
            id="fee-structure-name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. Grade 7 Day School Fees 2025-2026"
            className="max-w-lg transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 shadow-sm"
          />
          <p className="text-xs text-slate-500 mt-1 ml-1">Enter a descriptive name that identifies this fee structure clearly</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="main-academic-year" className="text-sm font-medium flex items-center gap-2 mb-2 text-slate-700">
            <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary font-bold">2</div>
            <span>Academic Year</span>
          </Label>
          <div className="flex gap-2 items-center">
            <Select
              value={formData.academicYear}
              onValueChange={(value) => setFormData({...formData, academicYear: value})}
              disabled={academicYearsLoading || academicYears.length === 0}
            >
              <SelectTrigger id="main-academic-year" className="w-[280px] shadow-sm border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all">
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.name} className="focus:bg-primary/10 focus:text-primary">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>{year.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm"
              className="border-green-200 text-green-600 hover:bg-green-50 shadow-sm transition-all duration-200 hover:shadow font-medium"
              onClick={() => setShowCreateAcademicYearModal(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Create Year
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-1">Select the academic year this fee structure applies to</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="boarding-type" className="text-sm font-medium flex items-center gap-2 mb-2 text-slate-700">
            <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary font-bold">3</div>
            <span>Boarding Type</span>
          </Label>
          <Select
            value={formData.boardingType}
            onValueChange={(value) => setFormData({...formData, boardingType: value})}
          >
            <SelectTrigger id="boarding-type" className="w-[280px] shadow-sm border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all">
              <SelectValue placeholder="Select boarding type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day" className="focus:bg-primary/10 focus:text-primary">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                  Day School Only
                </div>
              </SelectItem>
              <SelectItem value="boarding" className="focus:bg-primary/10 focus:text-primary">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  Boarding School Only
                </div>
              </SelectItem>
              <SelectItem value="both" className="focus:bg-primary/10 focus:text-primary">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                  Both Day & Boarding
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 mt-1 ml-1">Specify if this fee structure is for day scholars, boarders, or both</p>
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
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="mt-1 bg-white p-2 rounded-full shadow-sm border border-blue-200">
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-800">Grade Selection</h4>
            <p className="text-sm text-blue-700 mt-1">
              Select which grades or grade levels this fee structure applies to:
            </p>
            <ul className="text-xs text-blue-600 mt-3 space-y-2 list-none pl-0">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">1</span>
                </div>
                <span><strong className="text-blue-700">Grade Levels</strong> - Higher-level grade categories (e.g., Grade 1, Grade 2)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">2</span>
                </div>
                <span><strong className="text-blue-700">Classes</strong> - Specific class sections within grades (e.g., Grade 1A, Grade 1B)</span>
              </li>
            </ul>
            <div className="mt-3 p-3 bg-blue-100/50 border border-blue-300 rounded-md">
              <p className="text-xs text-blue-700 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span>You can select multiple items across both tabs to create fee structures for multiple grades at once.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Grade selection interface */}
      <div className="mt-6 bg-white p-4 border border-slate-200 rounded-lg shadow-sm" id="grade-selection">
        {/* Tabs for Grade Levels vs Classes */}
        <div className="flex border-b border-slate-200 mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeGradeTab === 'gradelevels' ? 'border-b-2 border-primary text-primary' : 'text-slate-600'}`}
            onClick={() => setActiveGradeTab('gradelevels')}
          >
            Grade Levels
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeGradeTab === 'classes' ? 'border-b-2 border-primary text-primary' : 'text-slate-600'}`}
            onClick={() => setActiveGradeTab('classes')}
          >
            Classes
          </button>
        </div>
        
        {/* Grade Levels Tab Content */}
        {activeGradeTab === 'gradelevels' && (
          <div className="py-2">
            {isLoadingGradeLevels ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : gradeLevelsError ? (
              <div className="text-center p-4 text-red-500">
                <p>Error loading grade levels: {typeof gradeLevelsError === 'string' ? gradeLevelsError : 'Unknown error'}</p>
                <button className="mt-2 px-4 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm">
                  Retry
                </button>
              </div>
            ) : gradeLevels.length === 0 ? (
              <div className="text-center p-8 text-slate-500">
                <GraduationCap className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p>No grade levels found. Please add grade levels to your school first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                {gradeLevels.map((gradeLevel) => {
                  const isSelected = selectedGrades.includes(gradeLevel.id);
                  return (
                    <div
                      key={gradeLevel.id}
                      className={`border p-3 rounded-md cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border-primary shadow-sm' : 'border-slate-200 hover:border-primary/30 hover:bg-slate-50'}`}
                      onClick={() => handleGradeToggle(gradeLevel.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary' : 'border border-slate-300'}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                          </div>
                          <span className="ml-2 font-medium text-sm">
                            {gradeLevel.gradeLevel && gradeLevel.gradeLevel.name ? 
                              gradeLevel.gradeLevel.name : 
                              (gradeLevel.name || gradeLevel.shortName || 'Grade')}
                          </span>
                        </div>
                        {gradeLevel.shortName && (
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                            {gradeLevel.shortName}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        {gradeLevel.curriculum && gradeLevel.curriculum.name ? gradeLevel.curriculum.name : 'No curriculum'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Classes Tab Content */}
        {activeGradeTab === 'classes' && (
          <div className="py-2">
            {availableGrades.length === 0 ? (
              <div className="text-center p-8 text-slate-500">
                <GraduationCap className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p>No classes found. Please create classes for your school first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                {availableGrades.map((grade) => {
                  const isSelected = selectedGrades.includes(grade.id);
                  return (
                    <div
                      key={grade.id}
                      className={`border p-3 rounded-md cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border-primary shadow-sm' : 'border-slate-200 hover:border-primary/30 hover:bg-slate-50'}`}
                      onClick={() => handleGradeToggle(grade.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary' : 'border border-slate-300'}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                          </div>
                          <span className="ml-2 font-medium text-sm">
                            {grade.name || 'Unnamed Class'}
                          </span>
                        </div>
                      </div>
                      {grade.stream && (
                        <div className="mt-2 text-xs text-slate-500">
                          Stream: {grade.stream}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Selected Count */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-700">
              <span className="font-medium">{selectedGrades.length}</span> grade(s) selected
            </span>
            {selectedGrades.length > 0 && (
              <button 
                className="text-xs text-red-500 hover:text-red-700" 
                onClick={() => {
                  // Clear selection by toggling each selected grade
                  selectedGrades.forEach(gradeId => handleGradeToggle(gradeId));
                }}
              >
                Clear selection
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const Step3_TermsSetup: React.FC<FeeStructureStepProps> = ({ 
  formData, 
  setFormData,
  academicYears
}) => {
  // Add state for tracking fee structure scope
  const [structureScope, setStructureScope] = React.useState<'term' | 'year'>('term');
  
  // Function to add a new term
  const addTermStructure = () => {
    // Find selected academic year
    const selectedAcademicYear = academicYears.find((year: any) => year.name === formData.academicYear);
    
    // Get all available terms for this academic year
    const availableTerms = selectedAcademicYear?.terms || [];
    
    // Find a term that isn't already being used
    let termName = '';
    if (availableTerms.length > 0) {
      const usedTermNames = new Set(formData.termStructures.map((ts: any) => ts.term));
      
      const availableTerm = availableTerms.find((t: any) => !usedTermNames.has(t.name));
      if (availableTerm) {
        termName = availableTerm.name;
      } else {
        // If all terms are used, just use the first one
        termName = availableTerms[0].name;
      }
    }
    
    setFormData((prev: any) => ({
      ...prev,
      termStructures: [...prev.termStructures, { 
        term: termName,
        academicYear: prev.academicYear || '',
        dueDate: '',
        latePaymentFee: '0',
        earlyPaymentDiscount: '0',
        earlyPaymentDeadline: '',
        buckets: [
          {
            type: 'tuition',
            name: 'Tuition Fees',
            description: 'Academic fees for the term',
            isOptional: false,
            components: [
              {
                name: 'Base Tuition',
                description: 'Standard tuition fee',
                amount: '0',
                category: 'academic'
              }
            ]
          }
        ]
      }]
    }));
  };
  
  // Function to remove a term
  const removeTermStructure = (index: number) => {
    if (formData.termStructures.length > 1) {
      setFormData((prev: any) => ({
        ...prev,
        termStructures: prev.termStructures.filter((_: any, i: number) => i !== index)
      }));
    }
  };
  
  // Function to update a term field
  const updateTermField = (termIndex: number, field: keyof typeof formData.termStructures[0], value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      termStructures: prev.termStructures.map((term: any, i: number) => 
        i === termIndex ? { ...term, [field]: value } : term
      )
    }));
  };
  
  // Function to add all terms from academic year
  const addAllTermsFromYear = () => {
    const selectedAcademicYear = academicYears.find((year: any) => year.name === formData.academicYear);
    const availableTerms = selectedAcademicYear?.terms || [];
    
    // Clear existing terms and add all terms from the year
    setFormData((prev: any) => {
      const newTermStructures = availableTerms.map((term: any) => ({
        term: term.name,
        academicYear: prev.academicYear || '',
        dueDate: '',
        latePaymentFee: '0',
        earlyPaymentDiscount: '0',
        earlyPaymentDeadline: '',
        buckets: [
          {
            type: 'tuition',
            name: 'Tuition Fees',
            description: 'Academic fees for the term',
            isOptional: false,
            components: [
              {
                name: 'Base Tuition',
                description: 'Standard tuition fee',
                amount: '0',
                category: 'academic'
              }
            ]
          }
        ]
      }));
      
      return {
        ...prev,
        termStructures: newTermStructures
      };
    });
  };
  
  // Get available terms from the selected academic year
  const selectedAcademicYear = academicYears.find((year: any) => year.name === formData.academicYear);
  const availableTerms = selectedAcademicYear?.terms || [];
  
  return (
    <div className="animate-in fade-in duration-300">
      {/* Simplified header removed for cleaner UI */}
      
      {/* Scope selector */}
      <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50/50">
        <h3 className="text-sm font-medium text-blue-800 mb-3">Fee Structure Scope</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-all ${structureScope === 'term' 
              ? 'bg-primary/10 border-primary shadow-sm' 
              : 'bg-white border-slate-200 hover:border-primary/30'}`}
            onClick={() => setStructureScope('term')}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${structureScope === 'term' ? 'bg-primary' : 'border border-slate-300'}`}>
                {structureScope === 'term' && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
              <h4 className="font-medium text-slate-800">Term-by-Term Structure</h4>
            </div>
            <p className="text-xs text-slate-600 ml-6">Create fee structure for individual terms with unique configurations</p>
          </div>
          
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-all ${structureScope === 'year' 
              ? 'bg-primary/10 border-primary shadow-sm' 
              : 'bg-white border-slate-200 hover:border-primary/30'}`}
            onClick={() => setStructureScope('year')}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${structureScope === 'year' ? 'bg-primary' : 'border border-slate-300'}`}>
                {structureScope === 'year' && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
              <h4 className="font-medium text-slate-800">Complete Academic Year</h4>
            </div>
            <p className="text-xs text-slate-600 ml-6">Set up all terms at once with consistent configuration for the entire academic year</p>
          </div>
        </div>
        
        {structureScope === 'year' && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-700">
              <p className="font-medium">This will create structures for all terms in the academic year.</p>
              <p className="mt-1">Any existing term configurations will be replaced.</p>
            </div>
          </div>
        )}
        
        {structureScope === 'year' && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={addAllTermsFromYear}
              className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Generate All Terms ({availableTerms.length})
            </Button>
          </div>
        )}
      </div>
      
      {/* Terms configuration */}
      <div className="mt-6 space-y-6">
        {/* Add Term Button - Only show in term-by-term mode */}
        {structureScope === 'term' && (
          <div className="flex justify-end">
            <Button 
              onClick={addTermStructure}
              className="flex items-center gap-2"
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Term
            </Button>
          </div>
        )}
        
        {/* Terms List */}
        <div className="space-y-6">
          {formData.termStructures.length === 0 ? (
            <div className="text-center p-8 bg-white border border-slate-200 rounded-lg shadow-sm">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              {structureScope === 'term' ? (
                <p className="text-sm text-slate-500">No terms added yet. Click "Add Term" to begin.</p>
              ) : (
                <p className="text-sm text-slate-500">
                  No terms configured yet. Click "Generate All Terms" to create structures for all terms in the academic year.
                </p>
              )}
              
              {availableTerms.length === 0 && (
                <p className="mt-3 text-xs text-amber-600">
                  The selected academic year doesn't have any terms defined. Please create terms in the academic year settings first.
                </p>
              )}
            </div>
          ) : (
            formData.termStructures.map((term: any, index: number) => (
              <div key={index} className="bg-white p-5 border border-slate-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {term.term || `Term ${index + 1}`}
                  </h3>
                  <div className="flex items-center">
                    {structureScope === 'year' && (
                      <span className="text-xs text-slate-500 mr-2">All terms required</span>
                    )}
                    <Button
                      onClick={() => removeTermStructure(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      disabled={formData.termStructures.length <= 1 || structureScope === 'year'}
                      title={structureScope === 'year' ? 'Terms cannot be removed in Year mode' : 'Remove this term'}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                
                {/* Term Configuration Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Term Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`term-name-${index}`} className="text-sm font-medium">
                      Term Name
                    </Label>
                    <Select 
                      value={term.term}
                      onValueChange={(value) => updateTermField(index, 'term', value)}
                      disabled={structureScope === 'year'}
                    >
                      <SelectTrigger id={`term-name-${index}`} className={structureScope === 'year' ? 'opacity-80' : ''}>
                        <SelectValue placeholder="Select a term" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTerms.map((availableTerm: any) => (
                          <SelectItem key={availableTerm.id} value={availableTerm.name}>
                            {availableTerm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Due Date */}
                  <div className="space-y-2">
                    <Label htmlFor={`due-date-${index}`} className="text-sm font-medium">
                      Payment Due Date
                    </Label>
                    <Input
                      id={`due-date-${index}`}
                      type="date"
                      value={term.dueDate}
                      onChange={(e) => updateTermField(index, 'dueDate', e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-slate-500">When full payment is expected</p>
                  </div>
                  
                  {/* Late Payment Fee */}
                  <div className="space-y-2">
                    <Label htmlFor={`late-fee-${index}`} className="text-sm font-medium flex items-center gap-2">
                      <span>Late Payment Fee</span>
                      <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded">Optional</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">KES</span>
                      <Input
                        id={`late-fee-${index}`}
                        type="number"
                        value={term.latePaymentFee}
                        onChange={(e) => updateTermField(index, 'latePaymentFee', e.target.value)}
                        className="pl-12"
                      />
                    </div>
                    <p className="text-xs text-slate-500">Additional fee for late payments</p>
                  </div>
                  
                  {/* Early Payment Discount */}
                  <div className="space-y-2">
                    <Label htmlFor={`early-discount-${index}`} className="text-sm font-medium flex items-center gap-2">
                      <span>Early Payment Discount</span>
                      <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">Optional</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">KES</span>
                      <Input
                        id={`early-discount-${index}`}
                        type="number"
                        value={term.earlyPaymentDiscount}
                        onChange={(e) => updateTermField(index, 'earlyPaymentDiscount', e.target.value)}
                        className="pl-12"
                      />
                    </div>
                    <p className="text-xs text-slate-500">Discount for early payments</p>
                  </div>
                  
                  {/* Early Payment Deadline */}
                  <div className="space-y-2">
                    <Label htmlFor={`early-deadline-${index}`} className="text-sm font-medium flex items-center gap-2">
                      <span>Early Payment Deadline</span>
                      <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">Optional</span>
                    </Label>
                    <Input
                      id={`early-deadline-${index}`}
                      type="date"
                      value={term.earlyPaymentDeadline}
                      onChange={(e) => updateTermField(index, 'earlyPaymentDeadline', e.target.value)}
                      className="w-full"
                      disabled={!term.earlyPaymentDiscount || term.earlyPaymentDiscount === '0'}
                    />
                    <p className="text-xs text-slate-500">Deadline to qualify for early payment discount</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Create a wrapper component to adapt the original component to our FeeStructureStepProps interface
export const Step4_FeeComponents: React.FC<FeeStructureStepProps> = (props) => {
  return <OriginalStep4_FeeComponents formData={props.formData} setFormData={props.setFormData} />
}

export const Step5_Review: React.FC<FeeStructureStepProps> = ({ 
  formData, 
  setFormData,
  selectedGrades,
  availableGrades,
  gradeLevels
}) => {
  const { feeBuckets } = useFeeBuckets()
  
  return (
    <div className="animate-in fade-in duration-300">
      {/* PDF-style preview wrapper */}
      <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-primary">Fee Structure Preview</h4>
          </div>
          <span className="text-xs text-slate-500">Read-only preview</span>
        </div>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="max-h-[70vh] overflow-auto">
            <FeeStructurePDFPreview
              formData={formData}
              schoolName={formData.schoolDetails?.name}
              schoolAddress={formData.schoolDetails?.address}
              schoolContact={formData.schoolDetails?.contact}
              schoolEmail={formData.schoolDetails?.email}
              feeBuckets={feeBuckets}
            />
          </div>
        </div>
      </div>
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
