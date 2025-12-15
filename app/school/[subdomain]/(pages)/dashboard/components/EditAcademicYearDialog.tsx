'use client'

import { useState, useEffect } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { Loader2, Calendar, Sparkles, X } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { type AcademicYear } from '@/lib/hooks/useAcademicYears'
import moeTerms2026 from '@/lib/data/ke-moe-terms-2026.json'

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

    // Extract year from the JSON (year only)
    const year = moeTerms2026.year || 2026
    const academicYearName = `${year}-${year + 1}`

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
      toast.error('Unable to load official school calendar data from the Ministry of Education')
      return
    }

    setFormData({
      name: moeData.name,
      startDate: moeData.startDate,
      endDate: moeData.endDate
    })
    toast.success(`Calendar updated! Using official ${moeData.year} school calendar from the Ministry of Education`)
  }

  // Get the year from JSON for button display
  const moeYear = moeTerms2026.year || 2026

  return (
    <Drawer open={isOpen} onOpenChange={handleClose} direction="right">
      <DrawerContent className="max-w-2xl h-[95vh] flex flex-col">
        <DrawerHeader className="px-4 py-3 border-b border-primary/20 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Edit Academic Year
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Update the academic year information below.
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
            {/* Official Calendar Quick Fill Banner */}
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/30 shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                        Quick Update: Official School Calendar
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Click here to automatically update with the official {moeYear} school calendar dates as released by the Kenya Ministry of Education
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleUseMoeData}
                    disabled={isLoading}
                    className="flex-shrink-0 bg-primary hover:bg-primary/90 text-white/90 shadow-md hover:shadow-lg transition-all"
                    title={`Click to automatically fill in the official ${moeYear} school calendar dates as released by the Kenya Ministry of Education`}
                  >
                    <Sparkles className="h-4 w-4 mr-2 opacity-80" />
                    <span className="text-white/90">Click Here to Auto-Update</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Academic Year Name */}
            <div className="space-y-2">
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

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
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
                  Updating...
                </>
              ) : (
                'Update Academic Year'
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

