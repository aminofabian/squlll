'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { Loader2, Calendar, Plus, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CreateTermModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (term: any) => void
  academicYear: {
    id: string
    name: string
    startDate: string
    endDate: string
  }
}

interface TermFormData {
  name: string
  startDate: string
  endDate: string
}

export function CreateTermModal({ isOpen, onClose, onSuccess, academicYear }: CreateTermModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<TermFormData>({
    name: '',
    startDate: academicYear.startDate.split('T')[0], // Use academic year start date as default
    endDate: ''
  })

  const handleInputChange = (field: keyof TermFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Term name is required'
    }
    if (!formData.startDate) {
      return 'Start date is required'
    }
    if (!formData.endDate) {
      return 'End date is required'
    }
    
    const termStart = new Date(formData.startDate)
    const termEnd = new Date(formData.endDate)
    const yearStart = new Date(academicYear.startDate)
    const yearEnd = new Date(academicYear.endDate)
    
    if (termStart >= termEnd) {
      return 'End date must be after start date'
    }
    
    if (termStart < yearStart) {
      return 'Term start date cannot be before academic year start date'
    }
    
    if (termEnd > yearEnd) {
      return 'Term end date cannot be after academic year end date'
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
      const response = await fetch('/api/school/create-term', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            name: formData.name.trim(),
            startDate: formData.startDate,
            endDate: formData.endDate,
            academicYearId: academicYear.id
          }
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create term')
      }

      toast.success(`Term "${result.name}" created successfully!`)
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result)
      }
      
      // Close modal
      handleClose()
    } catch (error) {
      console.error('Error creating term:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create term')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      // Reset form when closing
      setFormData({
        name: '',
        startDate: academicYear.startDate.split('T')[0],
        endDate: ''
      })
    }
  }

  // Calculate term duration
  const getTermDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const diffWeeks = Math.floor(diffDays / 7)
      return { days: diffDays, weeks: diffWeeks }
    }
    return null
  }

  const duration = getTermDuration()

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Create Term
          </DialogTitle>
          <DialogDescription>
            Create a new term for the academic year "{academicYear.name}". Terms help organize your school calendar and academic activities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Academic Year Context */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-primary">{academicYear.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(academicYear.startDate).toLocaleDateString()} - {new Date(academicYear.endDate).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Academic Year
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Term Name */}
          <div className="space-y-2">
            <Label htmlFor="termName">Term Name</Label>
            <Input
              id="termName"
              placeholder="e.g., Fall 2024, Term 1, First Semester"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter a descriptive name for this term
            </p>
          </div>

          {/* Date Range */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Term Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="termStartDate">Start Date</Label>
                  <Input
                    id="termStartDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    disabled={isLoading}
                    min={academicYear.startDate.split('T')[0]}
                    max={academicYear.endDate.split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termEndDate">End Date</Label>
                  <Input
                    id="termEndDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    disabled={isLoading}
                    min={formData.startDate || academicYear.startDate.split('T')[0]}
                    max={academicYear.endDate.split('T')[0]}
                  />
                </div>
              </div>
              
              {/* Date constraints info */}
              <div className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-800 p-2 rounded">
                <strong>Note:</strong> Term dates must be within the academic year period
                ({new Date(academicYear.startDate).toLocaleDateString()} - {new Date(academicYear.endDate).toLocaleDateString()})
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {formData.name && formData.startDate && formData.endDate && duration && (
            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardContent className="pt-4">
                <div className="text-sm">
                  <div className="font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Term Preview
                  </div>
                  <div className="mt-2 space-y-1 text-green-700 dark:text-green-300">
                    <div><strong>Name:</strong> {formData.name}</div>
                    <div><strong>Period:</strong> {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}</div>
                    <div><strong>Duration:</strong> {duration.days} days ({duration.weeks} weeks)</div>
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
                Create Term
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}








