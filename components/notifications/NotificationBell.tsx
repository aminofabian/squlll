'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useChatOptional, useChatUnreadTotal } from '@/lib/chat/ChatProvider'
import {
  useNotificationUnreadCount,
  useNotificationsOptional,
} from '@/lib/notifications/NotificationProvider'
import { useRealtime } from '@/lib/realtime/RealtimeProvider'
import {
  formatParticipantLabel,
  formatRelativeTime,
  getCurrentUserId,
} from '@/lib/chat/utils'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
  messagesHref?: string
  notificationsHref?: string
  className?: string
  iconButtonClass?: string
}

export function NotificationBell({
  messagesHref = '/communication',
  notificationsHref = '/notifications',
  className,
  iconButtonClass,
}: NotificationBellProps) {
  const chatUnread = useChatUnreadTotal()
  const alertUnread = useNotificationUnreadCount()
  const totalUnread = chatUnread + alertUnread

  const chat = useChatOptional()
  const notificationsCtx = useNotificationsOptional()
  const conversations = chat?.conversations ?? []
  const notifications = (notificationsCtx?.notifications ?? []).slice(0, 5)

  const { connected, connectionError } = useRealtime()
  const currentUserId = getCurrentUserId()

  const unreadConversations = conversations
    .filter((c) => (c.unreadCount ?? 0) > 0)
    .slice(0, 3)

  const unreadAlerts = notifications.filter((n) => !n.read).slice(0, 3)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative bg-white/60 dark:bg-slate-950/40',
            iconButtonClass,
            className,
          )}
          aria-label={`Notifications${totalUnread ? `, ${totalUnread} unread` : ''}`}
        >
          <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          {totalUnread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-2 py-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Notifications
          </span>
          <span
            className={cn(
              'text-[10px] font-medium',
              connected ? 'text-emerald-600' : 'text-amber-600',
            )}
          >
            {connected ? 'Live' : connectionError ? 'Offline' : 'Connecting…'}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />

        {unreadAlerts.length > 0 && (
          <>
            <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
              Alerts
            </DropdownMenuLabel>
            {unreadAlerts.map((notification) => (
              <DropdownMenuItem key={notification.id} asChild>
                <Link
                  href={notificationsHref}
                  className="flex cursor-pointer flex-col items-start rounded-lg px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-foreground">
                    {notification.title}
                  </span>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {notification.body}
                  </p>
                  <span className="mt-1 text-[11px] text-muted-foreground">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1" />
          </>
        )}

        {unreadConversations.length > 0 && (
          <>
            <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
              Messages
            </DropdownMenuLabel>
            {unreadConversations.map((conversation) => (
              <DropdownMenuItem key={conversation.id} asChild>
                <Link
                  href={messagesHref}
                  className="flex cursor-pointer flex-col items-start rounded-lg px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-foreground">
                    {formatParticipantLabel(conversation, currentUserId)}
                  </span>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {conversation.lastMessage}
                  </p>
                  <span className="mt-1 text-[11px] text-muted-foreground">
                    {formatRelativeTime(conversation.updatedAt)}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1" />
          </>
        )}

        {unreadAlerts.length === 0 && unreadConversations.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            You&apos;re all caught up
          </div>
        )}

        <DropdownMenuItem asChild>
          <Link
            href={notificationsHref}
            className="cursor-pointer justify-center text-center text-sm font-medium text-primary"
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
