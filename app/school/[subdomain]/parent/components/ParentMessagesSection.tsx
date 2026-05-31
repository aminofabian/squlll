'use client'

import { MessagesPage } from '@/components/chat/MessagesPage'

/** Real-time teacher/parent chat via shared ChatProvider + MessagesPage. */
export function ParentMessagesSection() {
  return (
    <MessagesPage
      title="Messages from Teachers"
      className="h-[min(720px,calc(100vh-10rem))]"
    />
  )
}
