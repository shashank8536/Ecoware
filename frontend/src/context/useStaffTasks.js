import { useContext } from 'react'
import { StaffTaskContext } from './StaffTaskContextInstance'

export function useStaffTasks() {
  const context = useContext(StaffTaskContext)
  if (!context) {
    throw new Error('useStaffTasks must be used within a StaffTaskProvider')
  }
  return context
}
