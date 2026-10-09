import { ChatErrorBanner } from './ChatErrorBanner'

interface ChatErrorStackProps {
  errors: (string | null)[]
}

export function ChatErrorStack({ errors }: ChatErrorStackProps) {
  const messages = errors.filter((message): message is string => Boolean(message))
  if (messages.length === 0) return null
  return (
    <div className="space-y-2 px-3 pt-3 sm:px-4">
      {messages.map((message) => (
        <ChatErrorBanner key={message} message={message} />
      ))}
    </div>
  )
}
