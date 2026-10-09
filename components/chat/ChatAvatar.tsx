import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/chat/getInitials'

type ChatAvatarSize = 'xs' | 'md'

const SIZE_CLASSES: Record<ChatAvatarSize, string> = {
  xs: 'size-6 text-[10px]',
  md: 'size-10 text-sm',
}

interface ChatAvatarProps {
  label: string
  size?: ChatAvatarSize
}

export function ChatAvatar({ label, size = 'md' }: ChatAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-1 ring-inset ring-primary/15',
        SIZE_CLASSES[size],
      )}
    >
      {getInitials(label)}
    </span>
  )
}
