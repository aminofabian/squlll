import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NoteTile({
  icon: Icon,
  label,
  hint,
  placeholder,
  value,
  tone,
  onChange,
}: {
  icon: LucideIcon
  label: string
  hint: string
  placeholder: string
  value: string
  tone: string
  onChange: (value: string) => void
}) {
  return (
    <label className={cn('flex flex-col rounded-2xl p-3 ring-1 ring-inset transition-shadow focus-within:shadow-md focus-within:ring-2', tone)}>
      <span className="flex items-center gap-2 text-sm font-semibold">
        <span className="flex size-7 items-center justify-center rounded-lg bg-white/70 dark:bg-white/10">
          <Icon className="size-3.5" />
        </span>
        {label}
      </span>
      <span className="mt-1 text-[11px] opacity-75">{hint}</span>
      <textarea
        rows={3}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full flex-1 resize-y rounded-xl bg-white/70 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 dark:bg-black/20"
      />
    </label>
  )
}
