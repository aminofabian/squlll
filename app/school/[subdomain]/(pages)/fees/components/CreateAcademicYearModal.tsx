'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Calendar, CalendarDays, CheckCircle, ChevronRight, School, BookOpen, ArrowRight, CalendarIcon, Clock, AlertCircle, Info } from "lucide-react"
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
  
  // Helper functions for date handling
  const getCurrentAcademicYear = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // 0-indexed to 1-indexed
    
    // If we're in the second half of the year, suggest next year's academic year
    if (currentMonth >= 7) {
      return `${currentYear}-${currentYear + 1}`
    } else {
      return `${currentYear - 1}-${currentYear}`
    }
  }
  
  const getAcademicYearDates = (yearName: string) => {
    const [startYear, endYear] = yearName.split('-').map(y => parseInt(y))
    if (startYear && endYear) {
      return {
        startDate: `${startYear}-09-01`, // September 1st
        endDate: `${endYear}-08-31`      // August 31st next year
      }
    }
    return null
  }
  
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
  
  const getDateValidationMessage = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return null
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    if (start > end) {
      return { type: 'error', message: 'End date must be after start date' }
    }
    
    if (diffDays < 30) {
      return { type: 'warning', message: 'Academic year seems too short (less than 30 days)' }
    }
    
    if (diffDays > 400) {
      return { type: 'warning', message: 'Academic year seems too long (more than 400 days)' }
    }
    
    return { type: 'success', message: `${diffDays} days duration` }
  }
  
  const getTermValidationMessage = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return null
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    if (start > end) {
      return { type: 'error', message: 'End date must be after start date' }
    }
    
    if (diffDays < 7) {
      return { type: 'warning', message: 'Term seems too short (less than 1 week)' }
    }
    
    if (diffDays > 120) {
      return { type: 'warning', message: 'Term seems too long (more than 4 months)' }
    }
    
    return { type: 'success', message: `${diffDays} days` }
  }
  
  const getTermSuggestions = (academicYearStartDate: string, academicYearEndDate: string) => {
    if (!academicYearStartDate || !academicYearEndDate) return []
    
    const start = new Date(academicYearStartDate)
    const end = new Date(academicYearEndDate)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    // Generate suggestions based on academic year length
    const suggestions = []
    
    if (totalDays >= 240) { // 8+ months - suggest 3 terms
      const termLength = Math.floor(totalDays / 3)
      suggestions.push(
        {
          name: 'Term 1',
          startDate: academicYearStartDate,
          endDate: new Date(start.getTime() + termLength * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          name: 'Term 2',
          startDate: new Date(start.getTime() + termLength * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(start.getTime() + 2 * termLength * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          name: 'Term 3',
          startDate: new Date(start.getTime() + 2 * termLength * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: academicYearEndDate
        }
      )
    } else if (totalDays >= 160) { // 5+ months - suggest 2 terms
      const termLength = Math.floor(totalDays / 2)
      suggestions.push(
        {
          name: 'Semester 1',
          startDate: academicYearStartDate,
          endDate: new Date(start.getTime() + termLength * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          name: 'Semester 2',
          startDate: new Date(start.getTime() + termLength * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: academicYearEndDate
        }
      )
    } else {
      // Short academic year - suggest 1 term
      suggestions.push({
        name: 'Term 1',
        startDate: academicYearStartDate,
        endDate: academicYearEndDate
      })
    }
    
    return suggestions
  }
  
  const getTraditionalTermSuggestions = (academicYearStartDate: string, academicYearEndDate: string) => {
    if (!academicYearStartDate || !academicYearEndDate) return []
    
    const startYear = new Date(academicYearStartDate).getFullYear()
    const endYear = new Date(academicYearEndDate).getFullYear()
    
    // Traditional school calendar: Jan-Apr, May-Aug, Aug-Nov
    return [
      {
        name: 'Term 1',
        startDate: `${startYear}-01-15`, // Mid January
        endDate: `${startYear}-04-30`    // End of April
      },
      {
        name: 'Term 2', 
        startDate: `${startYear}-05-01`, // Start of May
        endDate: `${startYear}-08-15`    // Mid August
      },
      {
        name: 'Term 3',
        startDate: `${startYear}-08-16`, // Mid August
        endDate: `${startYear}-11-30`    // End of November
      }
    ]
  }
  
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
        let errorMessage = 'Failed to create academic year'
        
        // Handle GraphQL errors from details array
        if (academicYearResult.details && Array.isArray(academicYearResult.details)) {
          errorMessage = academicYearResult.details[0]?.message || errorMessage
        } else if (typeof academicYearResult.details === 'string') {
          errorMessage = academicYearResult.details
        } else if (academicYearResult.error) {
          errorMessage = academicYearResult.error
        }
        
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
        let errorMessage = `Failed to create term "${term.name}"`
        
        // Handle GraphQL errors from details array
        if (termResult.details && Array.isArray(termResult.details)) {
          errorMessage = termResult.details[0]?.message || errorMessage
        } else if (typeof termResult.details === 'string') {
          errorMessage = termResult.details
        } else if (termResult.error) {
          errorMessage = termResult.error
        }
        
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
                  <Label htmlFor="year-name" className="flex items-center gap-2">
                    <School className="h-4 w-4 text-primary" />
                    Academic Year Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="year-name"
                      value={academicYearName}
                      onChange={(e) => {
                        setAcademicYearName(e.target.value)
                        // Auto-suggest dates when user types a valid year pattern
                        const dates = getAcademicYearDates(e.target.value)
                        if (dates && !academicYearStartDate && !academicYearEndDate) {
                          setAcademicYearStartDate(dates.startDate)
                          setAcademicYearEndDate(dates.endDate)
                        }
                      }}
                      placeholder="e.g. 2025-2026"
                      className="col-span-3 pr-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 px-2 text-xs text-primary hover:bg-primary/10"
                      onClick={() => {
                        const suggestedYear = getCurrentAcademicYear()
                        setAcademicYearName(suggestedYear)
                        const dates = getAcademicYearDates(suggestedYear)
                        if (dates) {
                          setAcademicYearStartDate(dates.startDate)
                          setAcademicYearEndDate(dates.endDate)
                        }
                      }}
                    >
                      Suggest
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span>Quick suggestions:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const currentYear = new Date().getFullYear()
                        const suggestions = [
                          { name: `${currentYear}-${currentYear + 1}`, label: 'Current Year' },
                          { name: `${currentYear + 1}-${currentYear + 2}`, label: 'Next Year' },
                          { name: `${currentYear - 1}-${currentYear}`, label: 'Previous Year' }
                        ]
                        return suggestions.map((suggestion) => (
                          <Button
                            key={suggestion.name}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setAcademicYearName(suggestion.name)
                              const dates = getAcademicYearDates(suggestion.name)
                              if (dates) {
                                setAcademicYearStartDate(dates.startDate)
                                setAcademicYearEndDate(dates.endDate)
                              }
                            }}
                          >
                            {suggestion.name}
                            <span className="ml-1 text-muted-foreground">({suggestion.label})</span>
                          </Button>
                        ))
                      })()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year-start-date" className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-green-600" />
                        Start Date
                      </Label>
                      <div className="relative">
                        <Input
                          id="year-start-date"
                          type="date"
                          value={academicYearStartDate}
                          onChange={(e) => setAcademicYearStartDate(e.target.value)}
                          className="pl-10"
                        />
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      {academicYearStartDate && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateForDisplay(academicYearStartDate)}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year-end-date" className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-red-600" />
                        End Date
                      </Label>
                      <div className="relative">
                        <Input
                          id="year-end-date"
                          type="date"
                          value={academicYearEndDate}
                          onChange={(e) => setAcademicYearEndDate(e.target.value)}
                          className="pl-10"
                        />
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      {academicYearEndDate && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateForDisplay(academicYearEndDate)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Date validation feedback */}
                  {academicYearStartDate && academicYearEndDate && (() => {
                    const validation = getDateValidationMessage(academicYearStartDate, academicYearEndDate)
                    if (!validation) return null
                    
                    return (
                      <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                        validation.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
                        validation.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-700' :
                        'bg-green-50 border border-green-200 text-green-700'
                      }`}>
                        {validation.type === 'error' && <AlertCircle className="h-4 w-4" />}
                        {validation.type === 'warning' && <AlertCircle className="h-4 w-4" />}
                        {validation.type === 'success' && <CheckCircle className="h-4 w-4" />}
                        <span>{validation.message}</span>
                      </div>
                    )
                  })()}
                </div>
              </>
            )}

            {currentStep === 'terms' && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Terms for {academicYearName}
                    </Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="h-8 text-xs"
                      onClick={handleAddTerm}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Term
                    </Button>
                  </div>
                  
                  {/* Term suggestions based on academic year */}
                  {academicYearStartDate && academicYearEndDate && (() => {
                    const suggestions = getTermSuggestions(academicYearStartDate, academicYearEndDate)
                    const traditionalSuggestions = getTraditionalTermSuggestions(academicYearStartDate, academicYearEndDate)
                    if (suggestions.length === 0) return null
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Info className="h-4 w-4" />
                          <span>Choose a term structure:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {/* Traditional school calendar */}
                          <div className="relative group">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                              onClick={() => {
                                setTerms(traditionalSuggestions)
                              }}
                            >
                              Traditional Calendar
                              <span className="ml-1 text-xs text-blue-500">(Jan-Apr, May-Aug, Aug-Nov)</span>
                            </Button>
                            
                            {/* Tooltip preview */}
                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                              <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg min-w-max">
                                <div className="space-y-1">
                                  <div className="font-medium mb-2">Traditional School Calendar:</div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    <span>Term 1: Jan 15 - Apr 30</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                    <span>Term 2: May 1 - Aug 15</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                    <span>Term 3: Aug 16 - Nov 30</span>
                                  </div>
                                </div>
                                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Auto-calculated suggestions */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              setTerms(suggestions)
                            }}
                          >
                            {suggestions.length === 3 ? '3 Terms (Auto)' : suggestions.length === 2 ? '2 Semesters (Auto)' : '1 Term (Auto)'}
                          </Button>
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground"
                            onClick={() => {
                              setTerms([])
                            }}
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                    )
                  })()}
                  
                  {/* Academic year summary */}
                  {academicYearStartDate && academicYearEndDate && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <CalendarDays className="h-4 w-4" />
                        <span className="font-medium">Academic Year Summary:</span>
                        <span>{formatDateForDisplay(academicYearStartDate)} - {formatDateForDisplay(academicYearEndDate)}</span>
                      </div>
                    </div>
                  )}
                </div>
                  
                  <div className="space-y-4 pt-2">
                    {terms.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No terms added yet</p>
                        <p className="text-xs">Click "Add Term" or use the suggestions above to get started</p>
                      </div>
                    )}
                    
                    {terms.map((term, index) => (
                      <div key={index} className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm relative hover:shadow-md transition-shadow">
                        <Badge variant="outline" className="absolute -top-2 -right-2 bg-white border-primary text-primary">
                          {index + 1}
                        </Badge>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <Label className="text-sm font-medium flex items-center gap-2 mb-1">
                                <BookOpen className="h-4 w-4 text-primary" />
                                Term Name
                              </Label>
                              <div className="space-y-2">
                                <Input
                                  value={term.name}
                                  onChange={(e) => handleTermChange(index, 'name', e.target.value)}
                                  placeholder="e.g. Term 1, First Semester, etc."
                                  className="w-full"
                                />
                                {!term.name && (
                                  <div className="flex flex-wrap gap-1">
                                    {['Term 1', 'Term 2', 'Term 3', 'Semester 1', 'Semester 2', 'Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'].map((suggestion) => (
                                      <Button
                                        key={suggestion}
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs px-2 text-muted-foreground hover:text-primary"
                                        onClick={() => handleTermChange(index, 'name', suggestion)}
                                      >
                                        {suggestion}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            {terms.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-9 px-3 text-red-500 hover:text-red-700 hover:bg-red-50 self-end"
                                onClick={() => handleRemoveTerm(index)}
                              >
                                <span className="text-sm">Remove</span>
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3 text-green-600" />
                                Start Date
                              </Label>
                              <div className="relative">
                                <Input
                                  type="date"
                                  value={term.startDate}
                                  onChange={(e) => handleTermChange(index, 'startDate', e.target.value)}
                                  className="text-xs pl-8"
                                />
                                <CalendarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                              </div>
                              {term.startDate && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-2.5 w-2.5" />
                                  {formatDateForDisplay(term.startDate)}
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3 text-red-600" />
                                End Date
                              </Label>
                              <div className="relative">
                                <Input
                                  type="date"
                                  value={term.endDate}
                                  onChange={(e) => handleTermChange(index, 'endDate', e.target.value)}
                                  className="text-xs pl-8"
                                />
                                <CalendarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                              </div>
                              {term.endDate && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-2.5 w-2.5" />
                                  {formatDateForDisplay(term.endDate)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Term date validation */}
                          {term.startDate && term.endDate && (() => {
                            const validation = getTermValidationMessage(term.startDate, term.endDate)
                            if (!validation) return null
                            
                            return (
                              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                                validation.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
                                validation.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-700' :
                                'bg-green-50 border border-green-200 text-green-700'
                              }`}>
                                {validation.type === 'error' && <AlertCircle className="h-4 w-4" />}
                                {validation.type === 'warning' && <AlertCircle className="h-4 w-4" />}
                                {validation.type === 'success' && <CheckCircle className="h-4 w-4" />}
                                <span>{validation.message}</span>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            
            {currentStep === 'success' && (
              <div className="flex flex-col items-center py-4 space-y-4 text-center">
                <div className="h-16 w-16  bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Successfully Created!</h3>
                  <p className="text-gray-500">{successMessage}</p>
                </div>
                
                {createdTerms.length > 0 && (
                  <div className="w-full max-w-sm mx-auto mt-4 border  p-3 bg-slate-50">
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
              <div className="bg-red-50 border border-red-200  p-3">
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

