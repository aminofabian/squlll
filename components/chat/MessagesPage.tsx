'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useChat } from '@/lib/chat/ChatProvider'
import type { ChatConversation } from '@/lib/chat/types'
import { cn } from '@/lib/utils'
import { ChatDetailPane } from './ChatDetailPane'
import { ChatErrorBanner } from './ChatErrorBanner'
import { ChatPageTitle } from './ChatPageTitle'
import { ConversationsPane } from './ConversationsPane'

interface MessagesPageProps {
  title?: string
  className?: string
  preferredParticipantId?: string | null
  preferredParticipantLabel?: string | null
}

/** `undefined` means "follow the preferred participant"; `null` means nothing is open. */
type SelectionChoice = string | null | undefined

function findConversationWith(
  conversations: ChatConversation[],
  participantId: string | null | undefined,
): ChatConversation | undefined {
  if (!participantId) return undefined
  return conversations.find(
    (c) => c.participant1Id === participantId || c.participant2Id === participantId,
  )
}

export function MessagesPage({
  title = 'Messages',
  className,
  preferredParticipantId,
  preferredParticipantLabel,
}: MessagesPageProps) {
  const params = useParams()
  const subdomain = typeof params.subdomain === 'string' ? params.subdomain : ''
  const { conversations, loading, error, refetchConversations } = useChat()
  const [choice, setChoice] = useState<SelectionChoice>(undefined)
  const [directDismissed, setDirectDismissed] = useState(false)

  const preferredMatch = findConversationWith(conversations, preferredParticipantId)
  const selectedId = choice === undefined ? (preferredMatch?.id ?? null) : choice
  const selected = conversations.find((c) => c.id === selectedId) ?? null
  const showDirectChat =
    Boolean(preferredParticipantId) &&
    !directDismissed &&
    !selected &&
    !loading &&
    !preferredMatch
  const directRecipientId = showDirectChat ? (preferredParticipantId ?? null) : null
  const detailOpen = Boolean(selected) || showDirectChat

  const handleBack = () => {
    setChoice(null)
    setDirectDismissed(true)
  }

  return (
    <div className={cn('flex h-[calc(100vh-8rem)] min-h-[28rem] flex-col gap-4', className)}>
      <ChatPageTitle title={title} />

      {error ? <ChatErrorBanner message={error} /> : null}

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <ConversationsPane
          className={detailOpen ? 'hidden md:flex' : 'flex'}
          conversations={conversations}
          selectedId={selected?.id ?? null}
          onSelect={(conversation) => setChoice(conversation.id)}
          loading={loading}
        />
        <ChatDetailPane
          className={detailOpen ? 'flex' : 'hidden md:flex'}
          subdomain={subdomain}
          selected={selected}
          directRecipientId={directRecipientId}
          directRecipientLabel={preferredParticipantLabel ?? undefined}
          onBack={handleBack}
          onDirectSent={() => void refetchConversations()}
        />
      </div>
    </div>
  )
}
