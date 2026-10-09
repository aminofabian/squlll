import type { MessageDaySection } from '@/lib/chat/groupMessagesByDay'
import { ChatDateDivider } from './ChatDateDivider'
import { ChatMessageGroup } from './ChatMessageGroup'

interface ChatMessageSectionsProps {
  sections: MessageDaySection[]
  peerLabel: string
}

export function ChatMessageSections({ sections, peerLabel }: ChatMessageSectionsProps) {
  return (
    <div>
      {sections.map((section) => (
        <div key={section.dayKey}>
          <ChatDateDivider label={section.dayLabel} />
          <div className="space-y-3">
            {section.groups.map((group) => (
              <ChatMessageGroup key={group.id} group={group} peerLabel={peerLabel} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
