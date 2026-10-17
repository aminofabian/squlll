'use client'

import { cn } from '@/lib/utils'
import { RealtimeLiveIndicator } from '@/lib/realtime/RealtimeLiveIndicator'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ChatConversation } from '@/lib/chat/types'
import { ConversationList } from './ConversationList'

interface ConversationsPaneProps {
  className?: string
  conversations: ChatConversation[]
  selectedId: string | null
  onSelect: (conversation: ChatConversation) => void
  onNewConversation: () => void
  loading: boolean
}

export function ConversationsPane({
  className,
  conversations,
  selectedId,
  onSelect,
  onNewConversation,
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
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1 px-2 text-[11px]"
            onClick={onNewConversation}
            aria-label="New message"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
          <RealtimeLiveIndicator />
        </div>
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
