'use client'

import { useState, useCallback, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { chatGraphqlFetch } from '@/lib/chat/graphql'
import { SEND_MESSAGE } from '@/lib/chat/queries'
import { useChat } from '@/lib/chat/ChatProvider'

interface StartDirectChatProps {
  recipientType?: string
  recipientId: string
  recipientLabel?: string
  subdomain: string
  onSent: () => void
}

export function StartDirectChat({
  recipientType = 'TEACHER',
  recipientId,
  recipientLabel,
  subdomain,
  onSent,
}: StartDirectChatProps) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = useCallback(async () => {
    if (!draft.trim() || sending) return
    setSending(true)
    setError(null)
    try {
      await chatGraphqlFetch(
        SEND_MESSAGE,
        {
          input: {
            recipientType,
            recipientId,
            content: draft.trim(),
          },
        },
        subdomain,
      )
      setDraft('')
      onSent()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }, [draft, sending, recipientType, recipientId, subdomain, onSent])

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-foreground">
          {recipientLabel ?? 'New conversation'}
        </p>
        <p className="text-xs text-muted-foreground">Start a secure school message</p>
      </div>
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
        Send your first message to {recipientLabel ?? 'this contact'}.
      </div>
      {error && <p className="px-4 text-xs text-destructive">{error}</p>}
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
