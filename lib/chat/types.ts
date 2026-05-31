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
  participant2Type: string
  participant2Id: string
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
