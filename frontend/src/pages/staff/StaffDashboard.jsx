import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  IdCard,
  ListTodo,
  LoaderCircle,
  MapPin,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import FilterSelect from '../../components/citizen/FilterSelect'
import SummaryCard from '../../components/dashboard/SummaryCard'
import TaskDetailsModal from '../../components/staff/TaskDetailsModal'
import { TaskPriorityBadge, TaskStatusBadge } from '../../components/staff/TaskBadges'
import { useStaffTasks } from '../../context/useStaffTasks'
import { useStaffNotifications } from '../../context/useStaffNotifications'
import { staffProfile } from '../../data/staffTasks'

const STATUS_OPTIONS = ['All Statuses', 'Pending', 'In Progress', 'Completed']
const PRIORITY_OPTIONS = ['All Priorities', 'High', 'Medium', 'Low']

const TODAY_LABEL = new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function StaffDashboard() {
  const { tasks, stats, completionPercent } = useStaffTasks()
  const { notifications, unreadCount, markAsRead } = useStaffNotifications()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [priorityFilter, setPriorityFilter] = useState('All Priorities')
  const [selectedTaskId, setSelectedTaskId] = useState(null)

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase()
    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.id.toLowerCase().includes(query) ||
        task.name.toLowerCase().includes(query) ||
        task.location.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'All Statuses' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'All Priorities' || task.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tasks, search, statusFilter, priorityFilter])

  const isFiltering = search.trim() !== '' || statusFilter !== 'All Statuses' || priorityFilter !== 'All Priorities'
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) || null

  const todayLabel = TODAY_LABEL

  const summaryCards = [
    {
      label: 'Assigned Tasks',
      value: stats.assigned,
      icon: <ClipboardList className="h-6 w-6" />,
      accent: 'primary',
    },
    {
      label: 'Pending Tasks',
      value: stats.pending,
      icon: <ListTodo className="h-6 w-6" />,
      accent: 'amber',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: <LoaderCircle className="h-6 w-6" />,
      accent: 'blue',
    },
    {
      label: 'Completed Tasks',
      value: stats.completed,
      icon: <CheckCircle2 className="h-6 w-6" />,
      accent: 'primary',
    },
  ]

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All Statuses')
    setPriorityFilter('All Priorities')
  }

  return (
    <div className="space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
      <header className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <div>
            <p className="text-sm font-semibold text-primary">Staff Portal</p>
            <h1 className="mt-1 text-2xl font-bold text-primary-ink sm:text-3xl">
              Welcome back, {staffProfile.name}
            </h1>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">Here&apos;s your collection activity for today.</p>
          </div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-primary-light px-3 py-2.5">
              <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary-dark uppercase">
                <IdCard className="h-3.5 w-3.5" aria-hidden="true" />
                Staff ID
              </dt>
              <dd className="mt-1 text-sm font-semibold text-primary-ink">{staffProfile.staffId}</dd>
            </div>
            <div className="rounded-xl bg-primary-light px-3 py-2.5">
              <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary-dark uppercase">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                Assigned Ward
              </dt>
              <dd className="mt-1 text-sm font-semibold text-primary-ink">{staffProfile.ward}</dd>
            </div>
            <div className="rounded-xl bg-primary-light px-3 py-2.5">
              <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary-dark uppercase">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                Today
              </dt>
              <dd className="mt-1 text-sm font-semibold text-primary-ink">{todayLabel}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4" aria-label="Task summary">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-primary-ink">Today&apos;s Assigned Tasks</h2>
              <p className="mt-1 text-sm text-gray-500">
                Showing {filteredTasks.length} of {stats.assigned} tasks for {staffProfile.ward}.
              </p>
            </div>
            {isFiltering && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary-dark transition-colors hover:bg-primary-light"
              >
                Clear filters
              </button>
            )}
          </div>

          <div aria-label="Search and filter tasks" className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr]">
            <div className="relative md:col-span-2 xl:col-span-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by task ID, name, or location"
                aria-label="Search tasks by ID, name, or location"
                className="block w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3.5 pl-10 text-sm text-gray-800 shadow-sm transition-colors outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
            <FilterSelect
              label="Priority"
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={PRIORITY_OPTIONS}
            />
          </div>
        </div>

        {filteredTasks.length > 0 ? (
          <div className="overflow-x-auto px-6 pb-6">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs tracking-wider text-gray-500 uppercase">
                  <th className="py-3 pr-4 font-semibold">Task ID</th>
                  <th className="py-3 pr-4 font-semibold">Task Name</th>
                  <th className="py-3 pr-4 font-semibold">Location</th>
                  <th className="py-3 pr-4 font-semibold">Scheduled Time</th>
                  <th className="py-3 pr-4 font-semibold">Priority</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="text-gray-700">
                    <td className="py-3.5 pr-4 font-semibold text-primary-ink">{task.id}</td>
                    <td className="py-3.5 pr-4">{task.name}</td>
                    <td className="py-3.5 pr-4">{task.location}</td>
                    <td className="py-3.5 pr-4 whitespace-nowrap">{task.scheduledTime}</td>
                    <td className="py-3.5 pr-4">
                      <TaskPriorityBadge priority={task.priority} />
                    </td>
                    <td className="py-3.5 pr-4">
                      <TaskStatusBadge status={task.status} />
                    </td>
                    <td className="py-3.5">
                      <button
                        type="button"
                        onClick={() => setSelectedTaskId(task.id)}
                        className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary-dark transition-colors hover:bg-primary-light"
                        aria-label={`View details for ${task.id}`}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
              <SlidersHorizontal className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-primary-ink">No tasks match these filters</h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Try a different task ID, location, status, or priority.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-primary-ink">Daily Progress</h2>
          <p className="mt-1 text-sm text-gray-500">
            {stats.completed} of {stats.assigned} assigned tasks completed.
          </p>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold">
              <span className="text-gray-600">Completed</span>
              <span className="text-primary-ink">{completionPercent}%</span>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
              aria-valuenow={completionPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Daily task completion"
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary-dark">
                <Bell className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-primary-ink">Recent Notifications</h2>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {unreadCount > 0 ? (
                <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-bold text-primary-dark">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                  All read
                </span>
              )}
              <Link
                to="/staff/notifications"
                className="text-xs font-semibold text-primary transition-colors hover:text-primary-dark"
              >
                View Inbox →
              </Link>
            </div>
          </div>

          {notifications.length > 0 ? (
            <ul className="mt-4 divide-y divide-gray-100">
              {notifications.slice(0, 4).map((notification) => (
                <li key={notification.id} className="py-3 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (!notification.isRead) markAsRead(notification.id)
                      if (notification.taskId) setSelectedTaskId(notification.taskId)
                    }}
                    className={`w-full rounded-lg text-left transition-colors p-2 ${
                      notification.isRead
                        ? 'hover:bg-gray-50'
                        : 'bg-primary-light/15 hover:bg-primary-light/30'
                    }`}
                    aria-label={`${notification.title}. ${notification.taskId ? `Open related task ${notification.taskId}` : ''}`}
                  >
                    <span className="block">
                      <span className="flex items-start justify-between gap-3">
                        <span className="flex items-center gap-2">
                          {!notification.isRead && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                          <span
                            className={`text-sm ${
                              notification.isRead
                                ? 'font-medium text-gray-800'
                                : 'font-bold text-primary-ink'
                            }`}
                          >
                            {notification.title}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-gray-400">{notification.time}</span>
                      </span>
                      <span className="mt-1 block text-xs text-gray-600 line-clamp-2">
                        {notification.description || notification.message}
                      </span>
                      {notification.taskId && (
                        <span className="mt-1.5 inline-block text-[11px] font-semibold text-primary">
                          Related Task: {notification.taskId} →
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 flex flex-col items-center py-6 text-center text-xs text-gray-500">
              <p>No recent notifications.</p>
              <Link to="/staff/notifications" className="mt-2 font-semibold text-primary hover:underline">
                Open Notifications Inbox
              </Link>
            </div>
          )}
        </article>
      </section>

      <TaskDetailsModal task={selectedTask} onClose={() => setSelectedTaskId(null)} />
    </div>
  )
}

export default StaffDashboard
