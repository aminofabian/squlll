'use client'

import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import { useToast } from '@/components/ui/use-toast'

/** Toast when a teacher publishes notes visible to this student (WS push). */
export function useStudentNotesLiveUpdates() {
  const { toast } = useToast()

  useDomainRealtime({
    onNotesPublished: (payload) => {
      toast({
        title: 'New study notes',
        description: payload.title
          ? `${payload.title} is now available`
          : 'New notes were published for your class.',
      })
    },
  })
}
