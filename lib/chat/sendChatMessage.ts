import type { Socket } from 'socket.io-client'
import { getOtherParticipant } from './utils'
import { sendMessageViaGraphql, type SendMessageInput } from './sendMessageViaGraphql'
import type { ChatConversation, ChatMessage } from './types'

interface SendChatMessageArgs {
  socket: Socket | null
  subdomain: string
  conversation: ChatConversation
  currentUserId: string
  content: string
}

interface SocketAck {
  ok?: boolean
  error?: string
}

function emitOverSocket(socket: Socket, input: SendMessageInput): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    socket.emit('send_message', input, (ack: SocketAck) => {
      if (ack?.ok === false || ack?.error) {
        reject(new Error(ack.error ?? 'Send failed'))
        return
      }
      resolve()
    })
  })
}

/**
 * Sends over the live socket when connected (the server echoes `new_message`
 * back to the sender, so nothing is returned). Falls back to GraphQL, which
 * returns the stored message so the caller can display it immediately.
 */
export async function sendChatMessage(
  args: SendChatMessageArgs,
): Promise<ChatMessage | null> {
  const recipient = getOtherParticipant(args.conversation, args.currentUserId)
  const input: SendMessageInput = { ...recipient, content: args.content }
  if (args.socket?.connected) {
    await emitOverSocket(args.socket, input)
    return null
  }
  return sendMessageViaGraphql(args.subdomain, input)
}
