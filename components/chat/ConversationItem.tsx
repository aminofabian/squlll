import { cn } from '@/lib/utils'
import type { ChatConversation } from '@/lib/chat/types'
import { LifeBuoy } from 'lucide-react'
import { formatParticipantLabel, formatRelativeTime } from '@/lib/chat/utils'
import { formatParticipantType } from '@/lib/chat/formatParticipantType'
import { ChatAvatar } from './ChatAvatar'
import { ChatUnreadBadge } from './ChatUnreadBadge'

interface ConversationItemProps {
  conversation: ChatConversation
  currentUserId: string | null
  selected: boolean
  onSelect: (conversation: ChatConversation) => void
}

export function ConversationItem({
  conversation,
  currentUserId,
  selected,
  onSelect,
}: ConversationItemProps) {
  const label = formatParticipantLabel(conversation, currentUserId)
  const peerType =
    conversation.participant1Id === currentUserId
      ? conversation.participant2Type
      : conversation.participant1Type
  const roleLabel = formatParticipantType(peerType)
  const unread = conversation.unreadCount ?? 0
  const hasUnread = unread > 0

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation)}
      aria-current={selected ? 'true' : undefined}
      className={cn(
        'relative flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none',
        selected && 'bg-primary/10 hover:bg-primary/10',
      )}
    >
      {selected ? (
        <span aria-hidden className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary" />
      ) : null}
      <ChatAvatar label={label} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <span
              className={cn(
                'truncate text-sm text-foreground',
                hasUnread ? 'font-semibold' : 'font-medium',
              )}
            >
              {label}
            </span>
            {peerType.trim().toLowerCase() === 'superadmin' ? (
              <LifeBuoy
                className="h-3 w-3 shrink-0 text-primary"
                aria-label="Squl technical support conversation"
              />
            ) : (
              <span className="shrink-0 border border-border bg-muted px-1 py-0.5 text-[9px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                {roleLabel}
              </span>
            )}
          </span>
          <time
            dateTime={conversation.updatedAt}
            className="shrink-0 text-[11px] text-muted-foreground"
          >
            {formatRelativeTime(conversation.updatedAt)}
          </time>
        </span>
        <span className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              'line-clamp-1 text-xs',
              hasUnread ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {conversation.lastMessage || 'No messages yet'}
          </span>
          {hasUnread ? <ChatUnreadBadge count={unread} /> : null}
        </span>
      </span>
    </button>
  )
}
