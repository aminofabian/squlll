'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, School, GraduationCap, BookOpen, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Grade } from '../types'
import { useGradeLevels, TenantGradeLevel } from '../hooks/useGradeLevels'

interface FeeStructure {
  id: string
  name: string
  academicYear?: string
  isActive?: boolean
}

interface AssignFeeStructureModalProps {
  isOpen: boolean
  onClose: () => void
  feeStructure: FeeStructure | null
  availableGrades: Grade[]
  onSuccess?: (response: any) => void
}

export const AssignFeeStructureModal = ({
  isOpen,
  onClose,
  feeStructure,
  availableGrades,
  onSuccess
}: AssignFeeStructureModalProps) => {
  const [description, setDescription] = useState<string>("")
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'grades' | 'gradelevels'>('gradelevels')
  const { toast } = useToast()
  
  // Use the hook to fetch grade levels
  const { gradeLevels, isLoading: isLoadingGradeLevels, error: gradeLevelsError } = useGradeLevels()
  
  // Reset form when modal opens with new fee structure
  useEffect(() => {
    if (isOpen) {
      // Default description based on fee structure and quarter
      const currentDate = new Date()
      const quarter = Math.floor(currentDate.getMonth() / 3) + 1
      const year = currentDate.getFullYear()
      setDescription(`Q${quarter} ${year} Fee Assignment${feeStructure ? ` - ${feeStructure.name}` : ''}`)
      
      // Clear previous selections
      setSelectedGradeIds([])
      setError(null)
    }
  }, [isOpen, feeStructure])

  // Show toast for grade levels loading error
  useEffect(() => {
    if (gradeLevelsError) {
      toast({
        title: "Error Loading Grade Levels",
        description: gradeLevelsError,
        variant: "destructive",
      })
    }
  }, [gradeLevelsError, toast])
  
  const handleGradeToggle = (gradeId: string) => {
    setSelectedGradeIds(prev => 
      prev.includes(gradeId) 
        ? prev.filter(id => id !== gradeId)
        : [...prev, gradeId]
    )
  }
  
  const handleSelectAll = (itemList: { id: string }[]) => {
    const itemIds = itemList.map(item => item.id)
    const allSelected = itemIds.every(id => selectedGradeIds.includes(id))
    
    if (allSelected) {
      // Deselect all if all are currently selected
      setSelectedGradeIds(prev => prev.filter(id => !itemIds.includes(id)))
    } else {
      // Select all items
      setSelectedGradeIds(prev => {
        const newSelection = [...prev]
        itemIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id)
          }
        })
        return newSelection
      })
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!feeStructure) {
      setError("No fee structure selected")
      return
    }
    
    if (selectedGradeIds.length === 0) {
      setError("Please select at least one grade level")
      return
    }
    
    // Ensure we're using tenant grade level IDs (from the gradelevels tab)
    // If grades tab was used, we need to validate or map those IDs
    const tenantGradeLevelIds = activeTab === 'gradelevels' 
      ? selectedGradeIds 
      : selectedGradeIds.filter(id => gradeLevels.some(gl => gl.id === id))
    
    if (tenantGradeLevelIds.length === 0) {
      setError("Please select at least one grade level from the Grade Levels tab")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateFeeAssignment($input: CreateFeeAssignmentInput!) {
              createFeeAssignment(createFeeAssignmentInput: $input) {
                id
                feeStructureId
                assignedBy
                description
                isActive
                createdAt
                feeStructure {
                  id
                  name
                }
                assignedByUser {
                  id
                  name
                }
              }
            }
          `,
          variables: {
            input: {
              feeStructureId: feeStructure.id,
              tenantGradeLevelIds: tenantGradeLevelIds,
              description: description
            }
          }
        }),
      })
      
      // Always parse the response first, even for error status codes
      // GraphQL can return errors in the response body even with error HTTP status codes
      let result
      try {
        result = await response.json()
      } catch (parseError) {
        // If we can't parse JSON, fall back to HTTP status error
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        throw new Error('Failed to parse response from server')
      }
      
      // Check for GraphQL errors first (these contain the actual error messages)
      if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
        const errorMessage = result.errors[0]?.message || 'Failed to assign fee structure to grades'
        throw new Error(errorMessage)
      }
      
      // If no GraphQL errors but HTTP status is not ok, throw HTTP error
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Handle successful assignment
      const assignmentResult = result.data.createFeeAssignment
      
      // Show success toast
      toast({
        title: "Success",
        description: `Fee structure assigned to ${tenantGradeLevelIds.length} grade level${tenantGradeLevelIds.length !== 1 ? 's' : ''} successfully`,
        variant: "default",
      })
      
      if (onSuccess && assignmentResult) {
        onSuccess(assignmentResult)
      }
      
      // Close the modal
      onClose()
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      console.error('Error assigning fee structure to grades:', err)
      
      // Show error toast
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const allSelected = availableGrades.length > 0 && selectedGradeIds.length === availableGrades.length
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Assign Fee Structure to Grades
          </DialogTitle>
          <DialogDescription>
            {feeStructure ? (
              <span>
                Assign <span className="font-medium">{feeStructure.name}</span> to selected grades
              </span>
            ) : (
              'Select grades to assign this fee structure'
            )}
          </DialogDescription>
        </DialogHeader>
        
        {feeStructure && (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="description">Assignment Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Q1 2024 Fee Assignment"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-3 bg-secondary/30 rounded-lg p-1.5">
                  <Button
                    type="button" 
                    variant="ghost"
                    size="sm"
                    className={`flex-1 ${activeTab === 'gradelevels' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                    onClick={() => setActiveTab('gradelevels')}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Grade Levels
                  </Button>
                  <Button
                    type="button" 
                    variant="ghost"
                    size="sm"
                    className={`flex-1 ${activeTab === 'grades' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                    onClick={() => setActiveTab('grades')}
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Classes
                  </Button>
                </div>
                
                {activeTab === 'gradelevels' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Select Grade Levels</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleSelectAll(gradeLevels)}
                      >
                        {gradeLevels.length > 0 && gradeLevels.every(gl => selectedGradeIds.includes(gl.id)) 
                          ? 'Deselect All' 
                          : 'Select All'}
                      </Button>
                    </div>
                    
                    {isLoadingGradeLevels ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2 text-sm font-medium">Loading grade levels...</span>
                      </div>
                    ) : gradeLevelsError ? (
                      <div className="p-4 border border-rose-200/40 rounded-md bg-rose-50/30 text-rose-700/70">
                        Failed to load grade levels: {gradeLevelsError}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                        {gradeLevels.length > 0 ? gradeLevels.map((gradeLevel) => (
                          <Button
                            key={gradeLevel.id}
                            type="button"
                            variant={selectedGradeIds.includes(gradeLevel.id) ? "default" : "outline"}
                            className={`h-auto py-3 px-3 justify-start items-start text-left flex-col w-full ${selectedGradeIds.includes(gradeLevel.id) ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-primary/10'}`}
                            onClick={() => handleGradeToggle(gradeLevel.id)}
                          >
                            <div className="flex items-start gap-2 w-full">
                              <BookOpen className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{gradeLevel.gradeLevel.name}</div>
                                <div className="text-xs opacity-80 truncate max-w-full">
                                  {gradeLevel.curriculum.name}
                                </div>
                                {gradeLevel.tenantStreams && gradeLevel.tenantStreams.length > 0 && (
                                  <div className="text-xs opacity-80 mt-1">
                                    {gradeLevel.tenantStreams.length} {gradeLevel.tenantStreams.length === 1 ? 'stream' : 'streams'}
                                  </div>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                <div className={`w-5 h-5 rounded-full ${selectedGradeIds.includes(gradeLevel.id) ? 'bg-white' : 'border border-primary'} flex items-center justify-center`}>
                                  {selectedGradeIds.includes(gradeLevel.id) && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Button>
                        )) : (
                          <div className="col-span-3 text-center p-4 text-gray-500">
                            No grade levels available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'grades' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Select Classes</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleSelectAll(availableGrades)}
                      >
                        {availableGrades.length > 0 && availableGrades.every(g => selectedGradeIds.includes(g.id)) 
                          ? 'Deselect All' 
                          : 'Select All'}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                      {availableGrades.length > 0 ? availableGrades.map((grade) => (
                        <Button
                          key={grade.id}
                          type="button"
                          variant={selectedGradeIds.includes(grade.id) ? "default" : "outline"}
                          className={`h-auto py-3 px-3 justify-start items-start text-left flex-col w-full ${selectedGradeIds.includes(grade.id) ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-primary/10'}`}
                          onClick={() => handleGradeToggle(grade.id)}
                        >
                          <div className="flex items-start gap-2 w-full">
                            <GraduationCap className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {grade.name}
                                {grade.section && <span> - {grade.section}</span>}
                              </div>
                              {grade.studentCount !== undefined && (
                                <div className="text-xs opacity-80 mt-1">
                                  {grade.studentCount} {grade.studentCount === 1 ? 'student' : 'students'}
                                </div>
                              )}
                              {grade.feeStructureId && (
                                <div className={`text-xs mt-1 ${grade.feeStructureId === feeStructure?.id ? 'text-green-500' : 'text-amber-500'}`}>
                                  {grade.feeStructureId === feeStructure?.id ? 'Already assigned' : 'Has fee structure'}
                                </div>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <div className={`w-5 h-5 rounded-full ${selectedGradeIds.includes(grade.id) ? 'bg-white' : 'border border-primary'} flex items-center justify-center`}>
                                {selectedGradeIds.includes(grade.id) && (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        </Button>
                      )) : (
                        <div className="col-span-3 text-center p-4 text-gray-500">
                          No classes available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Selection summary */}
              {selectedGradeIds.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">Selected Items ({selectedGradeIds.length})</div>
                    {selectedGradeIds.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setSelectedGradeIds([])}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedGradeIds.slice(0, 8).map(gradeId => {
                      // Try to find in grade levels first
                      const gradeLevel = gradeLevels.find(gl => gl.id === gradeId)
                      const grade = availableGrades.find(g => g.id === gradeId)
                      const name = gradeLevel ? gradeLevel.gradeLevel.name : grade ? `${grade.name}${grade.section ? ` ${grade.section}` : ''}` : '';
                      
                      return (
                        <Badge key={gradeId} variant="secondary" className="px-2 py-1 flex items-center gap-1 bg-primary/5 hover:bg-primary/10 text-xs border border-primary/20">
                          {name}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-red-500" 
                            onClick={() => handleGradeToggle(gradeId)}
                          />
                        </Badge>
                      )
                    })}
                    {selectedGradeIds.length > 8 && (
                      <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10 border-primary/20">
                        +{selectedGradeIds.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-rose-50/30 border border-rose-200/40 rounded-md p-3">
                  <p className="text-sm text-rose-700/70">{error}</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || selectedGradeIds.length === 0}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  `Assign to ${selectedGradeIds.length} ${activeTab === 'gradelevels' ? 'Grade Level' : 'Class'}${selectedGradeIds.length !== 1 ? 's' : ''}`
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
