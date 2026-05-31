'use client'

import type { ReactNode } from 'react'
import { RealtimeProvider } from '@/lib/realtime/RealtimeProvider'
import { BroadcastLiveUpdatesBridge } from '@/lib/realtime/BroadcastLiveUpdatesBridge'
import { ChatProvider } from '@/lib/chat/ChatProvider'
import { NotificationProvider } from '@/lib/notifications/NotificationProvider'

export function RealtimeWrapper({ children }: { children: ReactNode }) {
  return (
    <RealtimeProvider>
      <BroadcastLiveUpdatesBridge />
      <ChatProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </ChatProvider>
    </RealtimeProvider>
  )
}
