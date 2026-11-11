import { useEffect, useState } from 'react'
import { Bell, CalendarDays, ClipboardList, History, LayoutDashboard, Leaf, LogOut, Menu, UserRound } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { StaffTaskProvider } from '../context/StaffTaskContext'
import { StaffNotificationProvider } from '../context/StaffNotificationContext'
import { useStaffNotifications } from '../context/useStaffNotifications'

const sidebarItems = [
  { label: 'Dashboard', to: '/staff', end: true, icon: LayoutDashboard },
  { label: 'My Tasks', to: '/staff/tasks', icon: ClipboardList },
  { label: 'Task History', to: '/staff/history', icon: History },
  { label: 'Collection Schedule', to: '/staff/schedule', icon: CalendarDays },
  { label: 'Notifications', to: '/staff/notifications', icon: Bell },
  { label: 'My Profile', to: '/staff/profile', icon: UserRound },
]

function StaffLayoutInner() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { unreadCount } = useStaffNotifications()

  useEffect(() => {
    if (!isSidebarOpen) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsSidebarOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSidebarOpen])

  const handleLogout = () => {
    setIsSidebarOpen(false)
    navigate('/')
  }

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-white shadow-sm'
        : 'text-gray-600 hover:bg-primary-light hover:text-primary-ink'
    }`

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/" className="flex items-center gap-2 px-4 py-5" onClick={() => setIsSidebarOpen(false)}>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
          <Leaf className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-xl font-bold text-primary-ink">
          Eco<span className="text-primary">Ware</span>
        </span>
      </Link>

      <p className="px-4 pb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">Staff Portal</p>

      <nav className="flex-1 space-y-1 px-3" aria-label="Staff">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isNotification = item.to === '/staff/notifications'

          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              onClick={() => setIsSidebarOpen(false)}
              className={linkClasses}
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  {isNotification && unreadCount > 0 && (
                    <span
                      className={`ml-auto inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        isActive ? 'bg-white text-primary' : 'bg-primary text-white'
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-primary-light hover:text-primary-ink"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary-light/40 to-white md:h-screen md:overflow-hidden">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="relative rounded-lg p-2 text-primary-ink hover:bg-primary-light"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
        </div>
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
            <Leaf className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-bold text-primary-ink">
            Eco<span className="text-primary">Ware</span>
          </span>
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary"
        >
          Logout
        </button>
      </header>

      <div className="flex flex-1 md:overflow-hidden">
        <aside className="hidden w-64 shrink-0 border-r border-gray-100 bg-white md:block">{sidebar}</aside>

        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              aria-label="Close navigation menu"
              className="absolute inset-0 bg-gray-900/40"
              onClick={() => setIsSidebarOpen(false)}
            />
            <aside className="absolute top-0 h-full w-64 border-r border-gray-100 bg-white shadow-lg">{sidebar}</aside>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function StaffLayout() {
  return (
    <StaffTaskProvider>
      <StaffNotificationProvider>
        <StaffLayoutInner />
      </StaffNotificationProvider>
    </StaffTaskProvider>
  )
}

export default StaffLayout
