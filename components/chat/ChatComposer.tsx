'use client'

import type { KeyboardEvent } from 'react'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAutoGrowTextarea } from '@/lib/chat/useAutoGrowTextarea'

interface ChatComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  sending: boolean
}

function isSubmitKey(event: KeyboardEvent<HTMLTextAreaElement>): boolean {
  return event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing
}

export function ChatComposer({ value, onChange, onSubmit, sending }: ChatComposerProps) {
  const textareaRef = useAutoGrowTextarea(value)
  const canSend = value.trim().length > 0 && !sending

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isSubmitKey(event)) return
    event.preventDefault()
    if (canSend) onSubmit()
  }

  return (
    <div className="border-t border-border bg-card px-3 py-3 sm:px-4">
      <div className="flex items-end gap-2 rounded-2xl border border-input bg-background px-3 py-1.5 shadow-sm transition-[border-color,box-shadow] focus-within:border-primary/50 focus-within:ring-[3px] focus-within:ring-primary/15">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          aria-label="Message"
          rows={1}
          className="max-h-40 min-h-9 flex-1 resize-none border-0 bg-transparent px-1 py-1.5 leading-relaxed shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          type="button"
          size="icon"
          className="mb-0.5 size-9 shrink-0 rounded-full"
          disabled={!canSend}
          onClick={onSubmit}
          aria-label="Send message"
        >
          {sending ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </div>
      <p className="mt-1.5 hidden px-1 text-[11px] text-muted-foreground sm:block">
        Press Enter to send · Shift + Enter for a new line
      </p>
    </div>
  )
}
