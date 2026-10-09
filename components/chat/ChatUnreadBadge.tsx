import { CHAT_LIMITS } from '@/lib/chat/constants'

interface ChatUnreadBadgeProps {
  count: number
}

function formatUnreadCount(count: number): string {
  return count > CHAT_LIMITS.unreadBadgeMax ? `${CHAT_LIMITS.unreadBadgeMax}+` : String(count)
}

export function ChatUnreadBadge({ count }: ChatUnreadBadgeProps) {
  return (
    <span
      aria-label={`${count} unread`}
      className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-none text-primary-foreground"
    >
      {formatUnreadCount(count)}
    </span>
  )
}
