'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Calendar, CalendarDays, CheckCircle, ChevronRight, School, BookOpen, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Term {
  name: string
  startDate: string
  endDate: string
}

interface CreateAcademicYearModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (academicYear: { id: string; name: string; terms: Term[] }) => void
}

export const CreateAcademicYearModal = ({
  isOpen,
  onClose,
  onSuccess
}: CreateAcademicYearModalProps): React.ReactNode => {
  // Wizard step tracking
  const [currentStep, setCurrentStep] = useState<'academic-year' | 'terms' | 'success'>('academic-year')
  const [progressValue, setProgressValue] = useState<number>(33)
  
  // Form data
  const [academicYearName, setAcademicYearName] = useState('')
  const [academicYearStartDate, setAcademicYearStartDate] = useState('')
  const [academicYearEndDate, setAcademicYearEndDate] = useState('')
  const [academicYearId, setAcademicYearId] = useState<string>('')
  
  // Terms data
  const [terms, setTerms] = useState<Term[]>([
    { name: 'Term 1', startDate: '', endDate: '' },
    { name: 'Term 2', startDate: '', endDate: '' },
    { name: 'Term 3', startDate: '', endDate: '' }
  ])
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string>('')
  
  // Track created terms
  const [createdTerms, setCreatedTerms] = useState<any[]>([])
  
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('academic-year')
      setProgressValue(33)
      setAcademicYearName('')
      setAcademicYearStartDate('')
      setAcademicYearEndDate('')
      setAcademicYearId('')
      setTerms([
        { name: 'Term 1', startDate: '', endDate: '' },
        { name: 'Term 2', startDate: '', endDate: '' },
        { name: 'Term 3', startDate: '', endDate: '' }
      ])
      setError(null)
      setSuccessMessage('')
      setCreatedTerms([])
    }
  }, [isOpen])

  const handleAddTerm = () => {
    setTerms([...terms, { 
      name: `Term ${terms.length + 1}`, 
      startDate: '',
      endDate: ''
    }])
  }

  const handleRemoveTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index))
  }

  const handleTermChange = (index: number, field: keyof Term, value: string) => {
    setTerms(terms.map((term, i) => 
      i === index ? { ...term, [field]: value } : term
    ))
  }

  // Handle the first step - create academic year only
  const submitAcademicYear = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    // Validations for academic year
    if (!academicYearName.trim()) {
      setError("Academic year name is required")
      return false
    }
    
    if (!academicYearStartDate) {
      setError("Academic year start date is required")
      return false
    }
    
    if (!academicYearEndDate) {
      setError("Academic year end date is required")
      return false
    }
    
    // Validate date range
    if (new Date(academicYearStartDate) > new Date(academicYearEndDate)) {
      setError("Academic year start date must be before end date")
      return false
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Create the academic year using the dedicated API route
      const academicYearResponse = await fetch('/api/school/create-academic-year', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            name: academicYearName,
            startDate: academicYearStartDate,
            endDate: academicYearEndDate
          }
        }),
      })
      
      const academicYearResult = await academicYearResponse.json()
      
      if (!academicYearResponse.ok || academicYearResult.error) {
        const errorMessage = academicYearResult.error || 
          (academicYearResult.details ? 
            (typeof academicYearResult.details === 'string' ? 
              academicYearResult.details : 
              JSON.stringify(academicYearResult.details)
            ) : 
            'Failed to create academic year'
          )
        throw new Error(errorMessage)
      }
      
      const newAcademicYearId = academicYearResult.id
      
      if (!newAcademicYearId) {
        throw new Error('Academic year created but no ID returned')
      }
      
      // Save the academic year ID for term creation
      setAcademicYearId(newAcademicYearId)
      setSuccessMessage(`Academic year "${academicYearName}" created successfully!`)
      
      // Advance to the next step
      setCurrentStep('terms')
      setProgressValue(66)
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      console.error('Error creating academic year:', err)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Submit a single term
  const submitTerm = async (term: Term) => {
    if (!term.name.trim() || !term.startDate || !term.endDate) {
      return { success: false, error: 'Term must have name, start date, and end date' }
    }
    
    try {
      const termResponse = await fetch('/api/school/create-term', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            name: term.name,
            startDate: term.startDate,
            endDate: term.endDate,
            academicYearId: academicYearId
          }
        }),
      })
      
      const termResult = await termResponse.json()
      
      if (!termResponse.ok || termResult.error) {
        const errorMessage = termResult.error || 
          (termResult.details ? 
            (typeof termResult.details === 'string' ? 
              termResult.details : 
              JSON.stringify(termResult.details)
            ) : 
            `Failed to create term "${term.name}"`
          )
        return { success: false, error: errorMessage }
      }
      
      return { success: true, term: termResult }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'An unknown error occurred'
      }
    }
  }
      
  // Submit all terms and finish the process
  const submitTerms = async () => {
    if (!academicYearId) {
      setError("No academic year ID found. Please create an academic year first.")
      return false
    }
    
    const nonEmptyTerms = terms.filter(term => term.name.trim() !== '')
    
    if (nonEmptyTerms.length === 0) {
      setError("At least one term is required")
      return false
    }
    
    // Validate all terms have dates
    const invalidTerms = nonEmptyTerms.filter(term => !term.startDate || !term.endDate)
    if (invalidTerms.length > 0) {
      setError(`Term "${invalidTerms[0].name}" is missing dates`)
      return false
    }
    
    // Validate date ranges
    for (const term of nonEmptyTerms) {
      if (new Date(term.startDate) > new Date(term.endDate)) {
        setError(`Term "${term.name}" has start date after end date`)
        return false
      }
    }
    
    setIsSubmitting(true)
    setError(null)
    setCreatedTerms([]) // Reset previous results
    
    try {
      const results = []
      let hasError = false
      
      // Create each term sequentially
      for (const term of nonEmptyTerms) {
        const result = await submitTerm(term)
        
        if (result.success) {
          results.push(result.term)
          setCreatedTerms(prev => [...prev, result.term]) // Update as we go for visual feedback
        } else {
          setError(`Error creating term "${term.name}": ${result.error}`)
          hasError = true
        }
      }
      
      // If we have at least one success, move to success step
      if (results.length > 0) {
        // Prepare academic year object with terms for the success callback
        const createdAcademicYear = {
          id: academicYearId,
          name: academicYearName,
          terms: results.map(term => ({
            id: term.id,
            name: term.name,
            startDate: term.startDate,
            endDate: term.endDate
          }))
        }
        
        // Call success handler with the newly created academic year
        if (onSuccess) {
          onSuccess(createdAcademicYear)
        }
        
        // Move to success step
        setCurrentStep('success')
        setProgressValue(100)
        
        if (hasError) {
          setSuccessMessage(`Academic year created with ${results.length} term(s). Some terms had errors.`)
        } else {
          setSuccessMessage(`Academic year "${academicYearName}" created successfully with ${results.length} term(s)!`)
        }
        
        return true
      } else {
        throw new Error("Failed to create any terms")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      console.error('Error creating terms:', err)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle form submission based on current step
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentStep === 'academic-year') {
      submitAcademicYear()
    } else if (currentStep === 'terms') {
      submitTerms()
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Create Academic Year
          </DialogTitle>
          <DialogDescription>
            Add a new academic year with terms for fee structures
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress indicator */}
        <div className="mb-4">
          <Progress value={progressValue} className="h-2 w-full" />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span className={currentStep === 'academic-year' ? 'font-medium text-primary' : ''}>Academic Year</span>
            <span className={currentStep === 'terms' ? 'font-medium text-primary' : ''}>Terms</span>
            <span className={currentStep === 'success' ? 'font-medium text-primary' : ''}>Complete</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {currentStep === 'academic-year' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="year-name">Academic Year Name</Label>
                  <Input
                    id="year-name"
                    value={academicYearName}
                    onChange={(e) => setAcademicYearName(e.target.value)}
                    placeholder="e.g. 2025-2026"
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year-start-date">Start Date</Label>
                    <Input
                      id="year-start-date"
                      type="date"
                      value={academicYearStartDate}
                      onChange={(e) => setAcademicYearStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year-end-date">End Date</Label>
                    <Input
                      id="year-end-date"
                      type="date"
                      value={academicYearEndDate}
                      onChange={(e) => setAcademicYearEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 'terms' && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Terms</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleAddTerm}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Term
                    </Button>
                  </div>
                  
                  <div className="space-y-3 pt-1">
                    {terms.map((term, index) => (
                      <div key={index} className="border rounded-md p-3 bg-slate-50 relative">
                        <Badge variant="outline" className="absolute -top-2 -right-2 bg-white">
                          {index + 1}
                        </Badge>
                        <div className="grid gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={term.name}
                              onChange={(e) => handleTermChange(index, 'name', e.target.value)}
                              placeholder="Term name"
                              className="flex-1"
                            />
                            {terms.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRemoveTerm(index)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Start Date</Label>
                              <Input
                                type="date"
                                value={term.startDate}
                                onChange={(e) => handleTermChange(index, 'startDate', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">End Date</Label>
                              <Input
                                type="date"
                                value={term.endDate}
                                onChange={(e) => handleTermChange(index, 'endDate', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>  
            )}
            
            {currentStep === 'success' && (
              <div className="flex flex-col items-center py-4 space-y-4 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Successfully Created!</h3>
                  <p className="text-gray-500">{successMessage}</p>
                </div>
                
                {createdTerms.length > 0 && (
                  <div className="w-full max-w-sm mx-auto mt-4 border rounded-md p-3 bg-slate-50">
                    <h4 className="font-medium flex items-center gap-1 mb-2">
                      <School className="h-4 w-4" />
                      {academicYearName}
                    </h4>
                    <div className="space-y-2">
                      {createdTerms.map((term, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5 text-gray-500" />
                            <span>{term.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs py-0 px-2">
                            {new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {/* Always show close/cancel button */}
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isSubmitting}
            >
              {currentStep === 'success' ? 'Close' : 'Cancel'}
            </Button>
            
            {/* Step-specific action buttons */}
            {currentStep === 'academic-year' && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
            
            {currentStep === 'terms' && (
              <Button 
                type="button" 
                onClick={submitTerms} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Terms...
                  </>
                ) : (
                  'Create Terms'
                )}
              </Button>
            )}
            
            {currentStep === 'success' && (
              <Button 
                type="button" 
                onClick={onClose} 
                className="bg-green-600 hover:bg-green-700"
              >
                Done
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    )
}

