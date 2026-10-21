'use client'

import { MessagesPage } from '@/components/chat/MessagesPage'
import { tp } from '../styles/portal'

export default function TeacherMessagesPage() {
  return (
    <div className={tp.page}>
      <MessagesPage title="Messages" />
    </div>
  )
}
