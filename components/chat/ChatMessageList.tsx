'use client'

import { useMemo } from 'react'
import { MessageSquare } from 'lucide-react'
import { groupMessagesByDay } from '@/lib/chat/groupMessagesByDay'
import { useStickToBottom } from '@/lib/chat/useStickToBottom'
import type { ChatMessage } from '@/lib/chat/types'
import { ChatEmptyState } from './ChatEmptyState'
import { ChatJumpToLatest } from './ChatJumpToLatest'
import { ChatLoadOlderButton } from './ChatLoadOlderButton'
import { ChatMessageSections } from './ChatMessageSections'
import { ChatMessagesSkeleton } from './ChatMessagesSkeleton'

interface ChatMessageListProps {
  messages: ChatMessage[]
  currentUserId: string | null
  peerLabel: string
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  onLoadOlder: () => void
}

type ListBodyProps = Pick<
  ChatMessageListProps,
  'messages' | 'currentUserId' | 'peerLabel' | 'loading'
>

function ListBody({ messages, currentUserId, peerLabel, loading }: ListBodyProps) {
  const sections = useMemo(
    () => groupMessagesByDay(messages, currentUserId),
    [messages, currentUserId],
  )
  if (loading) return <ChatMessagesSkeleton />
  if (messages.length === 0) {
    return (
      <ChatEmptyState
        icon={MessageSquare}
        title="No messages yet"
        description={`Send a message to start the conversation with ${peerLabel}.`}
      />
    )
  }
  return <ChatMessageSections sections={sections} peerLabel={peerLabel} />
}

export function ChatMessageList({
  messages,
  currentUserId,
  peerLabel,
  loading,
  loadingMore,
  hasMore,
  onLoadOlder,
}: ChatMessageListProps) {
  const latest = messages[messages.length - 1]
  const latestIsMine = Boolean(latest) && latest.senderId === currentUserId
  const { scrollRef, handleScroll, jumpToLatest, showJumpButton, hasUnseen } =
    useStickToBottom(latest?.id ?? null, latestIsMine)

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation messages"
        onScroll={handleScroll}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-muted/40 px-4 py-4 sm:px-6"
      >
        <div className="mt-auto">
          {hasMore ? (
            <ChatLoadOlderButton loadingMore={loadingMore} onClick={onLoadOlder} />
          ) : null}
          <ListBody
            messages={messages}
            currentUserId={currentUserId}
            peerLabel={peerLabel}
            loading={loading}
          />
        </div>
      </div>
      {showJumpButton ? (
        <ChatJumpToLatest hasUnseen={hasUnseen} onClick={() => jumpToLatest()} />
      ) : null}
    </div>
  )
}
