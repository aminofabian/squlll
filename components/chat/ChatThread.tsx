'use client'

import { formatParticipantLabel, getCurrentUserId, getOtherParticipant } from '@/lib/chat/utils'
import { formatParticipantType } from '@/lib/chat/formatParticipantType'
import { useConversationMessages } from '@/lib/chat/useConversationMessages'
import { useChatSender } from '@/lib/chat/useChatSender'
import type { ChatConversation } from '@/lib/chat/types'
import { ChatComposer } from './ChatComposer'
import { ChatErrorStack } from './ChatErrorStack'
import { ChatHeader } from './ChatHeader'
import { ChatMessageList } from './ChatMessageList'

interface ChatThreadProps {
  conversation: ChatConversation
  subdomain: string
  onBack?: () => void
}

export function ChatThread({ conversation, subdomain, onBack }: ChatThreadProps) {
  const currentUserId = getCurrentUserId()
  const feed = useConversationMessages(conversation.id, currentUserId, subdomain)
  const sender = useChatSender({
    conversation,
    currentUserId,
    subdomain,
    onSent: feed.appendMessage,
  })
  const peerLabel = formatParticipantLabel(conversation, currentUserId)
  const peerType = formatParticipantType(
    getOtherParticipant(conversation, currentUserId ?? '').recipientType,
  )

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-card">
      <ChatHeader title={peerLabel} subtitle={peerType} onBack={onBack} />
      <ChatMessageList
        messages={feed.messages}
        currentUserId={currentUserId}
        peerLabel={peerLabel}
        loading={feed.loading}
        loadingMore={feed.loadingMore}
        hasMore={feed.hasMore}
        onLoadOlder={feed.loadOlder}
      />
      <ChatErrorStack errors={[feed.error, sender.sendError]} />
      <ChatComposer
        value={sender.draft}
        onChange={sender.setDraft}
        onSubmit={() => void sender.submit()}
        sending={sender.sending}
      />
    </div>
  )
}
