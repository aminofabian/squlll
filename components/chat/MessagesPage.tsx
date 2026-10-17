'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useChat } from '@/lib/chat/ChatProvider'
import type { ChatContact, ChatConversation } from '@/lib/chat/types'
import { cn } from '@/lib/utils'
import { ChatDetailPane } from './ChatDetailPane'
import { ChatErrorBanner } from './ChatErrorBanner'
import { ChatPageTitle } from './ChatPageTitle'
import { ConversationsPane } from './ConversationsPane'
import { NewConversationDialog } from './NewConversationDialog'

interface MessagesPageProps {
  title?: string
  className?: string
  preferredParticipantId?: string | null
  preferredParticipantLabel?: string | null
  preferredParticipantType?: string | null
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
  preferredParticipantType,
}: MessagesPageProps) {
  const params = useParams()
  const searchParams = useSearchParams()
  const subdomain = typeof params.subdomain === 'string' ? params.subdomain : ''
  const deepLinkConversationId = searchParams.get('conversationId')
  const { conversations, loading, error, refetchConversations } = useChat()
  const [choice, setChoice] = useState<SelectionChoice>(
    deepLinkConversationId ?? undefined,
  )
  const [directContact, setDirectContact] = useState<ChatContact | null>(null)
  const [directDismissed, setDirectDismissed] = useState(false)
  const [newDialogOpen, setNewDialogOpen] = useState(false)

  useEffect(() => {
    if (!deepLinkConversationId) return
    const timer = window.setTimeout(() => {
      setChoice(deepLinkConversationId)
      setDirectContact(null)
      setDirectDismissed(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [deepLinkConversationId])

  const preferredMatch = findConversationWith(conversations, preferredParticipantId)
  const preferredDirect =
    preferredParticipantId && !directDismissed && !preferredMatch && !loading
      ? {
          id: preferredParticipantId,
          type: preferredParticipantType ?? 'teacher',
          name: preferredParticipantLabel ?? 'New conversation',
        }
      : null
  const directRecipient = directContact ?? preferredDirect
  const selectedId = directRecipient
    ? null
    : choice === undefined
      ? (preferredMatch?.id ?? null)
      : choice
  const selected = conversations.find((c) => c.id === selectedId) ?? null
  const detailOpen = Boolean(selected) || Boolean(directRecipient)

  const handleSelectConversation = (conversation: ChatConversation) => {
    setChoice(conversation.id)
    setDirectContact(null)
    setDirectDismissed(true)
  }

  const handleBack = () => {
    setChoice(null)
    setDirectContact(null)
    setDirectDismissed(true)
  }

  const handleContactSelect = (contact: ChatContact) => {
    const existing = conversations.find(
      (conversation) =>
        conversation.participant1Id === contact.id ||
        conversation.participant2Id === contact.id,
    )
    if (existing) {
      setChoice(existing.id)
      setDirectContact(null)
    } else {
      setDirectContact(contact)
      setChoice(null)
    }
    setDirectDismissed(true)
    setNewDialogOpen(false)
  }

  const handleDirectSent = async (conversationId?: string) => {
    setDirectContact(null)
    setDirectDismissed(true)
    await refetchConversations()
    if (conversationId) setChoice(conversationId)
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
          onSelect={handleSelectConversation}
          onNewConversation={() => setNewDialogOpen(true)}
          loading={loading}
        />
        <ChatDetailPane
          className={detailOpen ? 'flex' : 'hidden md:flex'}
          subdomain={subdomain}
          selected={selected}
          directRecipientId={directRecipient?.id ?? null}
          directRecipientType={directRecipient?.type}
          directRecipientLabel={directRecipient?.name}
          onBack={handleBack}
          onDirectSent={(conversationId) => {
            void handleDirectSent(conversationId)
          }}
        />
      </div>

      <NewConversationDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        subdomain={subdomain}
        onSelect={handleContactSelect}
      />
    </div>
  )
}
