'use client'

import { useState, useEffect } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, School, GraduationCap, X, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Grade } from '../types'
import { useGradeLevels } from '../hooks/useGradeLevels'

interface FeeStructure {
  id: string
  name: string
  academicYear?: string
  academicYearId?: string
  termId?: string
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
  const [filteredGradeLevels, setFilteredGradeLevels] = useState<string[]>([])
  const [isLoadingFilteredStructure, setIsLoadingFilteredStructure] = useState<boolean>(false)
  const { toast } = useToast()
  
  // Fetch grade levels as fallback when no classes are available
  const { gradeLevels, isLoading: isLoadingGradeLevels, error: gradeLevelsError } = useGradeLevels()
  
  // Function to abbreviate grade names
  const abbreviateGradeName = (name: string): string => {
    const normalized = name.toLowerCase().trim()
    
    if (normalized.includes('playgroup')) return 'PG'
    if (normalized.includes('pp1') || normalized === 'pre-primary 1') return 'PP1'
    if (normalized.includes('pp2') || normalized === 'pre-primary 2') return 'PP2'
    
    // Grade 1-6 → G1-G6
    const gradeMatch = normalized.match(/grade\s*(\d+)/i)
    if (gradeMatch) {
      const gradeNum = parseInt(gradeMatch[1])
      if (gradeNum >= 1 && gradeNum <= 6) {
        return `G${gradeNum}`
      }
      // Grade 7 → F1, Grade 8 → F2, Grade 9 → F3, Grade 10 → F4, Grade 11 → F5, Grade 12 → F6
      if (gradeNum === 7) return 'F1'
      if (gradeNum === 8) return 'F2'
      if (gradeNum === 9) return 'F3'
      if (gradeNum === 10) return 'F4'
      if (gradeNum === 11) return 'F5'
      if (gradeNum === 12) return 'F6'
    }
    
    // Form 1-6 → F1-F6
    const formMatch = normalized.match(/form\s*(\d+)/i)
    if (formMatch) {
      const formNum = parseInt(formMatch[1])
      if (formNum >= 1 && formNum <= 6) {
        return `F${formNum}`
      }
    }
    
    // If no match, return original
    return name
  }
  
  // Function to get sort order for grade levels
  const getGradeSortOrder = (name: string): number => {
    const normalized = name.toLowerCase().trim()
    
    if (normalized.includes('playgroup')) return 1
    if (normalized.includes('pp1') || normalized === 'pre-primary 1') return 2
    if (normalized.includes('pp2') || normalized === 'pre-primary 2') return 3
    
    // Grade 1-6 → G1-G6 (sort order 4-9)
    const gradeMatch = normalized.match(/grade\s*(\d+)/i)
    if (gradeMatch) {
      const gradeNum = parseInt(gradeMatch[1])
      if (gradeNum >= 1 && gradeNum <= 6) {
        return 3 + gradeNum // 4-9
      }
      // Grade 7 → F1 (sort order 10), Grade 8 → F2 (11), Grade 9 → F3 (12), Grade 10 → F4 (13), Grade 11 → F5 (14), Grade 12 → F6 (15)
      if (gradeNum === 7) return 10
      if (gradeNum === 8) return 11
      if (gradeNum === 9) return 12
      if (gradeNum === 10) return 13
      if (gradeNum === 11) return 14
      if (gradeNum === 12) return 15
    }
    
    // Form 1-6 → F1-F6 (sort order 10-15, same as Grade 7-12)
    const formMatch = normalized.match(/form\s*(\d+)/i)
    if (formMatch) {
      const formNum = parseInt(formMatch[1])
      if (formNum >= 1 && formNum <= 6) {
        return 9 + formNum // 10-15 (same as Grade 7-12)
      }
    }
    
    // Default to end
    return 999
  }
  
  // Transform grade levels into Grade format for display
  const gradeLevelsAsGrades: Grade[] = gradeLevels.map(gl => ({
    id: gl.id,
    name: gl.gradeLevel.name,
    section: gl.shortName || '',
    studentCount: 0,
    feeStructureId: '',
    level: 0,
    boardingType: 'day' as const,
    isActive: gl.isActive !== false
  }))
  
  // Filter grade levels by term if filteredGradeLevels is available
  const allAvailableGrades = availableGrades.length > 0 ? availableGrades : gradeLevelsAsGrades
  const filteredGrades = filteredGradeLevels.length > 0
    ? allAvailableGrades.filter(grade => filteredGradeLevels.includes(grade.id))
    : allAvailableGrades
  
