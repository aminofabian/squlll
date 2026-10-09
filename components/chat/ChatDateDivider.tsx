interface ChatDateDividerProps {
  label: string
}

export function ChatDateDivider({ label }: ChatDateDividerProps) {
  return (
    <div className="my-5 flex items-center justify-center">
      <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
        {label}
      </span>
    </div>
  )
}
