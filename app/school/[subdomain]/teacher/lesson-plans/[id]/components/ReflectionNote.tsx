export function ReflectionNote({ label, text }: { label: string; text?: string | null }) {
  if (!text) return null
  return (
    <div className="border-l-2 border-primary/30 pl-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap text-sm">{text}</p>
    </div>
  )
}
