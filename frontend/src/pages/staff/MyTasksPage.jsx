import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Check,
  CheckCircle2,
  Clock,
  Filter,
  LayoutGrid,
  MapPin,
  Play,
  RotateCcw,
  Search,
  Table as TableIcon,
  Tag,
  Timer,
  X,
} from 'lucide-react'
import FilterSelect from '../../components/citizen/FilterSelect'
import { TaskPriorityBadge, TaskStatusBadge } from '../../components/staff/TaskBadges'
import TaskCompletionModal from '../../components/staff/TaskCompletionModal'
import TaskDetailsModal from '../../components/staff/TaskDetailsModal'
import { useStaffTasks } from '../../context/useStaffTasks'
import { staffProfile } from '../../data/staffTasks'

const PRIORITY_OPTIONS = ['All Priorities', 'High', 'Medium', 'Low']
const TAB_OPTIONS = ['All', 'Pending', 'In Progress', 'Completed']

function MyTasksPage() {
  const { tasks, stats, updateTaskStatus } = useStaffTasks()
  const [searchParams] = useSearchParams()
  const initialParamTaskId = searchParams.get('taskId') || ''

  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState(initialParamTaskId)
  const [priorityFilter, setPriorityFilter] = useState('All Priorities')
  const [viewMode, setViewMode] = useState('cards') // 'cards' | 'table'
  const [selectedTaskId, setSelectedTaskId] = useState(initialParamTaskId || null)
  const [completingTaskId, setCompletingTaskId] = useState(null)
  const [toast, setToast] = useState(null)

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase()

    return tasks.filter((task) => {
      const matchesTab = activeTab === 'All' || task.status === activeTab
      const matchesSearch =
        !query ||
        task.id.toLowerCase().includes(query) ||
        task.name.toLowerCase().includes(query) ||
        task.location.toLowerCase().includes(query)
      const matchesPriority = priorityFilter === 'All Priorities' || task.priority === priorityFilter
      return matchesTab && matchesSearch && matchesPriority
    })
  }, [tasks, activeTab, search, priorityFilter])

  const isFiltering = search.trim() !== '' || priorityFilter !== 'All Priorities' || activeTab !== 'All'

  const clearFilters = () => {
    setSearch('')
    setPriorityFilter('All Priorities')
    setActiveTab('All')
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  // Handle: Pending -> In Progress
  const handleStartTask = (taskId) => {
    const result = updateTaskStatus(taskId, 'In Progress')
    if (result.success) {
      showToast(`Task ${taskId} is now In Progress. Proceed to the collection site.`, 'info')
    } else {
      showToast(result.error, 'error')
    }
  }

  // Handle: In Progress -> Completed
  const handleConfirmCompletion = ({ taskId, remarks, proofPhoto, proofPhotoName, completedAt }) => {
    const result = updateTaskStatus(taskId, 'Completed', {
      remarks,
      proofPhoto,
      proofPhotoName,
      completedAt,
    })

    if (result.success) {
      showToast(`Task ${taskId} successfully marked as Completed with proof photo!`, 'success')
    } else {
      showToast(result.error, 'error')
    }
  }

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null
  const completingTask = tasks.find((t) => t.id === completingTaskId) || null

  return (
    <div className="space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
      {/* Toast Alert Banner */}
      {toast && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-xl px-4 py-3 shadow-sm transition-all ${
            toast.type === 'success'
              ? 'border border-primary/30 bg-primary-light text-primary-dark'
              : toast.type === 'info'
              ? 'border border-blue-200 bg-blue-50 text-blue-900'
              : 'border border-red-200 bg-red-50 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="rounded p-1 text-gray-500 hover:text-gray-700"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <span>Staff Portal</span>
            <span>·</span>
            <span className="text-gray-500">{staffProfile.ward}</span>
            <span>·</span>
            <span className="text-gray-500">ID: {staffProfile.staffId}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-primary-ink sm:text-3xl">My Tasks</h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Track, start, and complete your assigned waste collection rounds for today.
          </p>
        </div>

        {/* Live Status Counter Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-gray-700">
            Total: <strong className="text-primary-ink">{stats.assigned}</strong>
          </span>
          <span className="rounded-xl border border-amber-200/60 bg-amber-50 px-3 py-2 text-amber-800">
            Pending: <strong className="text-amber-900">{stats.pending}</strong>
          </span>
          <span className="rounded-xl border border-blue-200/60 bg-blue-50 px-3 py-2 text-blue-800">
            In Progress: <strong className="text-blue-900">{stats.inProgress}</strong>
          </span>
          <span className="rounded-xl border border-primary/20 bg-primary-light px-3 py-2 text-primary-dark">
            Completed: <strong className="text-primary-ink">{stats.completed}</strong>
          </span>
        </div>
      </header>

      {/* Tabs and Controls Section */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        {/* Status Tabs and View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Task Status Tabs">
            {TAB_OPTIONS.map((tab) => {
              const tabCount =
                tab === 'All'
                  ? stats.assigned
                  : tab === 'Pending'
                  ? stats.pending
                  : tab === 'In Progress'
                  ? stats.inProgress
                  : stats.completed
              const isActive = activeTab === tab

              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:bg-primary-light hover:text-primary-ink'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tabCount}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Cards vs Table View Toggle */}
          <div className="hidden sm:flex items-center gap-1 rounded-lg border border-gray-200 p-1">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`rounded p-1.5 transition-colors ${
                viewMode === 'cards' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
              aria-label="Cards view"
              title="Cards view"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded p-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
              aria-label="Table view"
              title="Table view"
            >
              <TableIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[2fr_1fr_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by task ID, task name, or location"
              aria-label="Search tasks"
              className="block w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3.5 pl-10 text-sm text-gray-800 shadow-sm outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <FilterSelect
            label="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={PRIORITY_OPTIONS}
          />

          {isFiltering && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 px-4 py-2.5 text-xs font-semibold text-primary-dark transition-colors hover:bg-primary-light"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Main Task Display */}
      {filteredTasks.length > 0 ? (
        viewMode === 'cards' ? (
          /* Cards View */
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Assigned Task Cards">
            {filteredTasks.map((task) => (
              <article
                key={task.id}
                className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-primary-ink text-sm sm:text-base">{task.id}</span>
                    <div className="flex items-center gap-1.5">
                      <TaskPriorityBadge priority={task.priority} />
                      <TaskStatusBadge status={task.status} />
                    </div>
                  </div>

                  {/* Task Name */}
                  <h3 className="mt-2 text-base font-bold text-gray-900">{task.name}</h3>

                  {/* Metadata Fields */}
                  <dl className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                      <span className="truncate font-medium text-gray-700">{task.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                      <span>Scheduled: {task.scheduledTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                      <span>Duration: {task.duration}</span>
                    </div>
                  </dl>

                  {/* Waste Category Tag */}
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                      <Tag className="h-3 w-3" aria-hidden="true" />
                      {task.wasteType}
                    </span>
                  </div>

                  {/* Completed info banner */}
                  {task.status === 'Completed' && (
                    <div className="mt-3 rounded-lg border border-primary/20 bg-primary-light/40 p-2.5 text-xs text-primary-dark">
                      <p className="font-semibold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        Completed {task.completedAt ? `at ${task.completedAt}` : ''}
                      </p>
                      {task.proofPhoto && (
                        <p className="mt-0.5 text-[11px] text-gray-600">✓ Proof photo attached</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="mt-5 flex items-center justify-between gap-2 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTaskId(task.id)}
                    className="text-xs font-semibold text-primary transition-colors hover:text-primary-dark"
                  >
                    View Details
                  </button>

                  {/* Status Action Buttons */}
                  {task.status === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => handleStartTask(task.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
                    >
                      <Play className="h-3.5 w-3.5" aria-hidden="true" />
                      Start Task
                    </button>
                  )}

                  {task.status === 'In Progress' && (
                    <button
                      type="button"
                      onClick={() => setCompletingTaskId(task.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Complete Task
                    </button>
                  )}

                  {task.status === 'Completed' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Done
                    </span>
                  )}
                </div>
              </article>
            ))}
          </section>
        ) : (
          /* Table View */
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm overflow-x-auto" aria-label="Assigned Task Table">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs tracking-wider text-gray-500 uppercase">
                  <th className="py-3 pr-4 font-semibold">Task ID</th>
                  <th className="py-3 pr-4 font-semibold">Task Name</th>
                  <th className="py-3 pr-4 font-semibold">Waste Category</th>
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
                    <td className="py-3.5 pr-4 font-medium text-gray-900">{task.name}</td>
                    <td className="py-3.5 pr-4 text-xs text-gray-600">{task.wasteType}</td>
                    <td className="py-3.5 pr-4">{task.location}</td>
                    <td className="py-3.5 pr-4 whitespace-nowrap">{task.scheduledTime}</td>
                    <td className="py-3.5 pr-4">
                      <TaskPriorityBadge priority={task.priority} />
                    </td>
                    <td className="py-3.5 pr-4">
                      <TaskStatusBadge status={task.status} />
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTaskId(task.id)}
                          className="rounded-lg border border-primary/30 px-2.5 py-1 text-xs font-semibold text-primary-dark transition-colors hover:bg-primary-light"
                        >
                          Details
                        </button>

                        {task.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => handleStartTask(task.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-primary-dark"
                          >
                            <Play className="h-3 w-3" aria-hidden="true" />
                            Start
                          </button>
                        )}

                        {task.status === 'In Progress' && (
                          <button
                            type="button"
                            onClick={() => setCompletingTaskId(task.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                          >
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
            <Filter className="h-6 w-6" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-lg font-bold text-primary-ink">No tasks found</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            No collection tasks match your selected tab, search query, or priority filter.
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

      {/* Task Details Modal */}
      <TaskDetailsModal task={selectedTask} onClose={() => setSelectedTaskId(null)} />

      {/* Task Completion Modal */}
      <TaskCompletionModal
        task={completingTask}
        isOpen={Boolean(completingTask)}
        onClose={() => setCompletingTaskId(null)}
        onComplete={handleConfirmCompletion}
      />
    </div>
  )
}

export default MyTasksPage