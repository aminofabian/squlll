import { CHAT_LIMITS } from './constants'
import { formatDayLabel } from './formatDayLabel'
import type { ChatMessage } from './types'

export interface MessageGroup {
  id: string
  senderId: string
  isMine: boolean
  messages: ChatMessage[]
}

export interface MessageDaySection {
  dayKey: string
  dayLabel: string
  groups: MessageGroup[]
}

function toLocalDayKey(iso: string): string {
  const date = new Date(iso)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function canJoinGroup(group: MessageGroup, message: ChatMessage): boolean {
  const previous = group.messages[group.messages.length - 1]
  const gap = Date.parse(message.createdAt) - Date.parse(previous.createdAt)
  return group.senderId === message.senderId && gap <= CHAT_LIMITS.groupWindowMs
}

function appendToGroups(
  groups: MessageGroup[],
  message: ChatMessage,
  currentUserId: string | null,
): void {
  const last = groups[groups.length - 1]
  if (last && canJoinGroup(last, message)) {
    last.messages.push(message)
    return
  }
  groups.push({
    id: message.id,
    senderId: message.senderId,
    isMine: currentUserId != null && message.senderId === currentUserId,
    messages: [message],
  })
}

export function groupMessagesByDay(
  messages: ChatMessage[],
  currentUserId: string | null,
  now: Date = new Date(),
): MessageDaySection[] {
  const sections: MessageDaySection[] = []
  for (const message of messages) {
    const dayKey = toLocalDayKey(message.createdAt)
    let section = sections[sections.length - 1]
    if (!section || section.dayKey !== dayKey) {
      section = {
        dayKey,
        dayLabel: formatDayLabel(message.createdAt, now),
        groups: [],
      }
      sections.push(section)
    }
    appendToGroups(section.groups, message, currentUserId)
  }
  return sections
}
