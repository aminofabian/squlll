import { Check, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatClockTime } from '@/lib/chat/formatClockTime'

interface ChatMessageMetaProps {
  createdAt: string
  isMine: boolean
  isRead: boolean
}

export function ChatMessageMeta({ createdAt, isMine, isRead }: ChatMessageMetaProps) {
  const ReceiptIcon = isRead ? CheckCheck : Check
  return (
    <span className="flex items-center gap-1 px-1 pt-0.5 text-[11px] leading-none text-muted-foreground">
      <time dateTime={createdAt}>{formatClockTime(createdAt)}</time>
      {isMine ? (
        <ReceiptIcon
          aria-label={isRead ? 'Read' : 'Delivered'}
          className={cn('size-3.5', isRead && 'text-primary')}
        />
      ) : null}
    </span>
  )
}
