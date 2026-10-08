'use client'

import { useEffect } from 'react'
import { useRealtime } from './RealtimeProvider'

/**
 * Keeps a pickup-point request list in sync across portals: when the counterpart
 * party (parent ↔ student) acts, the backend notifies them, and that notification
 * arrives on the shared socket. We refetch on any `transport.stop_request_*`
 * envelope so the other portal updates without a manual refresh.
 */
export function useStopRequestLiveUpdates(
  onRefresh: () => void | Promise<void>,
): void {
  const { socket } = useRealtime()

  useEffect(() => {
    if (!socket) return
    const handler = (envelope: { payload?: { type?: string } }) => {
      const type = envelope?.payload?.type
      if (type && type.startsWith('transport.stop_request')) {
        void onRefresh()
      }
    }
    socket.on('notification.new', handler)
    return () => {
      socket.off('notification.new', handler)
    }
  }, [socket, onRefresh])
}
