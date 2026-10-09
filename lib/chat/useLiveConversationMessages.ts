import { useEffect } from 'react'
import { useChat } from './ChatProvider'
import type { ChatMessage, NewMessageEvent } from './types'

function toChatMessage(msg: NewMessageEvent): ChatMessage {
  return { ...msg, createdAt: String(msg.createdAt) }
}

interface LiveMessagesArgs {
  conversationId: string | null
  currentUserId: string | null
  onIncoming: (message: ChatMessage) => void
  onReadError: (message: string) => void
}

/** Streams new messages for the open thread and marks them read as they arrive. */
export function useLiveConversationMessages({
  conversationId,
  currentUserId,
  onIncoming,
  onReadError,
}: LiveMessagesArgs) {
  const { markRead, onNewMessage } = useChat()

  useEffect(() => {
    if (!conversationId) return
    return onNewMessage((msg: NewMessageEvent) => {
      if (msg.conversationId !== conversationId) return
      onIncoming(toChatMessage(msg))
      if (msg.senderId === currentUserId) return
      markRead(conversationId).catch((err: unknown) => {
        onReadError(err instanceof Error ? err.message : 'Failed to mark messages as read')
      })
    })
  }, [conversationId, currentUserId, onNewMessage, onIncoming, onReadError, markRead])
}
