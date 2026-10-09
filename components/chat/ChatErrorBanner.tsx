interface ChatErrorBannerProps {
  message: string
}

export function ChatErrorBanner({ message }: ChatErrorBannerProps) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive"
    >
      {message}
    </p>
  )
}
