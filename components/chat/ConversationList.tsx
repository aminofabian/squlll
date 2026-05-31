'use client'

import { cn } from '@/lib/utils'
import type { ChatConversation } from '@/lib/chat/types'
import {
  formatParticipantLabel,
  formatRelativeTime,
  getCurrentUserId,
} from '@/lib/chat/utils'

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
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        Loading conversations…
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="text-sm font-medium text-foreground">No messages yet</p>
        <p className="text-xs text-muted-foreground">
          Conversations appear when you receive or send a message.
        </p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border overflow-y-auto">
      {conversations.map((conversation) => {
        const unread = conversation.unreadCount ?? 0
        const isSelected = conversation.id === selectedId

        return (
          <li key={conversation.id}>
            <button
              type="button"
              onClick={() => onSelect(conversation)}
              className={cn(
                'flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/60',
                isSelected && 'bg-muted',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="truncate text-sm font-medium text-foreground">
                  {formatParticipantLabel(conversation, currentUserId)}
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatRelativeTime(conversation.updatedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {conversation.lastMessage || 'No messages'}
                </p>
                {unread > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
