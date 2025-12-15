'use client'

import { useState } from 'react'
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
import { Loader2, Calendar, Plus, BookOpen, Sparkles, X, CheckCircle2, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import moeTerms2026 from '@/lib/data/ke-moe-terms-2026.json'

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

type MoeTermEntry = {
  name: string
  type: string
  openingDate: string
  closingDate: string
  duration: string
}

const moeTermPresets: MoeTermEntry[] = (moeTerms2026.entries || []).filter(
  (entry: MoeTermEntry) => entry.type === 'term'
)

export function CreateTermModal({ isOpen, onClose, onSuccess, academicYear }: CreateTermModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingAll, setIsCreatingAll] = useState(false)
  const [createdTerms, setCreatedTerms] = useState<string[]>([])
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
    if (!isLoading && !isCreatingAll) {
      onClose()
      // Reset form when closing
      setFormData({
        name: '',
        startDate: academicYear.startDate.split('T')[0],
        endDate: ''
      })
      setCreatedTerms([])
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

  const handleUsePreset = (entry: MoeTermEntry) => {
    setFormData({
      name: entry.name,
      startDate: entry.openingDate,
      endDate: entry.closingDate
    })
    toast.success(`Calendar updated! Using official ${entry.name} dates (${entry.duration}) from the Ministry of Education`)
  }

  const createSingleTerm = async (entry: MoeTermEntry): Promise<any> => {
    const response = await fetch('/api/school/create-term', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          name: entry.name.trim(),
          startDate: entry.openingDate,
          endDate: entry.closingDate,
          academicYearId: academicYear.id
        }
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || `Failed to create ${entry.name}`)
    }

    return result
  }

  const handleCreateAllTerms = async () => {
    if (moeTermPresets.length === 0) {
      toast.error('No terms available to create')
      return
    }

    setIsCreatingAll(true)
    setCreatedTerms([])
    const results: any[] = []
    const errors: string[] = []

    try {
      for (const entry of moeTermPresets) {
        try {
          const result = await createSingleTerm(entry)
          results.push(result)
          setCreatedTerms(prev => [...prev, entry.name])
          toast.success(`Created ${entry.name}`)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : `Failed to create ${entry.name}`
          errors.push(errorMessage)
          console.error(`Error creating ${entry.name}:`, error)
        }
      }

      if (results.length > 0) {
        toast.success(`Successfully created ${results.length} out of ${moeTermPresets.length} terms!`)
        
        // Call success callback for each created term
        if (onSuccess) {
          results.forEach(result => onSuccess(result))
        }
      }

      if (errors.length > 0) {
        toast.error(`${errors.length} term(s) failed to create. Check console for details.`)
      }

      // Close drawer if all terms were created successfully
      if (errors.length === 0 && results.length === moeTermPresets.length) {
        setTimeout(() => {
          handleClose()
        }, 1500)
      }
    } catch (error) {
      console.error('Error creating terms:', error)
      toast.error('An error occurred while creating terms')
    } finally {
      setIsCreatingAll(false)
    }
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
        }
      }}
      direction="right"
    >
      <DrawerContent className="max-w-2xl h-[95vh] flex flex-col">
        <DrawerHeader className="px-4 py-3 border-b border-primary/20 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Create Term
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Create a new term for the academic year "{academicYear.name}". Terms help organize your school calendar and academic activities.
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

            {/* Official Calendar Terms - Prominent at Top */}
            {!!moeTermPresets.length && (
              <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/30 shadow-md">
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                          Quick Setup: Official School Calendar
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Use official term dates from the Kenya Ministry of Education 2026 calendar. Click a term below to fill the form, or create all terms at once.
                      </p>
                    </div>
                    <Button
                      onClick={handleCreateAllTerms}
                      disabled={isLoading || isCreatingAll}
                      className="flex-shrink-0 h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-white/90 shadow-md hover:shadow-lg transition-all"
                      title="Click here to automatically create all terms from the official Ministry of Education calendar"
                    >
                      {isCreatingAll ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3 mr-1.5 opacity-80" />
                          <span className="text-white/90">Click Here to Auto-Create All</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {moeTermPresets.map((entry) => {
                      const isCreated = createdTerms.includes(entry.name)
                      return (
                        <Button
                          key={entry.name}
                          variant="outline"
                          onClick={() => handleUsePreset(entry)}
                          disabled={isLoading || isCreatingAll}
                          title={`Click here to automatically fill in ${entry.name} dates from the official Ministry of Education calendar`}
                          className={`
                            w-full h-auto py-3 px-4 justify-start text-left 
                            transition-all duration-200 cursor-pointer
                            hover:bg-primary/10 hover:border-primary/60 hover:shadow-md
                            active:scale-[0.98] active:shadow-sm
                            ${isCreated ? 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}
                            ${isLoading || isCreatingAll ? 'opacity-60 cursor-not-allowed' : 'opacity-100'}
                          `}
                        >
                          <div className="flex items-start justify-between w-full gap-2">
                            <div className="flex flex-col items-start w-full gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                                  {entry.name}
                                </span>
                                {isCreated && (
                                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                )}
                              </div>
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                {entry.openingDate} → {entry.closingDate}
                              </span>
                              <span className="text-xs text-primary font-medium">
                                {entry.duration}
                              </span>
                            </div>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Divider - OR Section */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
                  Or Create Custom Term
                </span>
              </div>
            </div>

            {/* Manual Entry Section */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Create Custom Term</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
        </div>

        <DrawerFooter className="px-4 py-3 border-t border-primary/20 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex gap-3 w-full sm:w-auto sm:ml-auto">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading || isCreatingAll}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || isCreatingAll}
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
                  Create Term
                </>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}








