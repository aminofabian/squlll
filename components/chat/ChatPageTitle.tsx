import { MessageSquare } from 'lucide-react'

interface ChatPageTitleProps {
  title: string
}

export function ChatPageTitle({ title }: ChatPageTitleProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary/75">
          <MessageSquare className="size-3.5" strokeWidth={1.8} />
          Inbox
        </p>
        <h1 className="mt-1.5 font-display text-[1.8rem] leading-none tracking-[-0.01em] text-foreground">
          {title}
        </h1>
      </div>
    </div>
  )
}
