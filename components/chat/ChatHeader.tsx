import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatAvatar } from './ChatAvatar'

interface ChatHeaderProps {
  title: string
  subtitle: string
  onBack?: () => void
}

export function ChatHeader({ title, subtitle, onBack }: ChatHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-border bg-card px-3 py-3 sm:px-4">
      {onBack ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-foreground hover:bg-muted md:hidden"
          onClick={onBack}
          aria-label="Back to conversations"
        >
          <ArrowLeft />
        </Button>
      ) : null}
      <ChatAvatar label={title} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </header>
  )
}
