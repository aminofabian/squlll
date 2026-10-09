import { MessageSquare } from 'lucide-react'

interface ChatPageTitleProps {
  title: string
}

export function ChatPageTitle({ title }: ChatPageTitleProps) {
  return (
    <div className="flex items-center gap-2">
      <MessageSquare className="h-5 w-5 text-primary" />
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
    </div>
  )
}
