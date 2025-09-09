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
import { Loader2, Calendar, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CreateAcademicYearModalProps {
  onSuccess?: () => void
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
      
      // Reset form
      setFormData({
        name: '',
        startDate: '',
        endDate: ''
      })
      
      // Close modal
      setIsOpen(false)
      
      // Call success callback
      if (onSuccess) {
        onSuccess()
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
      // Reset form when closing
      setFormData({
        name: '',
        startDate: '',
        endDate: ''
      })
    }
  }

  const defaultTrigger = (
    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
      <Plus className="h-4 w-4 mr-2" />
      Create Academic Year
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Create Academic Year
          </DialogTitle>
          <DialogDescription>
            Create a new academic year for your school. This will help organize terms, classes, and academic activities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Academic Year Name */}
          <div className="space-y-2">
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

          {/* Date Range */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Academic Year Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
  )
}
