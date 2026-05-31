'use client'

import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import { useToast } from '@/components/ui/use-toast'

/** Toast when a teacher grades this student's assignment (WS push). */
export function useStudentAssignmentLiveUpdates() {
  const { toast } = useToast()

  useDomainRealtime({
    onAssignmentGraded: (payload) => {
      toast({
        title: 'Assignment graded',
        description: payload.title
          ? `${payload.title}: ${payload.grade}/${payload.maxScore}`
          : `Your assignment was graded: ${payload.grade}/${payload.maxScore}`,
      })
    },
  })
}
