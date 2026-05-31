'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useParams, usePathname } from 'next/navigation'
import { useRealtime } from '@/lib/realtime/RealtimeProvider'
import { chatGraphqlFetch } from '@/lib/chat/graphql'
import {
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION_READ,
  MY_NOTIFICATIONS,
  UNREAD_NOTIFICATION_COUNT,
} from './queries'
import type { AppNotification, NotificationNewEvent } from './types'

interface NotificationContextValue {
  notifications: AppNotification[]
  unreadCount: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  markRead: (notificationId: string) => Promise<void>
  markAllRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function useNotificationsOptional() {
  return useContext(NotificationContext)
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return ctx
}

export function useNotificationUnreadCount(): number {
  return useContext(NotificationContext)?.unreadCount ?? 0
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const subdomain = typeof params?.subdomain === 'string' ? params.subdomain : ''
  const { socket } = useRealtime()

  const skipFetch =
    !subdomain ||
    pathname?.includes('/login') ||
    pathname?.includes('/signup')

  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (skipFetch) return
    setLoading(true)
    setError(null)
    try {
      const [listResult, countResult] = await Promise.all([
        chatGraphqlFetch<{ myNotifications: AppNotification[] }>(
          MY_NOTIFICATIONS,
          { limit: 30, unreadOnly: false },
          subdomain,
        ),
        chatGraphqlFetch<{ unreadNotificationCount: number }>(
          UNREAD_NOTIFICATION_COUNT,
          {},
          subdomain,
        ),
      ])
      setNotifications(listResult.myNotifications ?? [])
      setUnreadCount(countResult.unreadNotificationCount ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [subdomain, skipFetch])

  useEffect(() => {
    void refetch()
  }, [refetch])

  useEffect(() => {
    if (!socket) return

    const handleNotification = (envelope: NotificationNewEvent) => {
      const item = envelope.payload
      if (!item?.id) return

      setNotifications((prev) => {
        if (prev.some((n) => n.id === item.id)) return prev
        return [item, ...prev]
      })
      if (!item.read) {
        setUnreadCount((c) => c + 1)
      }
    }

    socket.on('notification.new', handleNotification)
    return () => {
      socket.off('notification.new', handleNotification)
    }
  }, [socket])

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!subdomain) return
      await chatGraphqlFetch(
        MARK_NOTIFICATION_READ,
        { notificationId },
        subdomain,
      )
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        ),
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    },
    [subdomain],
  )

  const markAllRead = useCallback(async () => {
    if (!subdomain) return
    await chatGraphqlFetch(MARK_ALL_NOTIFICATIONS_READ, {}, subdomain)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [subdomain])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      refetch,
      markRead,
      markAllRead,
    }),
    [notifications, unreadCount, loading, error, refetch, markRead, markAllRead],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
