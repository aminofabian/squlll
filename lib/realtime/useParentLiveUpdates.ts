'use client'

import { useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useDomainRealtime } from './useDomainRealtime'

interface UseParentLiveUpdatesOptions {
  studentIds: string[]
  gradeIds: string[]
  selectedStudentId: string | null
  onRefresh: () => void | Promise<void>
}

export function useParentLiveUpdates({
  studentIds,
  gradeIds,
  selectedStudentId,
  onRefresh,
}: UseParentLiveUpdatesOptions) {
  const { toast } = useToast()

  useDomainRealtime({
    onFeePaymentUpdated: (payload) => {
      if (!studentIds.includes(payload.studentId)) return
      void onRefresh()
      toast({
        title: 'Payment update',
        description: payload.studentName
          ? `Payment recorded for ${payload.studentName}.`
          : `Payment of ${payload.amount} recorded.`,
      })
    },
    onExamResultsReleased: (payload) => {
      if (!studentIds.includes(payload.studentId)) return
      void onRefresh()
      toast({
        title: 'Exam results',
        description: payload.title
          ? `${payload.title} results are available.`
          : 'New exam results posted.',
      })
    },
    onAssignmentGraded: (payload) => {
      if (!studentIds.includes(payload.studentId)) return
      void onRefresh()
      toast({
        title: 'Assignment graded',
        description: payload.title
          ? `${payload.title}: ${payload.grade}/${payload.maxScore}`
          : 'An assignment was graded.',
      })
    },
    onAttendanceRegisterSubmitted: () => {
      if (!selectedStudentId) return
      void onRefresh()
    },
    onNotesPublished: (payload) => {
      const relevant =
        payload.visibility === 'SCHOOL' ||
        (payload.gradeLevelId && gradeIds.includes(payload.gradeLevelId))
      if (!relevant) return
      void onRefresh()
      toast({
        title: 'New study notes',
        description: payload.title
          ? `${payload.title} was published`
          : 'New study notes are available.',
      })
    },
  })
}
