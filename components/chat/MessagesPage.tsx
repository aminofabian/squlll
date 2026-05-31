'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { useChat } from '@/lib/chat/ChatProvider'
import { ConversationList } from './ConversationList'
import { ChatThread } from './ChatThread'
import { StartDirectChat } from './StartDirectChat'
import type { ChatConversation } from '@/lib/chat/types'
import { cn } from '@/lib/utils'

interface MessagesPageProps {
  title?: string
  className?: string
  preferredParticipantId?: string | null
  preferredParticipantLabel?: string | null
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
  const [selected, setSelected] = useState<ChatConversation | null>(null)

  useEffect(() => {
    if (!preferredParticipantId || selected) return
    const match = conversations.find(
      (c) =>
        c.participant1Id === preferredParticipantId ||
        c.participant2Id === preferredParticipantId,
    )
    if (match) setSelected(match)
  }, [conversations, preferredParticipantId, selected])

  const showDirectChat =
    Boolean(preferredParticipantId) &&
    !selected &&
    !loading &&
    !conversations.some(
      (c) =>
        c.participant1Id === preferredParticipantId ||
        c.participant2Id === preferredParticipantId,
    )

  return (
    <div className={cn('flex h-[calc(100vh-8rem)] flex-col gap-4', className)}>
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <aside
          className={cn(
            'flex w-full flex-col border-r border-border md:w-80 lg:w-96',
            selected ? 'hidden md:flex' : 'flex',
          )}
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Conversations
            </p>
          </div>
          <ConversationList
            conversations={conversations}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
            loading={loading}
          />
        </aside>

        <section
          className={cn(
            'flex min-h-0 flex-1 flex-col',
            !selected ? 'hidden md:flex' : 'flex',
          )}
        >
          {selected && (
            <button
              type="button"
              className="border-b border-border px-4 py-2 text-left text-sm text-primary md:hidden"
              onClick={() => setSelected(null)}
            >
              ← Back to conversations
            </button>
          )}
          {showDirectChat && preferredParticipantId ? (
            <StartDirectChat
              recipientId={preferredParticipantId}
              recipientLabel={preferredParticipantLabel ?? undefined}
              subdomain={subdomain}
              onSent={() => void refetchConversations()}
            />
          ) : (
            <ChatThread conversation={selected} subdomain={subdomain} />
          )}
        </section>
      </div>
    </div>
  )
}
