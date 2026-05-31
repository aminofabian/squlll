export interface AppNotification {
  id: string
  type: string
  title: string
  body: string
  href?: string | null
  read: boolean
  createdAt: string
}

export interface NotificationNewEvent {
  event: 'notification.new'
  tenantId: string
  payload: AppNotification
  timestamp: string
}
