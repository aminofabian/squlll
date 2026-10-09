'use client'

import { useCallback, useState } from 'react'
import { Send } from 'lucide-react'
import { sendMessageViaGraphql } from '@/lib/chat/sendMessageViaGraphql'
import { ChatComposer } from './ChatComposer'
import { ChatEmptyState } from './ChatEmptyState'
import { ChatErrorStack } from './ChatErrorStack'
import { ChatHeader } from './ChatHeader'

interface StartDirectChatProps {
  recipientType?: string
  recipientId: string
  recipientLabel?: string
  subdomain: string
  onSent: () => void
  onBack?: () => void
}

const DEFAULT_RECIPIENT_TYPE = 'TEACHER'

export function StartDirectChat({
  recipientType = DEFAULT_RECIPIENT_TYPE,
  recipientId,
  recipientLabel,
  subdomain,
  onSent,
  onBack,
}: StartDirectChatProps) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = useCallback(async () => {
    const content = draft.trim()
    if (!content || sending) return
    setSending(true)
    setError(null)
    try {
      await sendMessageViaGraphql(subdomain, { recipientType, recipientId, content })
      setDraft('')
      onSent()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }, [draft, sending, recipientType, recipientId, subdomain, onSent])

  const contactName = recipientLabel ?? 'this contact'

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-card">
      <ChatHeader
        title={recipientLabel ?? 'New conversation'}
        subtitle="Start a secure school message"
        onBack={onBack}
      />
      <div className="flex min-h-0 flex-1 flex-col bg-muted/40">
        <ChatEmptyState
          icon={Send}
          title="Start the conversation"
          description={`Send your first message to ${contactName}.`}
        />
      </div>
      <ChatErrorStack errors={[error]} />
      <ChatComposer
        value={draft}
        onChange={setDraft}
        onSubmit={() => void handleSend()}
        sending={sending}
      />
    </div>
  )
}
