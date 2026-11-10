import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  CalendarCheck,
  Camera,
  CheckCircle2,
  Clock,
  Filter,
  History,
  ImageOff,
  LayoutGrid,
  MapPin,
  RotateCcw,
  Search,
  Table as TableIcon,
  Tag,
  Timer,
  X,
} from 'lucide-react'
import FilterSelect from '../../components/citizen/FilterSelect'
import { TaskPriorityBadge, TaskStatusBadge } from '../../components/staff/TaskBadges'
import TaskDetailsModal from '../../components/staff/TaskDetailsModal'
import { useStaffTasks } from '../../context/useStaffTasks'
import { staffProfile } from '../../data/staffTasks'

const PRIORITY_OPTIONS = ['All Priorities', 'High', 'Medium', 'Low']
const DATE_OPTIONS = ['All Dates', 'Completed Today', 'Completed This Week', 'Older Collections']

// Pure date format helpers
const formatISODate = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getStartOfWeek = (d) => {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay()
  const diff = (day + 6) % 7 // Monday start
  date.setDate(date.getDate() - diff)
  return date
}

const addDays = (d, days) => {
  const date = new Date(d)
  date.setDate(date.getDate() + days)
  return date
}

// Module-level reference for today's session to keep component renders pure
const TODAY_REF = new Date()
TODAY_REF.setHours(0, 0, 0, 0)
const TODAY_STR = formatISODate(TODAY_REF)
const WEEK_START_STR = formatISODate(getStartOfWeek(TODAY_REF))
const WEEK_END_STR = formatISODate(addDays(getStartOfWeek(TODAY_REF), 6))

