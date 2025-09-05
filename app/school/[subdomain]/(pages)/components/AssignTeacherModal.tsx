'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
import { Loader2, Search, User, Mail, BookOpen, GraduationCap, X } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

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
      toast.error('Validation Error', {
        description: 'Please select a teacher to assign',
      })
      return
    }

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
    if (!currentTeacherId) {
      toast.error('Error', {
        description: 'No teacher to unassign',
      })
      return
    }

    setIsUnassigning(true)

    try {
      const mutation = `
        mutation UnassignClassTeacher {
          unassignClassTeacher(
            input: {
              teacherId: "${currentTeacherId}"
            }
          )
        }
      `

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: mutation }),
      })

      if (!response.ok) {
        throw new Error('Failed to unassign teacher')
      }

      const data = await response.json()
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL mutation failed')
      }

      // Show success message
      const assignmentTarget = streamName || gradeName || 'class'
      toast.success(`Teacher Unassigned Successfully`, {
        description: `${currentTeacherName} has been unassigned from ${assignmentTarget}.`,
        duration: 5000
      })
      
      // Invalidate and refetch school configuration to show the updated assignment
      await queryClient.invalidateQueries({ queryKey: ['schoolConfig'] })
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error unassigning teacher:', error)
      
      const errorMessage = error instanceof Error ? error.message : "An error occurred while unassigning the teacher"
      
      toast.error("Unassign Failed", {
        description: errorMessage,
        duration: 6000
      })
    } finally {
      setIsUnassigning(false)
    }
  }

  const handleClose = () => {
    setSelectedTeacher(null)
    setSearchTerm('')
    onClose()
  }

  const displayName = streamName || gradeName || 'Selected Class'

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col rounded-none border-2 border-primary/20 bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-slate-800">Assign Class Teacher</DialogTitle>
          <DialogDescription className="text-slate-600">
            {currentTeacherId ? (
              <div className="space-y-2">
                <div>Current teacher for <strong>{displayName}</strong>: <strong className="text-primary">{currentTeacherName}</strong></div>
                <div>Select a new teacher to assign or unassign the current teacher.</div>
              </div>
            ) : (
              <div>Select a teacher to assign as class teacher for <strong>{displayName}</strong></div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Search Input */}
          <div className="flex items-center gap-3 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
              <Input
                placeholder="Search teachers by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-primary/20 rounded-none focus:border-primary focus:ring-0 bg-white text-slate-800 placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Teachers List */}
          <div className="flex-1 min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
                <span className="text-slate-700">Loading teachers...</span>
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                {searchTerm ? 'No teachers match your search.' : 'No teachers found.'}
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="grid gap-3 pr-4">
                  {filteredTeachers.map((teacher) => (
                    <div 
                      key={teacher.id}
                      className={`cursor-pointer transition-all hover:shadow-md border-2 border-primary/20 bg-white p-4 ${
                        selectedTeacher?.id === teacher.id 
                          ? 'ring-2 ring-primary bg-primary/5 border-primary/40' 
                          : 'hover:bg-primary/5 hover:border-primary/40'
                      }`}
                      onClick={() => setSelectedTeacher(teacher)}
                    >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 mt-1">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-800">{teacher.fullName}</div>
                              <div className="flex items-center gap-1 text-sm text-slate-600 mb-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{teacher.email}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                                <BookOpen className="h-3 w-3" />
                                {teacher.department}
                              </div>
                              {teacher.classTeacherAssignments.some(assignment => assignment.active) && (
                                <div className="space-y-1">
                                  <div className="text-xs text-slate-500 font-medium">Current Assignments:</div>
                                  {teacher.classTeacherAssignments
                                    .filter(assignment => assignment.active)
                                    .map(assignment => (
                                      <div key={assignment.id} className="flex items-center gap-1 text-xs">
                                        <GraduationCap className="h-3 w-3 text-primary" />
                                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                                          {assignment.stream?.stream?.name || assignment.gradeLevel?.gradeLevel?.name || 'Unknown'}
                                        </Badge>
                                      </div>
                                    ))
                                  }
                                </div>
                              )}
                            </div>
                          </div>
                          {selectedTeacher?.id === teacher.id && (
                            <Badge variant="default" className="ml-2 bg-primary text-white">Selected</Badge>
                          )}
                        </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose} 
            disabled={isAssigning || isUnassigning}
            className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-none"
          >
            Cancel
          </Button>
          {currentTeacherId && (
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleUnassignTeacher} 
              disabled={isAssigning || isUnassigning}
              className="bg-red-600 hover:bg-red-700 text-white border-2 border-red-600 hover:border-red-700 rounded-none"
            >
              {isUnassigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unassigning...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Unassign Current Teacher
                </>
              )}
            </Button>
          )}
          <Button 
            type="button" 
            onClick={handleAssignTeacher} 
            disabled={isAssigning || isUnassigning || !selectedTeacher}
            className="bg-primary hover:bg-primary/90 text-white border-2 border-primary hover:border-primary/90 rounded-none"
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign Teacher'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
