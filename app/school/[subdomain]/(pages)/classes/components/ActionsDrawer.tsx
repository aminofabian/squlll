"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { 
  UserPlus, 
  Layers, 
  BookOpen,
  GraduationCap,
  Menu,
  X
} from 'lucide-react'
import CreateClassDrawer from '@/app/school/components/CreateClassDrawer'
import type { GradeLevel } from '@/lib/types/school-config'

interface ActionsDrawerProps {
  // General actions
  onCreateClass?: () => void
  onViewSubjects?: () => void
  
  // Grade-specific actions
  selectedGrade?: GradeLevel | null
  onAddStream?: (gradeId: string) => void
  onAssignTeacher?: (gradeLevelId: string, gradeName: string) => void
  
  // Stream-specific actions
  selectedStreamId?: string
  selectedStreamName?: string
  onAssignStreamTeacher?: (streamId: string, streamName: string) => void
}

export function ActionsDrawer({
  onCreateClass,
  onViewSubjects,
  selectedGrade,
  onAddStream,
  onAssignTeacher,
  selectedStreamId,
  selectedStreamName,
  onAssignStreamTeacher,
}: ActionsDrawerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleAddStream = () => {
    if (selectedGrade && onAddStream) {
      onAddStream(selectedGrade.id)
      setIsOpen(false)
    }
  }

  const handleAssignTeacher = () => {
    if (selectedStreamId && selectedStreamName && onAssignStreamTeacher) {
      onAssignStreamTeacher(selectedStreamId, selectedStreamName)
      setIsOpen(false)
    } else if (selectedGrade && onAssignTeacher) {
      onAssignTeacher(selectedGrade.id, selectedGrade.name)
      setIsOpen(false)
    }
  }

  const handleViewSubjects = () => {
    if (onViewSubjects) {
      onViewSubjects()
      setIsOpen(false)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-primary/20 bg-white dark:bg-slate-800 text-primary hover:bg-primary/5"
        >
          <Menu className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Actions</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="border-b border-primary/20">
          <DrawerTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Actions
          </DrawerTitle>
          <DrawerDescription className="text-slate-600 dark:text-slate-400">
            Manage classes, subjects, streams, and teachers
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-6 space-y-4">
          {/* General Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">
              General Actions
            </h3>
            
            {onCreateClass && (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors">
                <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">Create Class</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Add a new class or grade level</p>
                </div>
                <CreateClassDrawer onClassCreated={() => {
                  onCreateClass()
                  setIsOpen(false)
                }} />
              </div>
            )}
            
            {onViewSubjects && (
              <button
                onClick={handleViewSubjects}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors text-left"
              >
                <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">View Subjects</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Browse all subjects</p>
                </div>
              </button>
            )}
          </div>

          {/* Grade-specific Actions */}
          {selectedGrade && (
            <>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-4" />
              
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">
                  Grade Actions - {selectedGrade.name}
                </h3>
                
                {onAddStream && (
                  <button
                    onClick={handleAddStream}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
                      <Layers className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100">Add Stream</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Create a new stream for {selectedGrade.name}</p>
                    </div>
                  </button>
                )}
                
                {(onAssignTeacher || onAssignStreamTeacher) && (
                  <button
                    onClick={handleAssignTeacher}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {selectedStreamId ? 'Assign Stream Teacher' : 'Assign Class Teacher'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {selectedStreamId 
                          ? `Assign teacher to ${selectedStreamName}` 
                          : `Assign teacher to ${selectedGrade.name}`}
                      </p>
                    </div>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <DrawerFooter className="border-t border-primary/20">
          <DrawerClose asChild>
            <Button variant="outline" className="border-primary/20">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