function TaskHistoryPage() {
  const { tasks } = useStaffTasks()
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('All Dates')
  const [priorityFilter, setPriorityFilter] = useState('All Priorities')
  const [viewMode, setViewMode] = useState('cards') // 'cards' | 'table'
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [inspectingPhoto, setInspectingPhoto] = useState(null) // { photoUrl, task }

  // 3. Only tasks whose status is Completed
  const completedTasks = useMemo(() => {
    return tasks.filter((task) => task.status === 'Completed')
  }, [tasks])

  // 2. Summary Cards calculated dynamically
  const summary = useMemo(() => {
    const totalCompleted = completedTasks.length
    const completedToday = completedTasks.filter((t) => t.scheduledDate === TODAY_STR).length
    const completedThisWeek = completedTasks.filter(
      (t) => t.scheduledDate >= WEEK_START_STR && t.scheduledDate <= WEEK_END_STR,
    ).length
    const withProof = completedTasks.filter((t) => Boolean(t.proofPhoto)).length

    return {
      totalCompleted,
      completedToday,
      completedThisWeek,
      withProof,
    }
  }, [completedTasks])

  // 4. Search and Filters
  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase()

    return completedTasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.id.toLowerCase().includes(query) ||
        task.name.toLowerCase().includes(query) ||
        task.location.toLowerCase().includes(query)

      const matchesPriority = priorityFilter === 'All Priorities' || task.priority === priorityFilter

      let matchesDate = true
      if (dateFilter === 'Completed Today') {
        matchesDate = task.scheduledDate === TODAY_STR
      } else if (dateFilter === 'Completed This Week') {
        matchesDate = task.scheduledDate >= WEEK_START_STR && task.scheduledDate <= WEEK_END_STR
      } else if (dateFilter === 'Older Collections') {
        matchesDate = task.scheduledDate < WEEK_START_STR
      }

      return matchesSearch && matchesPriority && matchesDate
    })
  }, [completedTasks, search, priorityFilter, dateFilter])

  const isFiltering = search.trim() !== '' || priorityFilter !== 'All Priorities' || dateFilter !== 'All Dates'

  const clearFilters = () => {
    setSearch('')
    setPriorityFilter('All Priorities')
    setDateFilter('All Dates')
  }

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null

  return (
    <div className="space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
      {/* 1. Page Header */}
      <header className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <span>Staff Portal</span>
              <span>·</span>
              <span className="text-gray-500">{staffProfile.ward}</span>
              <span>·</span>
              <span className="text-gray-500">ID: {staffProfile.staffId}</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-primary-ink sm:text-3xl">Task History</h1>
            <p className="mt-1 text-sm text-gray-600 sm:text-base">
              Review your completed collection work, verified proof photos, and operational performance records.
            </p>
          </div>
          <Link
            to="/staff/tasks"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
          >
            Manage Active Tasks
          </Link>
        </div>

        {/* 2. Summary Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border border-primary/20 bg-primary-light/40 p-4">
            <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-primary-dark uppercase">
              <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
              Total Completed
            </dt>
            <dd className="mt-2 text-2xl font-bold text-primary-ink">{summary.totalCompleted}</dd>
            <p className="mt-0.5 text-[11px] text-gray-500">All closed rounds</p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary-light/40 p-4">
            <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-primary-dark uppercase">
              <CalendarCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              Completed Today
            </dt>
            <dd className="mt-2 text-2xl font-bold text-primary-ink">{summary.completedToday}</dd>
            <p className="mt-0.5 text-[11px] text-gray-500">Today's rounds</p>
          </div>

          <div className="rounded-xl border border-blue-200/60 bg-blue-50/60 p-4">
            <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-blue-900 uppercase">
              <Calendar className="h-4 w-4 text-blue-600" aria-hidden="true" />
              This Week
            </dt>
            <dd className="mt-2 text-2xl font-bold text-blue-950">{summary.completedThisWeek}</dd>
            <p className="mt-0.5 text-[11px] text-gray-500">Current week rounds</p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary-light/40 p-4">
            <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-primary-dark uppercase">
              <Camera className="h-4 w-4 text-primary" aria-hidden="true" />
              With Proof Photos
            </dt>
            <dd className="mt-2 text-2xl font-bold text-primary-ink">{summary.withProof}</dd>
            <p className="mt-0.5 text-[11px] text-gray-500">Verified with photo</p>
          </div>
        </div>
      </header>

      {/* 4. Controls & Filters Section */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary-dark">
              <History className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="text-base font-bold text-primary-ink">
              Completed Records ({filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'})
            </h2>
          </div>

          {/* Cards vs Table view switch */}
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

        {/* Search & Select dropdowns */}
        <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-[2fr_1fr_1fr_auto]">
          <div className="relative md:col-span-3 xl:col-span-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Task ID, name, or location"
              aria-label="Search task history"
              className="block w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3.5 pl-10 text-sm text-gray-800 shadow-sm outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <FilterSelect
            label="Date Range"
            value={dateFilter}
            onChange={setDateFilter}
            options={DATE_OPTIONS}
          />

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

      {/* 3. Completed Task History Presentation */}
      {filteredTasks.length > 0 ? (
        viewMode === 'cards' ? (
          /* Cards View */
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Completed Task Cards">
            {filteredTasks.map((task) => (
              <article
                key={task.id}
                className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  {/* Task ID & Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-primary-ink text-sm sm:text-base">{task.id}</span>
                    <div className="flex items-center gap-1.5">
                      <TaskPriorityBadge priority={task.priority} />
                      <TaskStatusBadge status="Completed" />
                    </div>
                  </div>

                  {/* Task Name */}
                  <h3 className="mt-2 text-base font-bold text-gray-900">{task.name}</h3>

                  {/* Key Metadata Fields */}
                  <dl className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                      <span className="truncate font-medium text-gray-700">{task.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                      <span>Scheduled: {task.scheduledTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                      <span>
                        Completed: {task.completedAt || `Today · ${task.scheduledTime}`}
                      </span>
                    </div>
                  </dl>

                  {/* Waste Category and Duration */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                      <Tag className="h-3 w-3" aria-hidden="true" />
                      {task.wasteType}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                      <Timer className="h-3 w-3" aria-hidden="true" />
                      {task.duration}
                    </span>
                  </div>

                  {/* Completion Remarks */}
                  <div className="mt-3 rounded-lg bg-gray-50 p-2.5 text-xs text-gray-700 border border-gray-100">
                    <p className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">
                      Remarks:
                    </p>
                    <p className="mt-0.5 text-gray-800 line-clamp-2">
                      {task.remarks || 'No remarks recorded.'}
                    </p>
                  </div>

                  {/* 6. Proof Photo Preview / Availability */}
                  <div className="mt-3">
                    {task.proofPhoto ? (
                      <button
                        type="button"
                        onClick={() => setInspectingPhoto({ photoUrl: task.proofPhoto, task })}
                        className="group flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary-light/30 p-2 text-left transition hover:bg-primary-light/60 w-full"
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-black">
                          <img
                            src={task.proofPhoto}
                            alt="Proof thumbnail"
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        </div>
                        <div className="text-xs">
                          <p className="font-semibold text-primary-ink flex items-center gap-1">
                            <Camera className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                            Proof Photo Attached
                          </p>
                          <p className="text-[11px] text-gray-500">Click to view full photo</p>
                        </div>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl border border-gray-200/80 bg-gray-50/70 p-2 text-xs text-gray-500">
                        <ImageOff className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        <span>No proof photo available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-5 flex items-center justify-between gap-2 border-t border-gray-100 pt-4">
                  <span className="text-xs font-semibold text-gray-500">Closed Record</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTaskId(task.id)}
                    className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary-dark transition-colors hover:bg-primary-light"
                  >
                    View Details
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          /* Table View */
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm overflow-x-auto" aria-label="Completed Task Table">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs tracking-wider text-gray-500 uppercase">
                  <th className="py-3 pr-4 font-semibold">Task ID</th>
                  <th className="py-3 pr-4 font-semibold">Task Name</th>
                  <th className="py-3 pr-4 font-semibold">Waste Category</th>
                  <th className="py-3 pr-4 font-semibold">Location</th>
                  <th className="py-3 pr-4 font-semibold">Scheduled</th>
                  <th className="py-3 pr-4 font-semibold">Priority</th>
                  <th className="py-3 pr-4 font-semibold">Proof Photo</th>
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
                      {task.proofPhoto ? (
                        <button
                          type="button"
                          onClick={() => setInspectingPhoto({ photoUrl: task.proofPhoto, task })}
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary-light/60 px-2.5 py-1 text-xs font-semibold text-primary-dark hover:bg-primary-light"
                        >
                          <Camera className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                          View Photo
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">No proof photo</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <button
                        type="button"
                        onClick={() => setSelectedTaskId(task.id)}
                        className="rounded-lg border border-primary/30 px-2.5 py-1 text-xs font-semibold text-primary-dark transition-colors hover:bg-primary-light"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )
      ) : (
        /* 4. Empty State */
        <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
            <Filter className="h-6 w-6" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-lg font-bold text-primary-ink">No completed tasks found</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            {completedTasks.length === 0
              ? 'No collection tasks have been completed yet. When you complete tasks in My Tasks, they will appear here automatically.'
              : 'No completed tasks match your search query or filter settings.'}
          </p>
          {completedTasks.length === 0 ? (
            <Link
              to="/staff/tasks"
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Go to My Tasks
            </Link>
          ) : (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* 5. Reusable Task Details Modal */}
      <TaskDetailsModal task={selectedTask} onClose={() => setSelectedTaskId(null)} />

      {/* 6. Proof Photo Lightbox Modal (Read-Only) */}
      {inspectingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close photo preview"
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setInspectingPhoto(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-preview-title"
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-primary">{inspectingPhoto.task.id}</span>
                <h3 id="photo-preview-title" className="text-lg font-bold text-primary-ink">
                  {inspectingPhoto.task.name}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Location: <span className="font-medium text-gray-700">{inspectingPhoto.task.location}</span>
                  {inspectingPhoto.task.completedAt && (
                    <span> · Completed at: {inspectingPhoto.task.completedAt}</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingPhoto(null)}
                aria-label="Close preview"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-black">
              <img
                src={inspectingPhoto.photoUrl}
                alt="Verified completion proof"
                className="max-h-[60vh] w-full object-contain"
              />
            </div>

            {inspectingPhoto.task.remarks && (
              <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-800">
                <span className="font-semibold text-gray-700">Completion Remarks: </span>
                <span>{inspectingPhoto.task.remarks}</span>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingPhoto(null)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskHistoryPage
