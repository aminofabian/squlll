'use client'

import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatConversation } from '@/lib/chat/types'
import { ChatEmptyState } from './ChatEmptyState'
import { ChatThread } from './ChatThread'
import { StartDirectChat } from './StartDirectChat'

interface ChatDetailPaneProps {
  className?: string
  subdomain: string
  selected: ChatConversation | null
  directRecipientId: string | null
  directRecipientLabel?: string
  onBack: () => void
  onDirectSent: () => void
}

type DetailProps = Omit<ChatDetailPaneProps, 'className'>

function renderDetail({
  subdomain,
  selected,
  directRecipientId,
  directRecipientLabel,
  onBack,
  onDirectSent,
}: DetailProps) {
  if (selected) {
    return (
      <ChatThread
        key={selected.id}
        conversation={selected}
        subdomain={subdomain}
        onBack={onBack}
      />
    )
  }
  if (directRecipientId) {
    return (
      <StartDirectChat
        recipientId={directRecipientId}
        recipientLabel={directRecipientLabel}
        subdomain={subdomain}
        onSent={onDirectSent}
        onBack={onBack}
      />
    )
  }
  return (
    <ChatEmptyState
      icon={MessageSquare}
      title="Select a conversation"
      description="Choose someone from the list to read and reply to their messages."
    />
  )
}

export function ChatDetailPane({ className, ...props }: ChatDetailPaneProps) {
  return (
    <section className={cn('flex min-h-0 min-w-0 flex-1 flex-col bg-card', className)}>
      {renderDetail(props)}
    </section>
  )
}
