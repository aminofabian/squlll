export const MY_CONVERSATIONS = `
  query MyConversations {
    myConversations {
      id
      type
      participant1Type
      participant1Id
      participant2Type
      participant2Id
      lastMessage
      unreadCount
      updatedAt
      createdAt
      tenantId
    }
  }
`

export const CONVERSATION_MESSAGES = `
  query ConversationMessages($conversationId: String!, $limit: Float, $before: String) {
    conversationMessages(conversationId: $conversationId, limit: $limit, before: $before) {
      id
      conversationId
      senderType
      senderId
      content
      createdAt
      isRead
    }
  }
`

export const SEND_MESSAGE = `
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      conversationId
      senderType
      senderId
      content
      createdAt
      isRead
    }
  }
`

export const MARK_CONVERSATION_READ = `
  mutation MarkConversationAsRead($conversationId: String!) {
    markConversationAsRead(conversationId: $conversationId)
  }
`
