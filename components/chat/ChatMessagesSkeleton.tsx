import { cn } from '@/lib/utils'

const SKELETON_ROWS: { mine: boolean; width: string }[] = [
  { mine: false, width: 'w-48' },
  { mine: true, width: 'w-36' },
  { mine: false, width: 'w-56' },
  { mine: true, width: 'w-40' },
]

export function ChatMessagesSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      {SKELETON_ROWS.map((row, index) => (
        <div
          key={index}
          className={cn('flex', row.mine ? 'justify-end' : 'justify-start')}
        >
          <div className={cn('h-10 max-w-full animate-pulse rounded-2xl bg-muted', row.width)} />
        </div>
      ))}
    </div>
  )
}
