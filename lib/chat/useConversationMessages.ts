import { useCallback, useEffect, useState } from 'react'
import { useRealtime } from '@/lib/realtime/RealtimeProvider'
import { useChat } from './ChatProvider'
import { CHAT_LIMITS } from './constants'
import { chatGraphqlFetch } from './graphql'
import { mergeMessages } from './mergeMessages'
import { useLiveConversationMessages } from './useLiveConversationMessages'
import { CONVERSATION_MESSAGES } from './queries'
import type { ChatMessage } from './types'

interface ConversationPage {
  conversationMessages: ChatMessage[]
}

function fetchMessagePage(
  conversationId: string,
  subdomain: string,
  before?: string,
): Promise<ChatMessage[]> {
  return chatGraphqlFetch<ConversationPage>(
    CONVERSATION_MESSAGES,
    {
      conversationId,
      limit: CHAT_LIMITS.pageSize,
      before: before ?? null,
    },
    subdomain,
  ).then((data) => data.conversationMessages ?? [])
}

function errorMessageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

/**
 * Loads a conversation's history and keeps it live. Callers mount this per
 * conversation (keyed), so the feed starts empty for each thread.
 */
export function useConversationMessages(
  conversationId: string | null,
  currentUserId: string | null,
  subdomain: string,
) {
  const { socket } = useRealtime()
  const { markRead } = useChat()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => mergeMessages(prev, [message]))
  }, [])

  const loadMessages = useCallback(
    async (before?: string) => {
      if (!conversationId) return
      const setPending = before ? setLoadingMore : setLoading
      setPending(true)
      setError(null)
      try {
        const batch = await fetchMessagePage(conversationId, subdomain, before)
        setHasMore(batch.length >= CHAT_LIMITS.pageSize)
        setMessages((prev) => mergeMessages(prev, batch))
        if (!before) {
          await markRead(conversationId)
          socket?.emit('join_conversation', { conversationId })
        }
      } catch (err) {
        setError(errorMessageOf(err, 'Failed to load messages'))
      } finally {
        setPending(false)
      }
    },
    [conversationId, subdomain, markRead, socket],
  )

  useEffect(() => {
    void loadMessages()
  }, [loadMessages])

  useLiveConversationMessages({
    conversationId,
    currentUserId,
    onIncoming: appendMessage,
    onReadError: setError,
  })

  const loadOlder = useCallback(() => {
    const oldest = messages[0]
    if (oldest) void loadMessages(oldest.createdAt)
  }, [messages, loadMessages])

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    error,
    appendMessage,
    loadOlder,
  }
}
