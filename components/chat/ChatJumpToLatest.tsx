import { ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatJumpToLatestProps {
  hasUnseen: boolean
  onClick: () => void
}

export function ChatJumpToLatest({ hasUnseen, onClick }: ChatJumpToLatestProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border-border bg-card text-foreground shadow-md hover:bg-muted"
      aria-label={hasUnseen ? 'Jump to new messages' : 'Jump to latest message'}
    >
      <ArrowDown className="text-primary" />
      {hasUnseen ? 'New messages' : null}
    </Button>
  )
}
