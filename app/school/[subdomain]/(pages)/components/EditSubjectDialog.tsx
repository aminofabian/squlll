'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Subject } from '@/lib/types/school-config'
import { BookOpen, Clock, Code, FileText, GraduationCap, School, Star, Trophy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface EditSubjectDialogProps {
  subject: Subject
  isOpen: boolean
  onClose: () => void
  onSave: (updatedSubject: Subject) => void
  tenantSubjectId?: string  // Add this to support the GraphQL mutation
}

export function EditSubjectDialog({ subject, isOpen, onClose, onSave, tenantSubjectId }: EditSubjectDialogProps) {
  const [editedSubject, setEditedSubject] = useState<Subject>({ ...subject })
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    // If we have a tenantSubjectId, use the GraphQL mutation
    if (tenantSubjectId) {
      await handleUpdateCustomSubject()
    } else {
      // Fallback to the original onSave callback
      onSave(editedSubject)
      onClose()
    }
  }

  const handleUpdateCustomSubject = async () => {
    if (!tenantSubjectId) {
      toast.error('Missing tenant subject ID')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/school/update-custom-subject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantSubjectId,
          input: {
            name: editedSubject.name,
            totalMarks: editedSubject.totalMarks,
            isCompulsory: editedSubject.isCompulsory
          }
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update subject')
      }

      if (result.success) {
        toast.success('Subject updated successfully!')
        
        // Update the subject with the returned data
        const updatedSubject = {
          ...editedSubject,
          id: result.data.id,
          name: result.data.customSubject.name,
          totalMarks: result.data.totalMarks,
          isCompulsory: result.data.isCompulsory
        }
        
        onSave(updatedSubject)
        onClose()
      } else {
        throw new Error('Update failed')
      }
    } catch (error) {
      console.error('Error updating custom subject:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update subject')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 bg-[#246a59]">
          <DialogTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Edit Subject Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-4 bg-gradient-to-b from-[#246a59]/5 to-white">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-8">
                  <FileText className="h-5 w-5 text-[#246a59]/60" />
                </div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-1">
                  Subject Name
                </Label>
                <Input
                  id="name"
                  value={editedSubject.name}
                  onChange={(e) => setEditedSubject({ ...editedSubject, name: e.target.value })}
                  className="pl-10 focus-visible:ring-[#246a59]"
                  placeholder="Enter subject name"
                />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-8">
                  <Code className="h-5 w-5 text-[#246a59]/60" />
                </div>
                <Label htmlFor="code" className="text-sm font-medium text-gray-700 block mb-1">
                  Subject Code
                </Label>
                <Input
                  id="code"
                  value={editedSubject.code}
                  onChange={(e) => setEditedSubject({ ...editedSubject, code: e.target.value })}
                  className="pl-10 focus-visible:ring-[#246a59]"
                  placeholder="Enter subject code"
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-sm font-medium text-gray-700 block mb-1">
                  Subject Type
                </Label>
                <Select
                  value={editedSubject.subjectType}
                  onValueChange={(value) => setEditedSubject({ ...editedSubject, subjectType: value })}
                >
                  <SelectTrigger className="w-full focus:ring-[#246a59]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-[#246a59]" />
                        Core Subject
                      </div>
                    </SelectItem>
                    <SelectItem value="optional">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-[#246a59]" />
                        Optional Subject
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <div className="absolute left-3 top-8">
                  <School className="h-5 w-5 text-[#246a59]/60" />
                </div>
                <Label htmlFor="department" className="text-sm font-medium text-gray-700 block mb-1">
                  Department
                </Label>
                <Input
                  id="department"
                  value={editedSubject.department || ''}
                  onChange={(e) => setEditedSubject({ ...editedSubject, department: e.target.value })}
                  className="pl-10 focus-visible:ring-[#246a59]"
                  placeholder="Enter department"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-8">
                  <Trophy className="h-5 w-5 text-[#246a59]/60" />
                </div>
                <Label htmlFor="totalMarks" className="text-sm font-medium text-gray-700 block mb-1">
                  Total Marks
                </Label>
                <Input
                  id="totalMarks"
                  type="number"
                  value={editedSubject.totalMarks || ''}
                  onChange={(e) => setEditedSubject({ ...editedSubject, totalMarks: parseInt(e.target.value) || null })}
                  className="pl-10 focus-visible:ring-[#246a59]"
                  placeholder="Enter total marks"
                />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-8">
                  <Star className="h-5 w-5 text-[#246a59]/60" />
                </div>
                <Label htmlFor="passingMarks" className="text-sm font-medium text-gray-700 block mb-1">
                  Passing Marks
                </Label>
                <Input
                  id="passingMarks"
                  type="number"
                  value={editedSubject.passingMarks || ''}
                  onChange={(e) => setEditedSubject({ ...editedSubject, passingMarks: parseInt(e.target.value) || null })}
                  className="pl-10 focus-visible:ring-[#246a59]"
                  placeholder="Enter passing marks"
                />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-8">
                  <Clock className="h-5 w-5 text-[#246a59]/60" />
                </div>
                <Label htmlFor="creditHours" className="text-sm font-medium text-gray-700 block mb-1">
                  Credit Hours
                </Label>
                <Input
                  id="creditHours"
                  type="number"
                  value={editedSubject.creditHours || ''}
                  onChange={(e) => setEditedSubject({ ...editedSubject, creditHours: parseInt(e.target.value) || null })}
                  className="pl-10 focus-visible:ring-[#246a59]"
                  placeholder="Enter credit hours"
                />
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <Checkbox
                  id="isCompulsory"
                  checked={editedSubject.isCompulsory || false}
                  onCheckedChange={(checked) => setEditedSubject({ ...editedSubject, isCompulsory: checked === true ? true : null })}
                  className="border-[#246a59]/20 data-[state=checked]:bg-[#246a59] data-[state=checked]:border-[#246a59]"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="isCompulsory"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Compulsory Subject
                  </Label>
                  <p className="text-sm text-gray-500">
                    Mark if this subject is mandatory for all students
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[#246a59] hover:bg-[#246a59]/90 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 