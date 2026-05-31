'use client'

import { useEffect } from 'react'
import { useRealtime } from '@/lib/realtime/RealtimeProvider'
import { useToast } from '@/components/ui/use-toast'
import { getCurrentUserId } from '@/lib/chat/utils'
import {
  formatBroadcastToastDescription,
  shouldSkipBroadcastToast,
  type BroadcastMessagePayload,
} from './broadcastToast'

/**
 * Toast when the school broadcasts (`broadcast_message` WS event).
 * Skips toast for the sender (same user id) to avoid duplicate alerts after broadcast.
 */
export function useBroadcastLiveUpdates() {
  const { socket } = useRealtime()
  const { toast } = useToast()

  useEffect(() => {
    if (!socket) return

    const handler = (payload: BroadcastMessagePayload) => {
      const currentUserId = getCurrentUserId()
      if (shouldSkipBroadcastToast(payload, currentUserId)) return

      toast({
        title: 'School announcement',
        description: formatBroadcastToastDescription(payload.content),
      })
    }

    socket.on('broadcast_message', handler)
    return () => {
      socket.off('broadcast_message', handler)
    }
  }, [socket, toast])
}
