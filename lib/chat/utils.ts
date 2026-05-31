import type { ChatConversation } from './types'

export function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
  if (!match) return null
  return decodeURIComponent(match.slice(name.length + 1))
}

export function getCurrentUserId(): string | null {
  return getCookieValue('userId')
}

export function formatParticipantLabel(
  conversation: ChatConversation,
  currentUserId: string | null,
): string {
  const isP1 = currentUserId && conversation.participant1Id === currentUserId
  const type = isP1 ? conversation.participant2Type : conversation.participant1Type
  const id = isP1 ? conversation.participant2Id : conversation.participant1Id
  const label = type.charAt(0).toUpperCase() + type.slice(1)
  return `${label} · ${id.slice(0, 8)}…`
}

export function getOtherParticipant(
  conversation: ChatConversation,
  currentUserId: string,
): { recipientType: string; recipientId: string } {
  if (conversation.participant1Id === currentUserId) {
    return {
      recipientType: conversation.participant2Type,
      recipientId: conversation.participant2Id,
    }
  }
  return {
    recipientType: conversation.participant1Type,
    recipientId: conversation.participant1Id,
  }
}

export function formatMessageTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
