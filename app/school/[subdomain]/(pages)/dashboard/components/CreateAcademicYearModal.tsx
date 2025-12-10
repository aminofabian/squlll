'use client'

import { useState } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer"
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
import { Loader2, Calendar, Plus, BookOpen, ArrowRight, Sparkles, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateTermModal } from './CreateTermModal'
import moeTerms2026 from '@/lib/data/ke-moe-terms-2026.json'

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

  // Get MoE academic year data - using year from JSON
  const getMoeAcademicYearData = () => {
    const entries = moeTerms2026.entries || []
    if (entries.length === 0) return null

    // Find the earliest start date and latest end date
    const allDates = entries.map((entry: any) => ({
      start: entry.openingDate,
      end: entry.closingDate
    }))

    const earliestStart = allDates.reduce((earliest: string, current: any) => 
      current.start < earliest ? current.start : earliest, allDates[0].start)
    
    const latestEnd = allDates.reduce((latest: string, current: any) => 
      current.end > latest ? current.end : latest, allDates[0].end)

    // Extract year from the JSON (year only - just the year, not year-year+1)
    const year = moeTerms2026.year || 2026
    const academicYearName = String(year) // Just the year as string

    return {
      name: academicYearName,
      startDate: earliestStart,
      endDate: latestEnd,
      year
    }
  }

  const handleUseMoeData = () => {
    const moeData = getMoeAcademicYearData()
    if (!moeData) {
      toast.error('Unable to load MoE data')
      return
    }

    setFormData({
      name: moeData.name,
      startDate: moeData.startDate,
      endDate: moeData.endDate
    })
    toast.success(`Prefilled with Kenya MoE ${moeData.year} academic year data`)
  }

  // Get the year from JSON for button display and placeholder
  const moeYear = moeTerms2026.year || 2026

  const defaultTrigger = (
    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
      <Plus className="h-4 w-4 mr-2 text-white" />
      Create Academic Year
      
    </Button>
  )

  return (
    <>
      <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
        <DrawerTrigger asChild>
          {trigger || defaultTrigger}
        </DrawerTrigger>
        <DrawerContent className="max-w-2xl h-[95vh] flex flex-col">
          <DrawerHeader className="px-4 py-3 border-b border-primary/20 bg-white dark:bg-slate-900 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Create Academic Year
                </DrawerTitle>
                <DrawerDescription className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Create a new academic year for your school. This will help organize terms, classes, and academic activities.
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-900">
            <div className="space-y-4">
              {/* Academic Year Name */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="name">Academic Year Name</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseMoeData}
                    disabled={isLoading}
                    className="h-7 px-3 text-xs bg-primary/5 border-primary/30 hover:bg-primary/10 hover:border-primary/50 text-primary font-medium shadow-sm hover:shadow transition-all"
                    title={`Use Kenya Ministry of Education ${moeYear} academic year dates`}
                  >
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    Use MoE {moeYear}
                  </Button>
                </div>
                <Input
                  id="name"
                  placeholder={String(moeYear)}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the academic year (e.g., {moeYear})
                </p>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <DrawerFooter className="px-4 py-3 border-t border-primary/20 bg-white dark:bg-slate-900 flex-shrink-0">
            <div className="flex gap-3 w-full sm:w-auto sm:ml-auto">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
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
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

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
