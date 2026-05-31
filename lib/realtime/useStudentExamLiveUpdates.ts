'use client'

import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import { useToast } from '@/components/ui/use-toast'

/** Toast when exam marks are posted for this student (WS push). */
export function useStudentExamLiveUpdates() {
  const { toast } = useToast()

  useDomainRealtime({
    onExamResultsReleased: (payload) => {
      toast({
        title: 'New exam results',
        description: payload.title
          ? `${payload.title}: ${payload.score}/${payload.maxScore}`
          : 'Your exam results were updated.',
      })
    },
  })
}
