import { useEffect, useRef } from 'react'
import { CalendarDays, Camera, CheckCircle2, Clock, MapPin, Tag, Timer, X } from 'lucide-react'
import { TaskPriorityBadge, TaskStatusBadge } from './TaskBadges'

function TaskDetailsModal({ task, onClose }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!task) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [task, onClose])

  if (!task) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close task details"
        className="absolute inset-0 bg-gray-900/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-details-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">{task.id}</p>
            <h2 id="task-details-title" className="mt-1 text-xl font-bold text-primary-ink">
              {task.name}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-primary-light hover:text-primary-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <TaskPriorityBadge priority={task.priority} />
          <TaskStatusBadge status={task.status} />
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
            <Tag className="h-3 w-3" aria-hidden="true" />
            {task.wasteType}
          </span>
        </div>

        {/* Detailed Fields Grid */}
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
            <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Location
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-800">{task.location}</dd>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
            <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Scheduled Time
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-800">
              Today · {task.scheduledTime}
            </dd>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
            <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              <Timer className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Estimated Duration
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-800">{task.duration}</dd>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
            <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Schedule Date
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-800">Today (Assigned)</dd>
          </div>
        </dl>

        {/* Instructions */}
        <div className="mt-4 rounded-xl bg-primary-light/60 p-4">
          <p className="text-xs font-semibold tracking-wider text-primary-dark uppercase">
            Collection Instructions
          </p>
          <p className="mt-1.5 text-sm text-gray-800 leading-relaxed">{task.instructions}</p>
        </div>

        {/* Completion details if completed */}
        {task.status === 'Completed' && (
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary-light/25 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-dark uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Completion Record
            </div>

            <p className="mt-1.5 text-xs text-gray-600">
              Completed at:{' '}
              <span className="font-semibold text-gray-800">
                {task.completedAt || `Today · ${task.scheduledTime}`}
              </span>
            </p>

            <div className="mt-2 text-xs">
              <span className="font-semibold text-gray-700">Remarks: </span>
              <span className="text-gray-800">
                {task.remarks || 'No completion remarks entered.'}
              </span>
            </div>

            {task.proofPhoto ? (
              <div className="mt-3">
                <p className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                  <Camera className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  Uploaded Proof Photo:
                </p>
                <div className="mt-1.5 overflow-hidden rounded-lg border border-gray-200 bg-black">
                  <img
                    src={task.proofPhoto}
                    alt={task.proofPhotoName || 'Collection proof'}
                    className="max-h-56 w-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 text-xs text-gray-500">
                <Camera className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <span>No proof photo available for this task</span>
              </div>
            )}
          </div>
        )}

        {/* Modal footer */}
        <div className="mt-6 flex justify-end pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Close details
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskDetailsModal