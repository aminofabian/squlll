"use client"

import React from 'react'
import { ActionsDrawer } from './ActionsDrawer'
import type { GradeLevel } from '@/lib/types/school-config'

interface ActionsBarProps {
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

export function ActionsBar(props: ActionsBarProps) {
  return <ActionsDrawer {...props} />
}

