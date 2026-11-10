import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BellOff,
  CalendarClock,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  Filter,
  Megaphone,
  PlusCircle,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react'
import FilterSelect from '../../components/citizen/FilterSelect'
import { useStaffNotifications } from '../../context/useStaffNotifications'
import { NOTIFICATION_CATEGORIES } from '../../data/staffNotifications'

const TABS = ['All', 'Unread', 'Read']

function CategoryBadge({ category }) {
  switch (category) {
    case 'New task assigned':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
          <PlusCircle className="h-3 w-3" aria-hidden="true" />
          {category}
        </span>
      )
    case 'Task reminder':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {category}
        </span>
      )
    case 'Collection schedule update':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200/80 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
          <CalendarClock className="h-3 w-3" aria-hidden="true" />
          {category}
        </span>
      )
    case 'Task completion confirmation':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary-dark">
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          {category}
        </span>
      )
    case 'General announcement':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
          <Megaphone className="h-3 w-3" aria-hidden="true" />
          {category}
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          {category}
        </span>
      )
  }
}

function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    dismissNotification,
    resetNotifications,
  } = useStaffNotifications()

  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  const readCount = useMemo(() => {
    return notifications.filter((item) => item.isRead).length
  }, [notifications])

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase()

    return notifications.filter((item) => {
      // Tab filter
      if (activeTab === 'Unread' && item.isRead) return false
      if (activeTab === 'Read' && !item.isRead) return false

      // Category filter
      if (categoryFilter !== 'All Categories' && item.category !== categoryFilter) {
        return false
      }

      // Search query
      if (!query) return true
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.taskId && item.taskId.toLowerCase().includes(query))
      )
    })
  }, [notifications, activeTab, categoryFilter, search])

  const isFiltering = search.trim() !== '' || categoryFilter !== 'All Categories'

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('All Categories')
  }

  const handleNavigateToTask = (notification) => {
    if (!notification.taskId) return
    // Auto-mark as read when navigating to task
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    navigate(`/staff/tasks?taskId=${notification.taskId}`)
  }

  const handleMarkAllRead = () => {
    markAllAsRead()
    showToast('All notifications marked as read.')
  }

  const handleDismiss = (id, title) => {
    dismissNotification(id)
    showToast(`Dismissed: "${title.slice(0, 32)}..."`)
  }

  return (
    <div className="space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-primary-ink px-4 py-3 text-sm font-medium text-white shadow-xl animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header */}
      <header className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <span>Staff Portal</span>
              <span>·</span>
              <span className="text-gray-500">Inbox</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-primary-ink sm:text-3xl">Notifications</h1>
              {unreadCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-bold text-primary-dark">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  {unreadCount} Unread
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  <CheckCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  All caught up
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Stay informed about newly assigned collection tasks, schedule shifts, and depot operational announcements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
              >
                <CheckCheck className="h-4 w-4" aria-hidden="true" />
                Mark All as Read
              </button>
            )}

            {notifications.length === 0 && (
              <button
                type="button"
                onClick={resetNotifications}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 px-3.5 py-2 text-xs font-semibold text-primary-dark transition-colors hover:bg-primary-light"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset Demo Notifications
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Controls, Tabs & Filters */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          {/* Tabs */}
          <nav className="flex gap-2" aria-label="Notification Filters">
            {TABS.map((tab) => {
              const count =
                tab === 'All'
                  ? notifications.length
                  : tab === 'Unread'
                    ? unreadCount
                    : readCount
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-200/70 text-gray-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </nav>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={resetNotifications}
              className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors"
              title="Restore demo notifications"
            >
              Reset to Defaults
            </button>
          )}
        </div>

        {/* Search & Category Filter */}
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[2fr_1fr_auto]">
          <div className="relative md:col-span-2 xl:col-span-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications by title, description, or task ID..."
              aria-label="Search notifications"
              className="block w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3.5 pl-10 text-sm text-gray-800 shadow-sm outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <FilterSelect
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={NOTIFICATION_CATEGORIES}
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

      {/* 3. Notification List or Empty States */}
      {filteredNotifications.length > 0 ? (
        <section className="space-y-3" aria-label="Notifications List">
          {filteredNotifications.map((item) => (
            <article
              key={item.id}
              className={`group relative rounded-2xl border transition-all ${
                item.isRead
                  ? 'border-gray-100 bg-white shadow-sm hover:border-gray-200 hover:shadow-md'
                  : 'border-primary/30 border-l-4 border-l-primary bg-primary-light/10 shadow-sm hover:shadow-md'
              } p-5 sm:p-6`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Left Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryBadge category={item.category} />

                    {/* Unread / Read Indicator */}
                    {!item.isRead ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary-dark">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Unread
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400">
                        <Check className="h-3 w-3" aria-hidden="true" />
                        Read
                      </span>
                    )}

                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{item.time}</span>
                  </div>

                  {/* Title & Description */}
                  <h2
                    className={`text-base sm:text-lg ${
                      item.isRead ? 'font-semibold text-gray-900' : 'font-bold text-primary-ink'
                    }`}
                  >
                    {item.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                    {item.description}
                  </p>

                  {/* 6. Related Task ID Navigation */}
                  {item.taskId && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleNavigateToTask(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-white px-3 py-1.5 text-xs font-semibold text-primary-dark shadow-xs transition-colors hover:bg-primary-light"
                      >
                        <span>Related Task:</span>
                        <span className="font-bold text-primary-ink">{item.taskId}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-start">
                  {!item.isRead ? (
                    <button
                      type="button"
                      onClick={() => markAsRead(item.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:border-primary/40 hover:bg-primary-light hover:text-primary-ink"
                      title="Mark as Read"
                      aria-label="Mark as Read"
                    >
                      <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      <span>Mark Read</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markAsUnread(item.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 shadow-2xs transition-colors hover:bg-gray-100 hover:text-gray-900"
                      title="Mark as Unread"
                      aria-label="Mark as Unread"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
                      <span>Mark Unread</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDismiss(item.id, item.title)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1.5 text-xs font-semibold text-gray-500 shadow-2xs transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                    title="Dismiss notification"
                    aria-label="Dismiss notification"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        /* 10. Empty States */
        <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          {activeTab === 'Unread' && unreadCount === 0 ? (
            <>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
                <CheckCheck className="h-7 w-7 text-primary" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-primary-ink">You&apos;re all caught up!</h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                There are no unread notifications right now. Any newly assigned collection tasks or schedule updates will appear here.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('All')}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                View All Notifications
              </button>
            </>
          ) : isFiltering ? (
            <>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
                <Filter className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-primary-ink">No matching notifications</h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                No notifications match your current search query or category filter.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Clear filters
              </button>
            </>
          ) : notifications.length === 0 ? (
            <>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <BellOff className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-gray-800">Inbox is empty</h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                You have dismissed all your notifications. You can restore the default mock notifications at any time.
              </p>
              <button
                type="button"
                onClick={resetNotifications}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Restore Demo Notifications
              </button>
            </>
          ) : (
            <>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
                <Bell className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-primary-ink">No notifications in this tab</h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Switch back to the &quot;All&quot; tab to view your complete notification history.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('All')}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                View All Notifications
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage

