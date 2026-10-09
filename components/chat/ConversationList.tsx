'use client'

import { Inbox } from 'lucide-react'
import type { ChatConversation } from '@/lib/chat/types'
import { getCurrentUserId } from '@/lib/chat/utils'
import { ChatEmptyState } from './ChatEmptyState'
import { ConversationItem } from './ConversationItem'

interface ConversationListProps {
  conversations: ChatConversation[]
  selectedId: string | null
  onSelect: (conversation: ChatConversation) => void
  loading?: boolean
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
}: ConversationListProps) {
  const currentUserId = getCurrentUserId()

  if (loading && conversations.length === 0) {
    return (
      <p className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        Loading conversations…
      </p>
    )
  }

  if (conversations.length === 0) {
    return (
      <ChatEmptyState
        icon={Inbox}
        title="No messages yet"
        description="Conversations appear here once you send or receive a message."
      />
    )
  }

  return (
    <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <ConversationItem
            conversation={conversation}
            currentUserId={currentUserId}
            selected={conversation.id === selectedId}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  )
}
