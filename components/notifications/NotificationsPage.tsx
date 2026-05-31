'use client'

import Link from 'next/link'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/lib/notifications/NotificationProvider'
import { formatRelativeTime } from '@/lib/chat/utils'
import { cn } from '@/lib/utils'

export function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markRead,
    markAllRead,
  } = useNotifications()

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={() => void markAllRead()}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading notifications…
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No notifications yet. Alerts for timetable updates, fees, and more will appear here.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                    !notification.read && 'bg-primary/5',
                  )}
                  onClick={() => {
                    if (!notification.read) {
                      void markRead(notification.id)
                    }
                  }}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {notification.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{notification.body}</p>
                  {notification.href && (
                    <Link
                      href={notification.href}
                      className="mt-1 text-xs font-medium text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View details
                    </Link>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
