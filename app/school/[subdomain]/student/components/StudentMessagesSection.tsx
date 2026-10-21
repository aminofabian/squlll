'use client'

import { MessagesPage } from '@/components/chat/MessagesPage'
import { PageHeader } from '../_ui'

interface StudentMessagesSectionProps {
  onBack: () => void
  preferredParticipantId?: string | null
  preferredParticipantLabel?: string | null
}

export function StudentMessagesSection({
  onBack,
  preferredParticipantId,
  preferredParticipantLabel,
}: StudentMessagesSectionProps) {
  return (
    <div>
      <PageHeader eyebrow="Inbox" title="School messages" onBack={onBack} />
      <MessagesPage
        title="School messages"
        // MessagesPage draws its own title row; hide it so the portal header is
        // the single source of truth for the page title.
        className="h-[min(720px,calc(100vh-16rem))] [&>div:first-child]:hidden"
        preferredParticipantId={preferredParticipantId}
        preferredParticipantLabel={preferredParticipantLabel}
      />
    </div>
  )
}
