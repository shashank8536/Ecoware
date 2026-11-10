import { useContext } from 'react'
import { StaffNotificationContext } from './StaffNotificationContextInstance'

export function useStaffNotifications() {
  const context = useContext(StaffNotificationContext)
  if (!context) {
    throw new Error('useStaffNotifications must be used within a StaffNotificationProvider')
  }
  return context
}

