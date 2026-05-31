'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MessagesPage } from '@/components/chat/MessagesPage'

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
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <MessagesPage
        title="School Messages"
        className="h-[min(720px,calc(100vh-10rem))]"
        preferredParticipantId={preferredParticipantId}
        preferredParticipantLabel={preferredParticipantLabel}
      />
    </div>
  )
}
