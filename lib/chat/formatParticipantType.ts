export function formatParticipantType(type: string): string {
  const normalized = type.trim().toLowerCase()
  if (!normalized) return ''
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}
