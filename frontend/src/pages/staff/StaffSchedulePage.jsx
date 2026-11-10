import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarX2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Hourglass,
  LayoutGrid,
  List,
  MapPin,
  RotateCcw,
  Search,
  Tag,
  Timer,
} from 'lucide-react'
import FilterSelect from '../../components/citizen/FilterSelect'
import { TaskPriorityBadge, TaskStatusBadge } from '../../components/staff/TaskBadges'
import TaskDetailsModal from '../../components/staff/TaskDetailsModal'
import { useStaffTasks } from '../../context/useStaffTasks'
import { staffProfile } from '../../data/staffTasks'

const STATUS_OPTIONS = ['All Statuses', 'Pending', 'In Progress', 'Completed']
const PRIORITY_OPTIONS = ['All Priorities', 'High', 'Medium', 'Low']

// Date Helpers (pure functions)
const formatISODate = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getStartOfWeek = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = (day + 6) % 7 // Monday as start of week (0 for Mon, 6 for Sun)
  d.setDate(d.getDate() - diff)
  return d
}

const addDays = (date, days) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

// Module-level reference for today's session to keep renders pure
const TODAY_REF = new Date()
TODAY_REF.setHours(0, 0, 0, 0)
const TODAY_STR = formatISODate(TODAY_REF)
const FORMATTED_TODAY = TODAY_REF.toLocaleDateString('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function StaffSchedulePage() {
  const { tasks } = useStaffTasks()
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [viewMode, setViewMode] = useState('daily') // 'daily' | 'weekly'
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [priorityFilter, setPriorityFilter] = useState('All Priorities')
  const [selectedTaskId, setSelectedTaskId] = useState(null)

  const todayStr = TODAY_STR
  const selectedDateStr = useMemo(() => formatISODate(selectedDate), [selectedDate])

  // Start of the week for the selected date
  const weekStart = useMemo(() => getStartOfWeek(selectedDate), [selectedDate])

  // Array of 7 days for the current week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  // Overview statistics calculated dynamically from shared tasks
  const scheduleOverview = useMemo(() => {
    const total = tasks.length
    const todayCount = tasks.filter((t) => t.scheduledDate === todayStr).length
    const upcomingCount = tasks.filter((t) => t.scheduledDate > todayStr).length
    const completedCount = tasks.filter((t) => t.status === 'Completed').length

    return {
      total,
      todayCount,
      upcomingCount,
      completedCount,
    }
  }, [tasks, todayStr])

  // Daily tasks for the selected date, sorted by scheduled time
  const dailyTasks = useMemo(() => {
    const query = search.trim().toLowerCase()

    return tasks
      .filter((task) => {
        if (task.scheduledDate !== selectedDateStr) return false
        const matchesSearch =
          !query ||
          task.id.toLowerCase().includes(query) ||
          task.name.toLowerCase().includes(query) ||
          task.location.toLowerCase().includes(query)
        const matchesStatus = statusFilter === 'All Statuses' || task.status === statusFilter
        const matchesPriority = priorityFilter === 'All Priorities' || task.priority === priorityFilter
        return matchesSearch && matchesStatus && matchesPriority
      })
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
  }, [tasks, selectedDateStr, search, statusFilter, priorityFilter])

  // Weekly map: grouping tasks by day of week
  const weeklyTasksMap = useMemo(() => {
    const query = search.trim().toLowerCase()
    const map = {}

    weekDays.forEach((dayDate) => {
      const dateStr = formatISODate(dayDate)
      map[dateStr] = tasks
        .filter((task) => {
          if (task.scheduledDate !== dateStr) return false
          const matchesSearch =
            !query ||
            task.id.toLowerCase().includes(query) ||
            task.name.toLowerCase().includes(query) ||
            task.location.toLowerCase().includes(query)
          const matchesStatus = statusFilter === 'All Statuses' || task.status === statusFilter
          const matchesPriority = priorityFilter === 'All Priorities' || task.priority === priorityFilter
          return matchesSearch && matchesStatus && matchesPriority
        })
        .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
    })

    return map
  }, [tasks, weekDays, search, statusFilter, priorityFilter])

  const isTodaySelected = selectedDateStr === todayStr
  const isFiltering = search.trim() !== '' || statusFilter !== 'All Statuses' || priorityFilter !== 'All Priorities'

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All Statuses')
    setPriorityFilter('All Priorities')
  }

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'daily') {
      setSelectedDate((prev) => addDays(prev, -1))
    } else {
      setSelectedDate((prev) => addDays(prev, -7))
    }
  }

  const handleNext = () => {
    if (viewMode === 'daily') {
      setSelectedDate((prev) => addDays(prev, 1))
    } else {
      setSelectedDate((prev) => addDays(prev, 7))
    }
  }

  const handleGoToday = () => {
    setSelectedDate(new Date())
  }

  const dailyLabel = selectedDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const weekRangeLabel = `${weekDays[0].toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })} – ${weekDays[6].toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`

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
            <h1 className="mt-1 text-2xl font-bold text-primary-ink sm:text-3xl">Collection Schedule</h1>
            <p className="mt-1 text-sm text-gray-600 sm:text-base">
              Assigned collection timetable, scheduled rounds, and route calendar for your ward.
            </p>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary-light/40 px-4 py-2.5 text-xs">
            <CalendarIcon className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold text-primary-ink">Today</p>
              <p className="text-gray-600">{FORMATTED_TODAY}</p>
            </div>
          </div>
        </div>

        {/* 2. Schedule Overview Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-600 uppercase">
              <ClipboardList className="h-4 w-4 text-primary" aria-hidden="true" />
              Total Scheduled
            </dt>
            <dd className="mt-2 text-2xl font-bold text-primary-ink">{scheduleOverview.total}</dd>
            <p className="mt-0.5 text-[11px] text-gray-500">All assigned rounds</p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary-light/50 p-4">
            <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-primary-dark uppercase">
              <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
              Today's Tasks
            </dt>
            <dd className="mt-2 text-2xl font-bold text-primary-ink">{scheduleOverview.todayCount}</dd>
            <p className="mt-0.5 text-[11px] text-gray-500">Scheduled for today</p>
          </div>

          <div className="rounded-xl border border-blue-200/60 bg-blue-50/60 p-4">
            <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-blue-900 uppercase">
              <Hourglass className="h-4 w-4 text-blue-600" aria-hidden="true" />
              Upcoming
            </dt>
            <dd className="mt-2 text-2xl font-bold text-blue-950">{scheduleOverview.upcomingCount}</dd>
            <p className="mt-0.5 text-[11px] text-gray-500">Later this week</p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary-light/50 p-4">
            <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-primary-dark uppercase">
              <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
              Completed
            </dt>
            <dd className="mt-2 text-2xl font-bold text-primary-ink">{scheduleOverview.completedCount}</dd>
            <p className="mt-0.5 text-[11px] text-gray-500">Finished rounds</p>
          </div>
        </div>
      </header>

      {/* 3. View Switcher & Navigation Controls */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
          {/* Daily vs Weekly Toggle */}
          <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'daily'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-3.5 w-3.5" aria-hidden="true" />
              Daily View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'weekly'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              Weekly View
            </button>
          </div>

          {/* Date Navigator Bar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary-ink"
              aria-label={viewMode === 'daily' ? 'Previous day' : 'Previous week'}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handleGoToday}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary-dark transition-colors hover:bg-primary-light"
            >
              <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Today
            </button>

            <div className="min-w-[190px] text-center text-xs font-bold text-primary-ink">
              {viewMode === 'daily' ? (
                <div className="flex items-center justify-center gap-1.5">
                  <span>{dailyLabel}</span>
                  {isTodaySelected && (
                    <span className="rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-semibold text-primary-dark">
                      Today
                    </span>
                  )}
                </div>
              ) : (
                <span>{weekRangeLabel}</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary-ink"
              aria-label={viewMode === 'daily' ? 'Next day' : 'Next week'}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 5. Filtering Bar */}
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_auto]">
          <div className="relative md:col-span-2 xl:col-span-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by task name, ID, or location"
              aria-label="Search schedule"
              className="block w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3.5 pl-10 text-sm text-gray-800 shadow-sm outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
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
              Reset
            </button>
          )}
        </div>
      </section>

      {/* 4. Schedule Details Presentation */}
      {viewMode === 'daily' ? (
        /* DAILY VIEW */
        <section aria-label="Daily Scheduled Tasks">
          {dailyTasks.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span>
                  Showing {dailyTasks.length} {dailyTasks.length === 1 ? 'task' : 'tasks'} for {dailyLabel}
                </span>
                <span>Ordered by scheduled time</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dailyTasks.map((task) => (
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
                          <TaskStatusBadge status={task.status} />
                        </div>
                      </div>

                      {/* Task Name */}
                      <h3 className="mt-2 text-base font-bold text-gray-900">{task.name}</h3>

                      {/* Details Grid */}
                      <dl className="mt-3 space-y-1.5 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                          <span className="truncate font-medium text-gray-700">{task.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                          <span>
                            Time: <strong className="text-gray-800">{task.scheduledTime}</strong>
                          </span>
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

                      {/* Instructions snippet */}
                      <div className="mt-3 rounded-lg bg-gray-50 p-2.5 text-xs text-gray-600 border border-gray-100 line-clamp-2">
                        {task.instructions}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex items-center justify-between gap-2 border-t border-gray-100 pt-4">
                      <button
                        type="button"
                        onClick={() => setSelectedTaskId(task.id)}
                        className="text-xs font-semibold text-primary transition-colors hover:text-primary-dark"
                      >
                        View Details
                      </button>

                      <Link
                        to="/staff/tasks"
                        className="inline-flex items-center gap-1 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary-dark transition-colors hover:bg-primary-light"
                      >
                        Manage in Tasks →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            /* 7. Empty State for Daily View */
            <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
                <CalendarX2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-primary-ink">
                No collections scheduled for this date
              </h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                {isFiltering
                  ? 'No scheduled tasks match your search or filter settings on this date.'
                  : `There are no waste collection rounds assigned for ${dailyLabel}.`}
              </p>
              <div className="mt-5 flex items-center gap-3">
                {isFiltering && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Clear filters
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleGoToday}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  Back to Today
                </button>
              </div>
            </div>
          )}
        </section>
      ) : (
        /* WEEKLY VIEW */
        <section aria-label="Weekly Collection Schedule" className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>Weekly schedule for {weekRangeLabel}</span>
            <span>Click any day to jump to its daily view</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {weekDays.map((dayDate) => {
              const dateStr = formatISODate(dayDate)
              const isCurrentDay = dateStr === todayStr
              const isDateActive = dateStr === selectedDateStr
              const dayTasks = weeklyTasksMap[dateStr] || []

              const dayName = dayDate.toLocaleDateString('en-IN', { weekday: 'short' })
              const dateNum = dayDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

              return (
                <div
                  key={dateStr}
                  className={`flex flex-col rounded-2xl border p-3.5 transition ${
                    isCurrentDay
                      ? 'border-primary bg-primary-light/20 shadow-sm'
                      : isDateActive
                      ? 'border-primary/50 bg-white'
                      : 'border-gray-100 bg-white shadow-sm hover:border-gray-200'
                  }`}
                >
                  {/* Day Column Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">{dayName}</p>
                      <p className="text-sm font-bold text-primary-ink">{dateNum}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {isCurrentDay && (
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">
                          Today
                        </span>
                      )}
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                        {dayTasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Day Tasks List */}
                  <div className="mt-3 flex-1 space-y-2">
                    {dayTasks.length > 0 ? (
                      dayTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => {
                            setSelectedDate(dayDate)
                            setViewMode('daily')
                          }}
                          className="cursor-pointer rounded-xl border border-gray-100 bg-white p-2.5 text-xs shadow-xs transition hover:border-primary/40 hover:shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-primary-ink text-[11px]">{task.id}</span>
                            <span className="text-[10px] text-gray-500">{task.scheduledTime}</span>
                          </div>
                          <p className="mt-1 font-semibold text-gray-900 truncate">{task.name}</p>
                          <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-primary shrink-0" aria-hidden="true" />
                            {task.location}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <TaskPriorityBadge priority={task.priority} />
                            <TaskStatusBadge status={task.status} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex h-24 items-center justify-center rounded-xl bg-gray-50/50 p-2 text-center text-[11px] text-gray-400">
                        No tasks
                      </div>
                    )}
                  </div>

                  {/* Jump button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(dayDate)
                      setViewMode('daily')
                    }}
                    className="mt-3 w-full rounded-lg border border-gray-100 py-1.5 text-center text-[11px] font-semibold text-primary transition-colors hover:bg-primary-light/50"
                  >
                    View Day
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 6. Reusable Task Details Modal */}
      <TaskDetailsModal task={selectedTask} onClose={() => setSelectedTaskId(null)} />
    </div>
  )
}

export default StaffSchedulePage
