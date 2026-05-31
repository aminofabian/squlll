'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useParams, usePathname } from 'next/navigation'
import { useRealtime } from '@/lib/realtime/RealtimeProvider'
import { chatGraphqlFetch } from '@/lib/chat/graphql'
import { MY_CONVERSATIONS, MARK_CONVERSATION_READ } from '@/lib/chat/queries'
import type { ChatConversation, NewMessageEvent } from '@/lib/chat/types'

interface ChatContextValue {
  conversations: ChatConversation[]
  unreadTotal: number
  loading: boolean
  error: string | null
  refetchConversations: () => Promise<void>
  markRead: (conversationId: string) => Promise<void>
  onNewMessage: (handler: (msg: NewMessageEvent) => void) => () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function useChatOptional() {
  return useContext(ChatContext)
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return ctx
}

export function useChatUnreadTotal(): number {
  const ctx = useContext(ChatContext)
  return ctx?.unreadTotal ?? 0
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const subdomain = typeof params?.subdomain === 'string' ? params.subdomain : ''
  const { socket } = useRealtime()

  const skipFetch =
    !subdomain ||
    pathname?.includes('/login') ||
    pathname?.includes('/signup')

  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messageHandlers] = useState(() => new Set<(msg: NewMessageEvent) => void>())

  const refetchConversations = useCallback(async () => {
    if (skipFetch) return
    setLoading(true)
    setError(null)
    try {
      const data = await chatGraphqlFetch<{ myConversations: ChatConversation[] }>(
        MY_CONVERSATIONS,
        {},
        subdomain,
      )
      setConversations(data.myConversations ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [subdomain, skipFetch])

  useEffect(() => {
    void refetchConversations()
  }, [refetchConversations])

  const markRead = useCallback(
    async (conversationId: string) => {
      if (!subdomain) return
      await chatGraphqlFetch(
        MARK_CONVERSATION_READ,
        { conversationId },
        subdomain,
      )
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c,
        ),
      )
    },
    [subdomain],
  )

  const onNewMessage = useCallback(
    (handler: (msg: NewMessageEvent) => void) => {
      messageHandlers.add(handler)
      return () => messageHandlers.delete(handler)
    },
    [messageHandlers],
  )

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (msg: NewMessageEvent) => {
      messageHandlers.forEach((h) => h(msg))
      void refetchConversations()
    }

    const handleBroadcast = () => {
      void refetchConversations()
    }

    socket.on('new_message', handleNewMessage)
    socket.on('broadcast_message', handleBroadcast)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('broadcast_message', handleBroadcast)
    }
  }, [socket, refetchConversations, messageHandlers])

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
    [conversations],
  )

  const value = useMemo(
    () => ({
      conversations,
      unreadTotal,
      loading,
      error,
      refetchConversations,
      markRead,
      onNewMessage,
    }),
    [conversations, unreadTotal, loading, error, refetchConversations, markRead, onNewMessage],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
