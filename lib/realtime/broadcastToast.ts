export interface BroadcastMessagePayload {
  content?: string
  senderType?: string
  senderId?: string
  timestamp?: string
}

export function formatBroadcastToastDescription(content?: string): string {
  const preview = content?.trim()
  if (!preview) return 'You have a new message from school.'
  return preview.length > 140 ? `${preview.slice(0, 140)}…` : preview
}

export function shouldSkipBroadcastToast(
  payload: BroadcastMessagePayload,
  currentUserId: string | null,
): boolean {
  if (!currentUserId || !payload.senderId) return false
  return payload.senderId === currentUserId
}
