export interface ChatMessage {
  id: string
  conversationId: string
  senderType: string
  senderId: string
  content: string
  createdAt: string
  isRead: boolean
}

export interface ChatConversation {
  id: string
  type: string
  participant1Type: string
  participant1Id: string
  /** Resolved display name for participant 1 (server-populated; may be null). */
  participant1Name?: string | null
  participant2Type: string
  participant2Id: string
  /** Resolved display name for participant 2 (server-populated; may be null). */
  participant2Name?: string | null
  lastMessage?: string | null
  unreadCount: number
  updatedAt: string
  createdAt: string
  tenantId: string
}

export interface NewMessageEvent {
  id: string
  conversationId: string
  senderType: string
  senderId: string
  content: string
  createdAt: string
  isRead: boolean
}

export interface RealtimeNotification {
  id: string
  title: string
  body: string
  createdAt: string
  read: boolean
  href?: string
}
