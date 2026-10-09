'use client'

import { cn } from '@/lib/utils'
import { RealtimeLiveIndicator } from '@/lib/realtime/RealtimeLiveIndicator'
import type { ChatConversation } from '@/lib/chat/types'
import { ConversationList } from './ConversationList'

interface ConversationsPaneProps {
  className?: string
  conversations: ChatConversation[]
  selectedId: string | null
  onSelect: (conversation: ChatConversation) => void
  loading: boolean
}

export function ConversationsPane({
  className,
  conversations,
  selectedId,
  onSelect,
  loading,
}: ConversationsPaneProps) {
  return (
    <aside
      className={cn(
        'flex min-h-0 w-full min-w-0 flex-col border-r border-border bg-card md:w-80 lg:w-96',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Conversations
        </p>
        <RealtimeLiveIndicator />
      </div>
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={onSelect}
        loading={loading}
      />
    </aside>
  )
}
