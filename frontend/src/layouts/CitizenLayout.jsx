import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

const sidebarItems = [
  { label: 'Overview', to: '/citizen', end: true, icon: '🏠' },
  { label: 'Report Garbage', to: '/citizen/report', icon: '🗑️' },
  { label: 'My Complaints', to: '/citizen/complaints', icon: '📋' },
  { label: 'Collection Schedule', to: '/citizen/schedule', icon: '📅' },
  { label: 'Profile', to: '/citizen/profile', icon: '👤' },
  { label: 'Feedback', to: '/citizen/feedback', icon: '💬' },
]

function CitizenLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    setIsSidebarOpen(false)
    // TODO: add real logout logic when authentication is implemented
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
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-lg text-white">
          🌿
        </span>
        <span className="text-xl font-bold text-primary-ink">
          Eco<span className="text-primary">Ware</span>
        </span>
      </Link>

      <p className="px-4 pb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
        Citizen Portal
      </p>

      <nav className="flex-1 space-y-1 px-3">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            onClick={() => setIsSidebarOpen(false)}
            className={linkClasses}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-primary-light hover:text-primary-ink"
        >
          <span aria-hidden="true">🚪</span>
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary-light/40 to-white md:h-screen md:flex-col md:overflow-hidden md:bg-gradient-to-b md:to-white">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-lg p-2 text-primary-ink hover:bg-primary-light"
          aria-label="Open navigation menu"
        >
          <MenuIcon />
        </button>
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-base text-white">
            🌿
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
        <aside className="hidden w-64 shrink-0 border-r border-gray-100 bg-white md:block">
          {sidebar}
        </aside>

        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              aria-label="Close navigation menu"
              className="absolute inset-0 bg-gray-900/40"
              onClick={() => setIsSidebarOpen(false)}
            />
            <aside className="absolute top-0 h-full w-64 border-r border-gray-100 bg-white shadow-lg">
              {sidebar}
            </aside>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function MenuIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export default CitizenLayout
