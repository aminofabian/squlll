import type { ChatMessage } from './types'

export function mergeMessages(
  existing: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const seen = new Set(existing.map((m) => m.id))
  const fresh = incoming.filter((m) => !seen.has(m.id))
  return [...existing, ...fresh].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  )
}
