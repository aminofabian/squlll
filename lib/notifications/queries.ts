export const MY_NOTIFICATIONS = `
  query MyNotifications($limit: Int, $unreadOnly: Boolean) {
    myNotifications(limit: $limit, unreadOnly: $unreadOnly) {
      id
      type
      title
      body
      href
      read
      createdAt
    }
  }
`

export const UNREAD_NOTIFICATION_COUNT = `
  query UnreadNotificationCount {
    unreadNotificationCount
  }
`

export const MARK_NOTIFICATION_READ = `
  mutation MarkNotificationRead($notificationId: String!) {
    markNotificationRead(notificationId: $notificationId) {
      id
      read
    }
  }
`

export const MARK_ALL_NOTIFICATIONS_READ = `
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`
