import { cn } from '@/lib/utils'

interface ChatMessageBubbleProps {
  content: string
  isMine: boolean
}

export function ChatMessageBubble({ content, isMine }: ChatMessageBubbleProps) {
  return (
    <div
      className={cn(
        'max-w-full whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm',
        isMine
          ? 'rounded-br-md bg-primary text-primary-foreground'
          : 'rounded-bl-md border border-border bg-card text-card-foreground',
      )}
    >
      {content}
    </div>
  )
}
