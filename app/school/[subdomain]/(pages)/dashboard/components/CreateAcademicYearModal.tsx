'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { Loader2, Calendar, Plus, BookOpen, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateTermModal } from './CreateTermModal'

interface CreateAcademicYearModalProps {
  onSuccess?: (year: any) => void
  trigger?: React.ReactNode
}

interface AcademicYearFormData {
  name: string
  startDate: string
  endDate: string
}

export function CreateAcademicYearModal({ onSuccess, trigger }: CreateAcademicYearModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showTermModal, setShowTermModal] = useState(false)
  const [createdAcademicYear, setCreatedAcademicYear] = useState<any>(null)
  const [formData, setFormData] = useState<AcademicYearFormData>({
    name: '',
    startDate: '',
    endDate: ''
  })

  const handleInputChange = (field: keyof AcademicYearFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Academic year name is required'
    }
    if (!formData.startDate) {
      return 'Start date is required'
    }
    if (!formData.endDate) {
      return 'End date is required'
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      return 'End date must be after start date'
    }
    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/school/create-academic-year', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            name: formData.name.trim(),
            startDate: formData.startDate,
            endDate: formData.endDate
          }
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create academic year')
      }

      toast.success(`Academic year "${result.name}" created successfully!`)
      
      // Store the created academic year data
      setCreatedAcademicYear(result)
      
      // Reset form
      setFormData({
        name: '',
        startDate: '',
        endDate: ''
      })
      
      // Close the main modal and show success dialog
      setIsOpen(false)
      setShowSuccessDialog(true)
      
      // Call success callback with created year
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (error) {
      console.error('Error creating academic year:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create academic year')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setIsOpen(false)
      setShowSuccessDialog(false)
      setShowTermModal(false)
      setCreatedAcademicYear(null)
      // Reset form when closing
      setFormData({
        name: '',
        startDate: '',
        endDate: ''
      })
    }
  }

  const handleTermCreated = (term: any) => {
    console.log('Term created:', term)
    toast.success(`Term "${term.name}" added to ${createdAcademicYear?.name}!`)
  }

  const handleCreateTerms = () => {
    setShowSuccessDialog(false)
    setShowTermModal(true)
  }

  const handleSkipTermCreation = () => {
    setShowSuccessDialog(false)
    setCreatedAcademicYear(null)
  }

  const defaultTrigger = (
    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
      <Plus className="h-4 w-4 mr-2 text-white" />
      Create Academic Year
      
    </Button>
  )

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex flex-row items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Create Academic Year
          </DialogTitle>
          <DialogDescription>
            Create a new academic year for your school. This will help organize terms, classes, and academic activities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Single-row inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-3 sm:gap-4 items-end">
            <div className="space-y-2 sm:col-span-3 sm:max-w-none">
              <Label htmlFor="name">Academic Year Name</Label>
              <Input
                id="name"
                placeholder="e.g., 2024-2025"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Enter the academic year in the format "YYYY-YYYY"
              </p>
            </div>

            <div className="space-y-2 sm:max-w-xs">
              <Label htmlFor="startDate" className="whitespace-nowrap">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 sm:max-w-xs">
              <Label htmlFor="endDate" className="whitespace-nowrap">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Preview */}
          {formData.name && formData.startDate && formData.endDate && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="text-sm">
                  <div className="font-medium text-primary">Preview:</div>
                  <div className="mt-1 space-y-1 text-muted-foreground">
                    <div>Name: {formData.name}</div>
                    <div>Period: {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}</div>
                    <div>Duration: {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Academic Year
              </>
            )}
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog with Term Creation Prompt */}
      {showSuccessDialog && createdAcademicYear && (
        <Dialog open={showSuccessDialog} onOpenChange={handleSkipTermCreation}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Academic Year Created!
              </DialogTitle>
              <DialogDescription>
                Great! Your academic year "{createdAcademicYear.name}" has been created successfully. 
                Would you like to create terms for this academic year now?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-200">
                        {createdAcademicYear.name}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {new Date(createdAcademicYear.startDate).toLocaleDateString()} - {new Date(createdAcademicYear.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-green-600">✓</div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-sm text-muted-foreground">
                <p>Terms help organize your academic calendar into manageable periods like semesters, quarters, or trimesters.</p>
              </div>
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleSkipTermCreation}
                className="w-full sm:w-auto"
              >
                Skip for Now
              </Button>
              <Button
                onClick={handleCreateTerms}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Create Terms
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Term Creation Modal */}
      {createdAcademicYear && (
        <CreateTermModal
          isOpen={showTermModal}
          onClose={() => {
            setShowTermModal(false)
            setCreatedAcademicYear(null)
          }}
          onSuccess={handleTermCreated}
          academicYear={createdAcademicYear}
        />
      )}
    </>
  )
}
