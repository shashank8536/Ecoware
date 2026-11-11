const statusStyles = {
  Pending: 'bg-amber-100 text-amber-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Completed: 'bg-primary-light text-primary-dark',
}

const priorityStyles = {
  High: 'bg-red-50 text-red-700',
  Medium: 'bg-amber-50 text-amber-800',
  Low: 'bg-gray-100 text-gray-600',
}

function Badge({ label, className }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${className}`}>
      {label}
    </span>
  )
}

export function TaskStatusBadge({ status }) {
  return <Badge label={status} className={statusStyles[status] || 'bg-gray-100 text-gray-700'} />
}

export function TaskPriorityBadge({ priority }) {
  return <Badge label={priority} className={priorityStyles[priority] || 'bg-gray-100 text-gray-700'} />
}
