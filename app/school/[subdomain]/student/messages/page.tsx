'use client'

import { MessagesPage } from '@/components/chat/MessagesPage'
import { PageHeader, StudentPage } from '../_ui'

export default function StudentMessagesPage() {
  return (
    <StudentPage wide>
      <PageHeader
        title="Messages"
        subtitle="Chat with your teachers, admin and support staff."
      />
      <MessagesPage
        title="Messages"
        // MessagesPage draws its own title row; hide it so the portal header is
        // the single source of truth for the page title.
        className="h-[calc(100vh-16rem)] min-h-[26rem] [&>div:first-child]:hidden"
      />
    </StudentPage>
  )
}
