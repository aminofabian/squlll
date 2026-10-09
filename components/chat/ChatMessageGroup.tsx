import { cn } from '@/lib/utils'
import type { MessageGroup } from '@/lib/chat/groupMessagesByDay'
import { ChatAvatar } from './ChatAvatar'
import { ChatMessageBubble } from './ChatMessageBubble'
import { ChatMessageMeta } from './ChatMessageMeta'

interface ChatMessageGroupProps {
  group: MessageGroup
  peerLabel: string
}

export function ChatMessageGroup({ group, peerLabel }: ChatMessageGroupProps) {
  const { isMine, messages } = group
  const lastMessage = messages[messages.length - 1]
  return (
    <div className={cn('flex items-end gap-2', isMine ? 'justify-end' : 'justify-start')}>
      {isMine ? null : <ChatAvatar label={peerLabel} size="xs" />}
      <div
        className={cn(
          'flex min-w-0 max-w-[82%] flex-col gap-0.5 sm:max-w-[70%]',
          isMine ? 'items-end' : 'items-start',
        )}
      >
        {messages.map((message) => (
          <ChatMessageBubble key={message.id} content={message.content} isMine={isMine} />
        ))}
        <ChatMessageMeta
          createdAt={lastMessage.createdAt}
          isMine={isMine}
          isRead={lastMessage.isRead}
        />
      </div>
    </div>
  )
}
