'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Save } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'
import { useFeeBuckets } from '@/lib/hooks/useFeeBuckets'
import { useAcademicYears } from '@/lib/hooks/useAcademicYears'
import { useGradeLevels } from '../../hooks/useGradeLevels'
import { CreateAcademicYearModal } from '../CreateAcademicYearModal'
import { FeeStructureForm, Grade } from '../../types'
import { FeeStructurePDFPreview } from '../FeeStructurePDFPreview'

// Import extracted components
import { StepWizard, steps } from './StepWizard'
import { ToastNotification, useToast } from './ToastNotification'
import { CreateBucketModal } from './CreateBucketModal'
import { EditBucketModal } from './EditBucketModal'
import { FeeCategoryEditor } from './FeeCategoryEditor'
import { TermSelector } from './TermSelector'

// Import custom hooks
import { useFeeStructure } from './hooks/useFeeStructure'
import { useFeeStructureAPI } from './hooks/useFeeStructureAPI'

// Import step content
import FeeStructureStepContent from '../FeeStructureStepBasedContent'

interface FeeStructureDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: FeeStructureForm) => Promise<string | null> // Return fee structure ID
  initialData?: FeeStructureForm
  mode: 'create' | 'edit'
  availableGrades: Grade[]
}

export const FeeStructureDrawer = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
  availableGrades
}: FeeStructureDrawerProps) => {
  // Debug logging
  console.log('FeeStructureDrawer rendering', { 
    isOpen, 
    mode, 
    availableGradesCount: availableGrades?.length || 0,
    initialData: initialData ? 'Has initial data' : 'No initial data',
  });
  
  const params = useParams()
  const subdomain = params.subdomain as string
  const { data: schoolConfig } = useSchoolConfig()
  const { feeBuckets, loading: bucketsLoading, error: bucketsError, refetch: refetchBuckets } = useFeeBuckets()
  const { academicYears, loading: academicYearsLoading, error: academicYearsError, refetch: refetchAcademicYears, getTermsForAcademicYear } = useAcademicYears()
  
  // Use the hook to fetch grade levels
  const { gradeLevels: rawGradeLevels, isLoading: isLoadingGradeLevels, error: gradeLevelsError } = useGradeLevels()
  
  // Transform TenantGradeLevel to match the GradeLevel interface expected by the component
  const gradeLevels = useMemo(() => {
    if (!rawGradeLevels) return [];
    return rawGradeLevels.map(level => ({
      id: level.id,
      name: level.gradeLevel?.name || `Grade Level ${level.id}`,
      isActive: level.isActive
    }));
  }, [rawGradeLevels]);
  
  // Additional debug logging after hooks are initialized
  useEffect(() => {
    console.log('Grade levels loaded:', { 
      rawGradeLevelsCount: rawGradeLevels?.length || 0,
      transformedGradeLevelsCount: gradeLevels?.length || 0,
      isLoadingGradeLevels,
      gradeLevelsError: gradeLevelsError ? String(gradeLevelsError) : null
    });
  }, [rawGradeLevels, gradeLevels, isLoadingGradeLevels, gradeLevelsError])
  
  // Initialize toast system
  const { toasts, showToast } = useToast()

  // Use the fee structure hook for state management
  const {
    formData,
    setFormData,
    selectedGrades,
    setSelectedGrades,
    currentStep,
    setCurrentStep,
    totalSteps,
    activeTab,
    setActiveTab,
    activeGradeTab,
    setActiveGradeTab,
    goToNextStep,
    goToPrevStep,
    isCurrentStepValid,
    validationErrors,
    addTermStructure,
    removeTermStructure,
    updateTermStructure,
    addBucket,
    removeBucket,
    updateBucket,
    addComponent,
    removeComponent,
    updateComponent,
    calculateTermTotal,
    calculateGrandTotal,
    calculateBucketTotal,
    handleGradeToggle
  } = useFeeStructure({ 
    initialData, 
    subdomain, 
    schoolName: schoolConfig?.tenant?.schoolName,
    academicYears
  })

  // Use API hook for GraphQL operations
  const {
    isCreatingBucket,
    createFeeBucket,
    updateFeeBucket,
    handleSaveStructure
  } = useFeeStructureAPI()

  // Update school name when config changes
  useEffect(() => {
    if (schoolConfig?.tenant?.schoolName) {
      setFormData(prev => ({
        ...prev,
        schoolDetails: {
          ...prev.schoolDetails!,
          name: schoolConfig.tenant.schoolName.toUpperCase()
        }
      }))
    }
  }, [schoolConfig, setFormData])

  // State for academic year/term creation modal
  const [showCreateAcademicYearModal, setShowCreateAcademicYearModal] = useState<boolean>(false)
  
  // State for bucket modals
  const [showBucketModal, setShowBucketModal] = useState(false)
  const [showEditBucketModal, setShowEditBucketModal] = useState(false)
  const [editingBucket, setEditingBucket] = useState<any>(null)

  // Add bucket with GraphQL creation
  const addBucketWithAPI = async (termIndex: number, bucketName: string, bucketDescription: string) => {
    try {
      // Create the bucket via GraphQL
      const createdBucket = await createFeeBucket({
        name: bucketName,
        description: bucketDescription
      })

      // Add the bucket to the form data
      const newBucket = {
        ...formData.termStructures[0].buckets[0],
        name: createdBucket.name,
        description: createdBucket.description,
        id: createdBucket.id // Store the server-generated ID
      }

      setFormData(prev => ({
        ...prev,
        termStructures: prev.termStructures.map((term, i) => 
          i === termIndex 
            ? { ...term, buckets: [...term.buckets, newBucket] }
            : term
        )
      }))
    } catch (error) {
      // Error already handled in createFeeBucket function
      console.error('Failed to add bucket with API:', error)
    }
  }

  // Handle save button click
  const handleSave = async () => {
    await handleSaveStructure(
      formData,
      selectedGrades,
      availableGrades,
      academicYears,
      onSave
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 bg-white shadow-xl z-50 w-full max-w-5xl flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Create New Fee Structure' : 'Edit Fee Structure'}
          </h2>
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'form' | 'preview')}
            className="w-auto"
          >
            <TabsList className="bg-slate-100">
              <TabsTrigger value="form">Form</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Step wizard and content area */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} className="flex-1 h-full flex flex-col">
            <TabsContent value="form" className="flex-1 flex flex-col px-0 m-0">
              {/* Step indicators */}
              <StepWizard
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextStep={goToNextStep}
                onPrevStep={goToPrevStep}
                isCurrentStepValid={isCurrentStepValid()}
                formData={formData}
                selectedGrades={selectedGrades}
                onClose={onClose}
                onSave={handleSave}
                validationErrors={validationErrors}
              />

              {/* Step content - imported from FeeStructureStepBasedContent */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Debug indicator for current step */}
                <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm">
                  <strong>Debug Info:</strong> Current Step: {currentStep}, 
                  Available Grades: {availableGrades?.length || 0}, 
                  Grade Levels: {gradeLevels?.length || 0}, 
                  Selected Grades: {selectedGrades?.length || 0}, 
                  Academic Years: {academicYears?.length || 0}, 
                  Selected Year: {formData.academicYear || 'None'}
                </div>
                
                <FeeStructureStepContent
                  currentStep={currentStep}
                  formData={formData}
                  setFormData={setFormData}
                  academicYears={academicYears}
                  academicYearsLoading={academicYearsLoading}
                  setShowCreateAcademicYearModal={setShowCreateAcademicYearModal}
                  handleBoardingTypeChange={(value) => setFormData(prev => ({ ...prev, boardingType: value }))}
                  selectedGrades={selectedGrades}
                  handleGradeToggle={handleGradeToggle}
                  availableGrades={availableGrades || []}
                  activeGradeTab={activeGradeTab}
                  setActiveGradeTab={setActiveGradeTab}
                  gradeLevels={gradeLevels || []}
                  isLoadingGradeLevels={isLoadingGradeLevels}
                  gradeLevelsError={gradeLevelsError}
                />

                {/* Display validation errors if any */}
                {validationErrors.length > 0 && currentStep === totalSteps && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                    <h3 className="text-red-700 font-medium mb-2">Please fix these errors before saving:</h3>
                    <ul className="text-red-600 text-sm space-y-1 list-disc list-inside">
                      {validationErrors.map((error, i) => (
                        <li key={i}>{error.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 p-6 m-0">
              <div className="h-full overflow-y-auto">
                <FeeStructurePDFPreview
                  formData={formData}
                  schoolName={formData.schoolDetails?.name}
                  schoolAddress={formData.schoolDetails?.address}
                  schoolContact={formData.schoolDetails?.contact}
                  schoolEmail={formData.schoolDetails?.email}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Bucket Creation Modal */}
        <CreateBucketModal
          isOpen={showBucketModal}
          onOpenChange={setShowBucketModal}
          onCreateBucket={async (name, description) => {
            await addBucketWithAPI(0, name, description);
          }}
          isCreatingBucket={isCreatingBucket}
        />

        {/* Edit Bucket Modal */}
        <EditBucketModal
          isOpen={showEditBucketModal}
          onOpenChange={setShowEditBucketModal}
          editingBucket={editingBucket}
          onUpdateBucket={async (bucket) => {
            await updateFeeBucket(bucket.id, {
              name: bucket.name.trim(),
              description: bucket.description.trim(),
              isActive: bucket.isActive
            })
          }}
          onSetEditingBucket={setEditingBucket}
        />

        {/* Toast Notifications */}
        <ToastNotification toasts={toasts} />
        
        {/* Create Academic Year Modal */}
        <CreateAcademicYearModal
          isOpen={showCreateAcademicYearModal}
          onClose={() => setShowCreateAcademicYearModal(false)}
          onSuccess={(newAcademicYear) => {
            // Refresh the academic years list
            refetchAcademicYears()
              .then(() => {
                // Update the current form with the newly created academic year
                setFormData(prev => ({
                  ...prev,
                  academicYear: newAcademicYear.name
                }))
                
                showToast(`Academic year ${newAcademicYear.name} created successfully with ${newAcademicYear.terms.length} terms`, 'success')
              })
              .catch(error => {
                console.error('Failed to refresh academic years after creation:', error)
                showToast('Academic year created but failed to refresh the list', 'error')
              })
          }}
        />
      </div>
    </>
  )
}
