import { useEffect, useMemo, useState } from 'react'
import { StaffTaskContext } from './StaffTaskContextInstance'
import { staffTasks as initialTasks } from '../data/staffTasks'

const STORAGE_KEY = 'ecoware_staff_tasks_v2'

export function StaffTaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((task) => {
            if (!task.scheduledDate) {
              const matching = initialTasks.find((it) => it.id === task.id)
              return { ...task, scheduledDate: matching?.scheduledDate }
            }
            return task
          })
        }
      }
    } catch {
      // Storage access fallback
    }
    return initialTasks
  })

  // Synchronize state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // Storage quota or restriction fallback
    }
  }, [tasks])

  // Calculated statistics
  const stats = useMemo(() => {
    return tasks.reduce(
      (summary, task) => {
        summary.assigned += 1
        if (task.status === 'Pending') summary.pending += 1
        if (task.status === 'In Progress') summary.inProgress += 1
        if (task.status === 'Completed') summary.completed += 1
        return summary
      },
      { assigned: 0, pending: 0, inProgress: 0, completed: 0 },
    )
  }, [tasks])

  const completionPercent = stats.assigned === 0 ? 0 : Math.round((stats.completed / stats.assigned) * 100)

  // Status transition function with strict validation
  const updateTaskStatus = (taskId, targetStatus, payload = {}) => {
    let success = false
    let errorMessage = ''

    setTasks((currentTasks) => {
      const task = currentTasks.find((t) => t.id === taskId)
      if (!task) {
        errorMessage = `Task ${taskId} not found.`
        return currentTasks
      }

      // Validate transitions
      if (task.status === 'Pending' && targetStatus !== 'In Progress') {
        errorMessage = 'Pending tasks must be transitioned to "In Progress" before completion.'
        return currentTasks
      }

      if (task.status === 'In Progress' && targetStatus !== 'Completed') {
        errorMessage = 'In Progress tasks can only be transitioned to "Completed".'
        return currentTasks
      }

      if (task.status === 'Completed') {
        errorMessage = `Task ${taskId} is already Completed.`
        return currentTasks
      }

      success = true
      return currentTasks.map((t) => {
        if (t.id !== taskId) return t
        return {
          ...t,
          status: targetStatus,
          remarks: payload.remarks || t.remarks || '',
          proofPhoto: payload.proofPhoto !== undefined ? payload.proofPhoto : t.proofPhoto || null,
          proofPhotoName: payload.proofPhotoName || t.proofPhotoName || null,
          completedAt:
            payload.completedAt ||
            (targetStatus === 'Completed'
              ? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
              : t.completedAt),
          updatedAt: new Date().toISOString(),
        }
      })
    })

    return { success, error: errorMessage }
  }

  // Reset to default dataset
  const resetTasks = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setTasks(initialTasks)
  }

  return (
    <StaffTaskContext.Provider
      value={{
        tasks,
        stats,
        completionPercent,
        updateTaskStatus,
        resetTasks,
      }}
    >
      {children}
    </StaffTaskContext.Provider>
  )
}
