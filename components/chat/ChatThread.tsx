'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { chatGraphqlFetch } from '@/lib/chat/graphql'
import { CONVERSATION_MESSAGES } from '@/lib/chat/queries'
import type { ChatConversation, ChatMessage, NewMessageEvent } from '@/lib/chat/types'
import {
  formatMessageTime,
  getCurrentUserId,
  getOtherParticipant,
} from '@/lib/chat/utils'
import { useChat } from '@/lib/chat/ChatProvider'
import { useRealtime } from '@/lib/realtime/RealtimeProvider'

interface ChatThreadProps {
  conversation: ChatConversation | null
  subdomain: string
}

const PAGE_SIZE = 50

export function ChatThread({ conversation, subdomain }: ChatThreadProps) {
  const { socket } = useRealtime()
  const { markRead, onNewMessage } = useChat()
  const currentUserId = getCurrentUserId()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadMessages = useCallback(
    async (before?: string, append = false) => {
      if (!conversation) return
      if (before) setLoadingMore(true)
      else setLoading(true)
      setError(null)

      try {
        const data = await chatGraphqlFetch<{
          conversationMessages: ChatMessage[]
        }>(
          CONVERSATION_MESSAGES,
          {
            conversationId: conversation.id,
            limit: PAGE_SIZE,
            before: before ?? null,
          },
          subdomain,
        )

        const batch = data.conversationMessages ?? []
        setHasMore(batch.length >= PAGE_SIZE)

        setMessages((prev) => {
          if (!append) return batch
          const ids = new Set(prev.map((m) => m.id))
          const merged = [...batch.filter((m) => !ids.has(m.id)), ...prev]
          return merged.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          )
        })

        if (!before) {
          await markRead(conversation.id)
          socket?.emit('join_conversation', { conversationId: conversation.id })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [conversation, subdomain, markRead, socket],
  )

  useEffect(() => {
    setMessages([])
    setDraft('')
    if (conversation) {
      void loadMessages()
    }
  }, [conversation?.id, loadMessages])

  useEffect(() => {
    if (!conversation) return
    return onNewMessage((msg: NewMessageEvent) => {
      if (msg.conversationId !== conversation.id) return
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, { ...msg, createdAt: String(msg.createdAt) }]
      })
    })
  }, [conversation, onNewMessage])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async () => {
    if (!conversation || !currentUserId || !draft.trim() || sending) return

    const content = draft.trim()
    setSending(true)
    setError(null)

    const { recipientType, recipientId } = getOtherParticipant(conversation, currentUserId)

    try {
      if (socket?.connected) {
        await new Promise<void>((resolve, reject) => {
          socket.emit(
            'send_message',
            { recipientType, recipientId, content },
            (ack: { ok?: boolean; error?: string }) => {
              if (ack?.ok === false || ack?.error) {
                reject(new Error(ack.error ?? 'Send failed'))
              } else {
                resolve()
              }
            },
          )
        })
      } else {
        const { SEND_MESSAGE } = await import('@/lib/chat/queries')
        await chatGraphqlFetch(
          SEND_MESSAGE,
          {
            input: { recipientType: recipientType.toUpperCase(), recipientId, content },
          },
          subdomain,
        )
      }
      setDraft('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Select a conversation to start messaging
      </div>
    )
  }

  const oldest = messages[0]

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-foreground">
          {getOtherParticipant(conversation, currentUserId ?? '').recipientType}
        </p>
        <p className="text-xs text-muted-foreground">Secure school messaging</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {hasMore && oldest && (
          <div className="mb-3 flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={loadingMore}
              onClick={() => void loadMessages(oldest.createdAt, true)}
            >
              {loadingMore ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Load older messages
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isMine =
                currentUserId != null && message.senderId === currentUserId
              return (
                <div
                  key={message.id}
                  className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm',
                      isMine
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground',
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <p
                      className={cn(
                        'mt-1 text-[10px]',
                        isMine ? 'text-primary-foreground/70' : 'text-muted-foreground',
                      )}
                    >
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {error && (
        <p className="px-4 text-xs text-destructive">{error}</p>
      )}

      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            rows={2}
            className="min-h-[44px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSend()
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            className="shrink-0 self-end"
            disabled={!draft.trim() || sending}
            onClick={() => void handleSend()}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