  // Sort and prepare display items
  const sortedDisplayItems = filteredGrades
    .map(item => ({
      ...item,
      abbreviatedName: abbreviateGradeName(item.name),
      sortOrder: getGradeSortOrder(item.name)
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder)
  
  // Use grade levels if no classes are available
  const displayItems = sortedDisplayItems
  const isLoading = (availableGrades.length === 0 && isLoadingGradeLevels) || isLoadingFilteredStructure
  
  // Fetch filtered fee structure by term when modal opens
  useEffect(() => {
    const fetchFilteredFeeStructure = async () => {
      if (!isOpen || !feeStructure || !feeStructure.termId || !feeStructure.academicYearId) {
        setFilteredGradeLevels([])
        return
      }

      setIsLoadingFilteredStructure(true)
      setError(null)

      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetFeeStructureByGradeAndTerm($termId: String!, $academicYearId: String!) {
                feeStructureByGradeAndTerm(
                  termId: $termId
                  academicYearId: $academicYearId
                ) {
                  id
                  name
                  academicYear { id name }
                  terms { id name }
                  gradeLevels { 
                    id
                    name
                  }
                }
              }
            `,
            variables: {
              termId: feeStructure.termId,
              academicYearId: feeStructure.academicYearId,
            },
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
          throw new Error(result.errors[0]?.message || 'Failed to fetch fee structure')
        }

        if (result.data?.feeStructureByGradeAndTerm?.gradeLevels) {
          const gradeLevelIds = result.data.feeStructureByGradeAndTerm.gradeLevels.map(
            (gl: { id: string }) => gl.id
          )
          setFilteredGradeLevels(gradeLevelIds)
          console.log('Filtered grade levels by term:', gradeLevelIds)
        } else {
          setFilteredGradeLevels([])
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch filtered fee structure'
        console.error('Error fetching filtered fee structure:', err)
        setError(errorMessage)
        setFilteredGradeLevels([])
      } finally {
        setIsLoadingFilteredStructure(false)
      }
    }

    fetchFilteredFeeStructure()
  }, [isOpen, feeStructure])

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
      
      // Debug: Log available grades
      console.log('AssignFeeStructureModal - availableGrades:', availableGrades)
      console.log('AssignFeeStructureModal - availableGrades length:', availableGrades?.length)
    }
  }, [isOpen, feeStructure, availableGrades])

  
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
      setError("Please select at least one class")
      return
    }
    
    const tenantGradeLevelIds = selectedGradeIds
    
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
  
  const allSelected = displayItems.length > 0 && selectedGradeIds.length === displayItems.length
  const isShowingGradeLevels = availableGrades.length === 0
  
  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) onClose() }} direction="right">
      <DrawerContent className="max-w-2xl">
        <DrawerHeader className="px-4 pt-4 pb-3 border-b border-slate-200/60 bg-gradient-to-br from-white via-slate-50/30 to-white">
          <DrawerTitle className="flex items-center gap-2">
            <div className="h-8 w-8 flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white">
              <Users className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900 leading-tight">
                Assign Fee Structure
              </span>
              {feeStructure && (
                <span className="text-xs text-slate-600 font-medium truncate max-w-md">
                  {feeStructure.name}
                </span>
              )}
            </div>
          </DrawerTitle>
          <DrawerDescription className="mt-2 text-xs text-slate-600">
            {feeStructure ? (
              <span>
                Select grade levels or classes to assign <span className="font-semibold text-slate-900">{feeStructure.name}</span>
              </span>
            ) : (
              'Select grades to assign this fee structure'
            )}
          </DrawerDescription>
        </DrawerHeader>
        
        {feeStructure && (
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <ScrollArea className="flex-1 px-4">
              <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold text-slate-700">Assignment Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Q1 2024 Fee Assignment"
                  className="border-slate-300 focus:border-primary focus:ring-primary/20 h-9"
                />
              </div>
              
              <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-700">
                        {isShowingGradeLevels ? 'Select Grade Levels' : 'Select Classes'}
                      </Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="h-7 text-xs border-slate-300 hover:bg-primary/10 hover:border-primary/40 hover:text-primary"
                        onClick={() => handleSelectAll(displayItems)}
                        disabled={isLoading}
                      >
                        {displayItems.length > 0 && displayItems.every(g => selectedGradeIds.includes(g.id)) 
                          ? 'Deselect All' 
                          : 'Select All'}
                      </Button>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4 bg-slate-50/50 border border-slate-200">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="ml-2 text-xs font-medium text-slate-600">Loading {isShowingGradeLevels ? 'grade levels' : 'classes'}...</span>
                      </div>
                    ) : displayItems.length === 0 ? (
                      <div className="text-center p-4 bg-slate-50/50 border border-slate-200">
                        <GraduationCap className="h-6 w-6 mx-auto text-slate-400 mb-1" />
                        <p className="text-xs text-slate-500 font-medium">No {isShowingGradeLevels ? 'grade levels' : 'classes'} available</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {displayItems.map((grade) => {
                        const isSelected = selectedGradeIds.includes(grade.id)
                        const isAlreadyAssigned = grade.feeStructureId === feeStructure?.id
                        return (
                          <button
                            key={grade.id}
                            type="button"
                            onClick={() => handleGradeToggle(grade.id)}
                            title={`${grade.name}${grade.section ? ` - ${grade.section}` : ''}`}
                            className={cn(
                              "h-auto p-2.5 border transition-all text-left cursor-pointer",
                              isSelected
                                ? "bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white border-primary"
                                : "bg-white text-slate-900 border-slate-200 hover:border-primary/40 hover:bg-primary/5"
                            )}
                          >
                            <div className="flex items-start gap-2 w-full">
                              <div className={cn(
                                "h-7 w-7 flex items-center justify-center flex-shrink-0 transition-all",
                                isSelected 
                                  ? "bg-white/20 text-white" 
                                  : "bg-primary/10 text-primary"
                              )}>
                                <GraduationCap className="h-3.5 w-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div 
                                  className={cn(
                                    "font-semibold text-xs mb-0.5",
                                    isSelected ? "text-white" : "text-slate-900"
                                  )}
                                  title={`${grade.name}${grade.section ? ` - ${grade.section}` : ''}`}
                                >
                                  {(grade as any).abbreviatedName || grade.name}
                                  {grade.section && <span className="opacity-80"> - {grade.section}</span>}
                                </div>
                                {grade.studentCount !== undefined && (
                                  <div className={cn(
                                    "text-[10px] mt-0.5",
                                    isSelected ? "text-white/90" : "text-slate-600"
                                  )}>
                                    {grade.studentCount} {grade.studentCount === 1 ? 'student' : 'students'}
                                  </div>
                                )}
                                {grade.feeStructureId && (
                                  <div className={cn(
                                    "text-[10px] mt-0.5 font-medium inline-block px-1.5 py-0.5",
                                    isSelected 
                                      ? isAlreadyAssigned 
                                        ? "text-white/90 bg-white/20" 
                                        : "text-white/80"
                                      : isAlreadyAssigned 
                                        ? "text-emerald-600 bg-emerald-50" 
                                        : "text-amber-600 bg-amber-50"
                                  )}>
                                    {isAlreadyAssigned ? '✓ Already assigned' : 'Has fee structure'}
                                  </div>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                <div className={cn(
                                  "w-4 h-4 flex items-center justify-center transition-all border-2",
                                  isSelected 
                                    ? "bg-white text-primary border-white" 
                                    : "border-slate-300"
                                )}>
                                  {isSelected && (
                                    <CheckCircle2 className="h-3 w-3" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                      </div>
                    )}
              </div>
              
              {/* Selection summary */}
              {selectedGradeIds.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 flex items-center justify-center bg-primary/20 text-primary">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-900">
                          Selected Items
                        </div>
                        <div className="text-[10px] text-slate-600">
                          {selectedGradeIds.length} {isShowingGradeLevels ? 'grade level' : 'class'}{selectedGradeIds.length !== 1 ? 's' : ''} selected
                        </div>
                      </div>
                    </div>
                    {selectedGradeIds.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => setSelectedGradeIds([])}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear all
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGradeIds.slice(0, 8).map(gradeId => {
                      const grade = displayItems.find(g => g.id === gradeId)
                      const abbreviatedName = grade ? ((grade as any).abbreviatedName || grade.name) : ''
                      const fullName = grade ? `${grade.name}${grade.section ? ` - ${grade.section}` : ''}` : ''
                      const displayName = abbreviatedName + (grade?.section ? ` - ${grade.section}` : '')
                      
                      return (
                        <Badge 
                          key={gradeId} 
                          variant="secondary" 
                          title={fullName}
                          className="px-2 py-1 flex items-center gap-1 bg-white hover:bg-primary/10 text-[10px] border border-primary/30 text-slate-700 font-medium transition-all"
                        >
                          {displayName}
                          <X 
                            className="h-2.5 w-2.5 cursor-pointer hover:text-rose-600 transition-colors" 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleGradeToggle(gradeId)
                            }}
                          />
                        </Badge>
                      )
                    })}
                    {selectedGradeIds.length > 8 && (
                      <Badge variant="outline" className="bg-white hover:bg-primary/10 border-primary/30 text-slate-700 font-medium text-[10px]">
                        +{selectedGradeIds.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-gradient-to-br from-rose-50/50 to-rose-50/30 border border-rose-200/60 p-3">
                  <div className="flex items-start gap-2">
                    <div className="h-4 w-4 flex-shrink-0 text-rose-600 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <p className="text-xs text-rose-700 font-medium">{error}</p>
                  </div>
                </div>
              )}
              </div>
            </ScrollArea>
            
            <DrawerFooter className="px-4 py-3 border-t border-slate-200/60 bg-gradient-to-br from-white via-slate-50/30 to-white">
              <div className="flex gap-2">
                <DrawerClose asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isSubmitting}
                    className="h-8 text-xs border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                  >
                    Cancel
                  </Button>
                </DrawerClose>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || selectedGradeIds.length === 0}
                  className="h-8 text-xs min-w-[120px] bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Users className="mr-1.5 h-3 w-3" />
                      Assign to {selectedGradeIds.length} {isShowingGradeLevels ? 'Grade Level' : 'Class'}{selectedGradeIds.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            </DrawerFooter>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  )
}
