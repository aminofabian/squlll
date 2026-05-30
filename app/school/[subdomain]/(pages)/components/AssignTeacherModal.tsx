'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { Loader2, Search, X } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FormField } from '../classes/components/FormField'

interface Teacher {
  id: string
  fullName: string
  email: string
  department: string
  isActive: boolean
  classTeacherAssignments: {
    id: string
    active: boolean
    stream: {
      stream: {
        name: string
      }
    } | null
    gradeLevel: {
      gradeLevel: {
        name: string
      }
    } | null
  }[]
}

interface AssignTeacherModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  streamId?: string
  streamName?: string
  gradeLevelId?: string
  gradeName?: string
  currentTeacherId?: string // For unassign functionality
  currentTeacherName?: string // For unassign functionality
}

export function AssignTeacherModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  streamId, 
  streamName, 
  gradeLevelId, 
  gradeName,
  currentTeacherId,
  currentTeacherName
}: AssignTeacherModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isUnassigning, setIsUnassigning] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectionError, setSelectionError] = useState('')
  const queryClient = useQueryClient()

  // Fetch teachers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTeachers()
    }
  }, [isOpen])

  // Filter teachers based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTeachers(teachers)
    } else {
      const filtered = teachers.filter(teacher => 
        teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredTeachers(filtered)
    }
  }, [teachers, searchTerm])

  const fetchTeachers = async () => {
    setIsLoading(true)
    try {
      const query = `
        query GetAllTeachers {
          getAllTeachers {
            id
            fullName
            email
            department
            isActive
            classTeacherAssignments {
              id
              active
              stream {
                stream { name }
              }
              gradeLevel {
                gradeLevel { name }
              }
            }
          }
        }
      `

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch teachers')
      }

      const data = await response.json()
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL query failed')
      }
      
      const teachers = data.data?.getAllTeachers || []
      
      setTeachers(teachers)
      setFilteredTeachers(teachers)
    } catch (error) {
      console.error('Error fetching teachers:', error)
      toast.error('Error', {
        description: 'Failed to load teachers. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignTeacher = async () => {
    if (!selectedTeacher) {
      setSelectionError('Please select a teacher from the list below')
      return
    }
    setSelectionError('')

    setIsAssigning(true)

    try {
      const requestBody: any = {
        teacherId: selectedTeacher.id,
      }

      if (streamId) {
        requestBody.streamId = streamId
      } else if (gradeLevelId) {
        requestBody.gradeLevelId = gradeLevelId
      }

      const response = await fetch('/api/school/assign-class-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      
      console.log('Assign teacher response:', { status: response.status, data })
      
      if (!response.ok) {
        // Check if there are GraphQL error details
        if (data.details && Array.isArray(data.details) && data.details.length > 0) {
          const firstError = data.details[0];
          throw new Error(firstError.message || data.error || 'Failed to assign class teacher');
        }
        throw new Error(data.error || data.details || 'Failed to assign class teacher')
      }

      // Show success message
      const assignmentTarget = streamName || gradeName || 'class'
      toast.success(`Teacher Assigned Successfully`, {
        description: `${selectedTeacher.fullName} has been assigned as class teacher for ${assignmentTarget}.`,
        duration: 5000
      })
      
      // Invalidate and refetch school configuration to show the updated assignment
      await queryClient.invalidateQueries({ queryKey: ['schoolConfig'] })
      await queryClient.invalidateQueries({ queryKey: ['classTeacherAssignment'] })
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error assigning teacher:', error)
      
      const errorMessage = error instanceof Error ? error.message : "An error occurred while assigning the teacher"
      
      toast.error("Assignment Failed", {
        description: errorMessage,
        duration: 6000
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassignTeacher = async () => {
    const teacherToUnassign = selectedTeacher || (currentTeacherId ? { id: currentTeacherId, fullName: currentTeacherName } : null)
    
    if (!teacherToUnassign) {
      toast.error('Error', {
        description: 'No teacher to unassign',
      })
      return
    }

    setIsUnassigning(true)

    try {
      console.log('🔍 Unassigning teacher:', {
        teacherId: teacherToUnassign.id,
        teacherName: teacherToUnassign.fullName,
        streamId,
        gradeLevelId
      })

      const requestBody = {
        teacherId: teacherToUnassign.id
        // Note: UnassignClassTeacher only accepts teacherId, not streamId/gradeLevelId
      }

      console.log('🔍 Unassign request body:', JSON.stringify(requestBody, null, 2))

      const response = await fetch('/api/school/unassign-class-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('🔍 Unassign response status:', response.status)

      const data = await response.json()
      console.log('🔍 Unassign response data:', data)

      if (!response.ok) {
        console.error('🔍 Unassign response error:', data)
        // Check if there are API error details
        if (data.details && Array.isArray(data.details) && data.details.length > 0) {
          const firstError = data.details[0];
          throw new Error(firstError.message || data.error || 'Failed to unassign class teacher');
        }
        throw new Error(data.error || data.details || 'Failed to unassign class teacher')
      }

      if (!data.success) {
        console.warn('🔍 Unassign operation was not successful:', data)
        throw new Error('Unassign operation failed')
      }

      // Show success message
      const assignmentTarget = streamName || gradeName || 'class'
      toast.success(`Teacher Unassigned Successfully`, {
        description: `${teacherToUnassign.fullName || 'Teacher'} has been unassigned from ${assignmentTarget}.`,
        duration: 5000
      })
      
      // Invalidate and refetch school configuration to show the updated assignment
      await queryClient.invalidateQueries({ queryKey: ['schoolConfig'] })
      await queryClient.invalidateQueries({ queryKey: ['classTeacherAssignment'] })
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('🔍 Error unassigning teacher:', error)
      
      let errorMessage = "An error occurred while unassigning the teacher"
      
      if (error instanceof Error) {
        if (error.message.includes('INTERNAL_SERVER_ERROR')) {
          errorMessage = "Server error occurred. This might be due to the teacher not being properly assigned or a database constraint issue."
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = "Authentication failed. Please log in again."
        } else if (error.message.includes('HTTP 403')) {
          errorMessage = "You don't have permission to unassign teachers."
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error("Unassign Failed", {
        description: errorMessage,
        duration: 8000
      })
    } finally {
      setIsUnassigning(false)
    }
  }

  const handleClose = () => {
    setSelectedTeacher(null)
    setSearchTerm('')
    setSelectionError('')
    onClose()
  }

  const displayName = streamName || gradeName || 'Selected Class'

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden border-slate-200/80 bg-slate-50/50 p-0 sm:max-w-lg dark:border-slate-800 dark:bg-slate-950">
        <DialogHeader className="border-b border-slate-200/80 bg-white px-5 py-4 text-left dark:border-slate-800 dark:bg-slate-900">
          <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {currentTeacherId ? 'Manage class teacher' : 'Assign class teacher'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {currentTeacherId ? (
              <>
                Currently assigned:{' '}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {currentTeacherName}
                </span>
              </>
            ) : (
              <>Choose who will be the main teacher for this class.</>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          <div className="rounded-lg border border-slate-200/80 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Assigning to
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-100">
              {displayName}
            </p>
          </div>

          <FormField
            id="teacher-search"
            label="Find a teacher"
            hint="Search by name, email, or department"
            error={selectionError}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="teacher-search"
                placeholder="Start typing a name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  if (selectionError) setSelectionError('')
                }}
                className="h-9 pl-9 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </FormField>

          <div className="min-h-0 flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : filteredTeachers.length === 0 ? (
              <p className="py-10 text-center text-xs text-slate-400">
                {searchTerm ? 'No teachers match your search.' : 'No teachers found.'}
              </p>
            ) : (
              <ScrollArea className="h-[min(50vh,320px)]">
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/40">
                  {filteredTeachers.map((teacher) => {
                    const isCurrentTeacher = teacher.id === currentTeacherId
                    const isSelected = selectedTeacher?.id === teacher.id
                    const hasActiveAssignments = teacher.classTeacherAssignments.some(assignment => assignment.active)
                    
                    return (
                      <li key={teacher.id}>
                        <button
                          type="button"
                          className={`w-full px-3 py-2.5 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                            isSelected
                              ? 'bg-slate-50 dark:bg-slate-800/60'
                              : ''
                          }`}
                          onClick={() => {
                            setSelectedTeacher(teacher)
                            setSelectionError('')
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                {teacher.fullName}
                              </p>
                              <p className="truncate text-[11px] text-slate-400">
                                {teacher.email} · {teacher.department}
                              </p>
                              {hasActiveAssignments && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {teacher.classTeacherAssignments
                                    .filter(assignment => assignment.active)
                                    .map(assignment => (
                                      <span
                                        key={assignment.id}
                                        className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-800"
                                      >
                                        {assignment.stream?.stream?.name || assignment.gradeLevel?.gradeLevel?.name || 'Assigned'}
                                      </span>
                                    ))}
                                </div>
                              )}
                            </div>
                            <div className="flex shrink-0 flex-col gap-1">
                              {isCurrentTeacher && (
                                <Badge variant="outline" className="text-[10px] h-5 border-amber-200 bg-amber-50 text-amber-700">
                                  Current
                                </Badge>
                              )}
                              {isSelected && !isCurrentTeacher && (
                                <Badge variant="outline" className="text-[10px] h-5">
                                  Selected
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </ScrollArea>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200/80 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-slate-400">
            {selectedTeacher
              ? `Selected: ${selectedTeacher.fullName}`
              : 'Select a teacher to continue'}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={handleClose} 
            disabled={isAssigning || isUnassigning}
          >
            Cancel
          </Button>
          
          {currentTeacherId && !selectedTeacher && (
            <Button 
              type="button" 
              variant="outline"
              size="sm"
              onClick={handleUnassignTeacher} 
              disabled={isAssigning || isUnassigning}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              {isUnassigning ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Remove teacher
                </>
              )}
            </Button>
          )}
          
          {(selectedTeacher || !currentTeacherId) && (
            <Button 
              type="button"
              size="sm"
              onClick={
                selectedTeacher && selectedTeacher.classTeacherAssignments.some(assignment => assignment.active)
                  ? handleUnassignTeacher 
                  : handleAssignTeacher
              } 
              disabled={(isAssigning || isUnassigning) || (!selectedTeacher && !currentTeacherId)}
              variant={
                selectedTeacher && selectedTeacher.classTeacherAssignments.some(assignment => assignment.active)
                  ? "outline"
                  : "default"
              }
              className={
                selectedTeacher && selectedTeacher.classTeacherAssignments.some(assignment => assignment.active)
                  ? "h-9 min-w-[9rem] border-red-200 text-red-600 hover:bg-red-50"
                  : "h-9 min-w-[9rem]"
              }
            >
              {(isAssigning || isUnassigning) ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  {selectedTeacher && selectedTeacher.classTeacherAssignments.some(assignment => assignment.active) ? 'Removing...' : 'Assigning...'}
                </>
              ) : (
                selectedTeacher && selectedTeacher.classTeacherAssignments.some(assignment => assignment.active)
                  ? 'Remove teacher'
                  : 'Assign teacher'
              )}
            </Button>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
