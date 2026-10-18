export type SaveTone = 'saving' | 'dirty' | 'error' | 'saved' | 'idle'

type SaveStatusInput = {
  saving: boolean
  isDirty: boolean
  saveError: string | null
  lastSavedAt: Date | null
  updatedAt?: string | null
}

export function describeSaveStatus(input: SaveStatusInput): {
  tone: SaveTone
  label: string
} {
  if (input.saveError) return { tone: 'error', label: input.saveError }
  if (input.saving) return { tone: 'saving', label: 'Saving…' }
  if (input.isDirty) return { tone: 'dirty', label: 'Unsaved changes' }
  if (input.lastSavedAt) {
    const time = input.lastSavedAt.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
    return { tone: 'saved', label: `Saved ${time}` }
  }
  if (!input.updatedAt) return { tone: 'idle', label: 'Draft' }
  const stamp = new Date(input.updatedAt).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
  return { tone: 'saved', label: `Saved ${stamp}` }
}
