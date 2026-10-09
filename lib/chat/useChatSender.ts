import { useCallback, useState } from 'react'
import { useRealtime } from '@/lib/realtime/RealtimeProvider'
import { sendChatMessage } from './sendChatMessage'
import type { ChatConversation, ChatMessage } from './types'

interface UseChatSenderArgs {
  conversation: ChatConversation | null
  currentUserId: string | null
  subdomain: string
  onSent: (message: ChatMessage) => void
}

export function useChatSender({
  conversation,
  currentUserId,
  subdomain,
  onSent,
}: UseChatSenderArgs) {
  const { socket } = useRealtime()
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const submit = useCallback(async () => {
    const content = draft.trim()
    if (!conversation || !currentUserId || !content || sending) return
    setSending(true)
    setSendError(null)
    try {
      const sent = await sendChatMessage({
        socket,
        subdomain,
        conversation,
        currentUserId,
        content,
      })
      if (sent) onSent(sent)
      setDraft('')
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }, [conversation, currentUserId, draft, sending, socket, subdomain, onSent])

  return { draft, setDraft, sending, sendError, submit }
}
