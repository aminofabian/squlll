import { chatGraphqlFetch } from './graphql'
import { SEND_MESSAGE } from './queries'
import type { ChatMessage } from './types'

export interface SendMessageInput {
  recipientType: string
  recipientId: string
  content: string
}

export async function sendMessageViaGraphql(
  subdomain: string,
  input: SendMessageInput,
): Promise<ChatMessage> {
  const data = await chatGraphqlFetch<{ sendMessage: ChatMessage }>(
    SEND_MESSAGE,
    {
      input: {
        recipientType: input.recipientType.toUpperCase(),
        recipientId: input.recipientId,
        content: input.content,
      },
    },
    subdomain,
  )
  return data.sendMessage
}
