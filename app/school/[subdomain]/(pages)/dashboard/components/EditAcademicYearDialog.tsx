'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { Loader2, Calendar } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { type AcademicYear } from '@/lib/hooks/useAcademicYears'

interface EditAcademicYearDialogProps {
  academicYear: AcademicYear
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface AcademicYearFormData {
  name: string
  startDate: string
  endDate: string
}

export function EditAcademicYearDialog({ 
  academicYear, 
  isOpen, 
  onClose, 
  onSuccess 
}: EditAcademicYearDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<AcademicYearFormData>({
    name: '',
    startDate: '',
    endDate: ''
  })

  // Initialize form data when academic year changes
  useEffect(() => {
    if (academicYear) {
      // Format dates for input fields (YYYY-MM-DD)
      const startDate = academicYear.startDate 
        ? new Date(academicYear.startDate).toISOString().split('T')[0]
        : ''
      const endDate = academicYear.endDate 
        ? new Date(academicYear.endDate).toISOString().split('T')[0]
        : ''
      
      setFormData({
        name: academicYear.name || '',
        startDate,
        endDate
      })
    }
  }, [academicYear])

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
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation UpdateAcademicYear($id: ID!, $input: UpdateAcademicYearInput!) {
              updateAcademicYear(id: $id, input: $input) {
                id
                name
                startDate
                endDate
                isActive
                terms {
                  id
                  name
                }
              }
            }
          `,
          variables: {
            id: academicYear.id,
            input: {
              name: formData.name.trim(),
              startDate: formData.startDate,
              endDate: formData.endDate
            }
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to update academic year')
      }

      if (result.data?.updateAcademicYear) {
        toast.success(`Academic year "${result.data.updateAcademicYear.name}" updated successfully!`)
        onClose()
        if (onSuccess) {
          onSuccess()
        }
      } else {
        throw new Error('Update operation failed')
      }
    } catch (error) {
      console.error('Error updating academic year:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update academic year')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex flex-row items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Edit Academic Year
          </DialogTitle>
          <DialogDescription>
            Update the academic year information below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Single-row inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-3 sm:gap-4 items-end">
            <div className="space-y-2 sm:col-span-3 sm:max-w-none">
              <Label htmlFor="edit-name">Academic Year Name</Label>
              <Input
                id="edit-name"
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
              <Label htmlFor="edit-startDate" className="whitespace-nowrap">Start Date</Label>
              <Input
                id="edit-startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 sm:max-w-xs">
              <Label htmlFor="edit-endDate" className="whitespace-nowrap">End Date</Label>
              <Input
                id="edit-endDate"
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
                Updating...
              </>
            ) : (
              'Update Academic Year'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

