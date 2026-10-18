import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SaveTone } from '../utils/describeSaveStatus'

const TONE_STYLES: Record<SaveTone, string> = {
  saving: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  dirty: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  error: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  saved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  idle: 'bg-muted text-muted-foreground',
}

function ToneIcon({ tone }: { tone: SaveTone }) {
  if (tone === 'saving') return <Loader2 className="size-3 animate-spin" />
  if (tone === 'error') return <AlertCircle className="size-3" />
  if (tone === 'saved') return <Check className="size-3" />
  return <span className="size-1.5 animate-pulse rounded-full bg-current" />
}

export function SaveIndicator({ tone, label }: { tone: SaveTone; label: string }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex max-w-[14rem] items-center gap-1.5 truncate rounded-full px-2.5 py-1 text-[11px] font-medium',
        TONE_STYLES[tone],
      )}
    >
      <ToneIcon tone={tone} />
      <span className="truncate">{label}</span>
    </span>
  )
}
