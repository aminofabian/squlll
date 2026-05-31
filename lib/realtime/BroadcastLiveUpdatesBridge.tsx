'use client'

import { useBroadcastLiveUpdates } from './useBroadcastLiveUpdates'

/** Mount once inside RealtimeProvider for student / parent / admin broadcast toasts. */
export function BroadcastLiveUpdatesBridge() {
  useBroadcastLiveUpdates()
  return null
}
