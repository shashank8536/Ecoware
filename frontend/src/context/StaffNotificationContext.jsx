import { useCallback, useEffect, useMemo, useState } from 'react'
import { initialStaffNotifications } from '../data/staffNotifications'
import { StaffNotificationContext } from './StaffNotificationContextInstance'

const STORAGE_KEY = 'ecoware_staff_notifications_v1'

const loadStoredNotifications = () => {
  if (typeof window === 'undefined') return initialStaffNotifications
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialStaffNotifications
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length >= 0) {
      return parsed
    }
  } catch (err) {
    console.warn('Failed to parse notifications from localStorage, falling back to defaults', err)
  }
  return initialStaffNotifications
}

export function StaffNotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(loadStoredNotifications)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    } catch (err) {
      console.warn('Failed to persist notifications to localStorage', err)
    }
  }, [notifications])

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.isRead).length
  }, [notifications])

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    )
  }, [])

  const markAsUnread = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: false } : item)),
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((item) => (item.isRead ? item : { ...item, isRead: true })),
    )
  }, [])

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const resetNotifications = useCallback(() => {
    setNotifications(initialStaffNotifications)
  }, [])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      totalCount: notifications.length,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      dismissNotification,
      resetNotifications,
    }),
    [
      notifications,
      unreadCount,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      dismissNotification,
      resetNotifications,
    ],
  )

  return (
    <StaffNotificationContext.Provider value={value}>
      {children}
    </StaffNotificationContext.Provider>
  )
}

