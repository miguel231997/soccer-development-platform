import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ─── Icons ────────────────────────────────────────────────────────────────────

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}
function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  )
}
function CogIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}
function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}
function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}
function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_COACH = [
  { to: '/dashboard', label: 'Dashboard', icon: <GridIcon />,     exact: true  },
  { to: '/players',   label: 'Players',   icon: <UsersIcon />,    exact: false },
  { to: '/teams',     label: 'Teams',     icon: <ShieldIcon />,   exact: false },
  { to: '/matches',   label: 'Matches',   icon: <CalendarIcon />, exact: false },
]

const NAV_PARENT = [
  { to: '/parent',          label: 'Overview',   icon: <GridIcon />,     exact: true  },
  { to: '/parent/children', label: 'My Players', icon: <UsersIcon />,    exact: false },
  { to: '/matches',         label: 'Matches',    icon: <CalendarIcon />, exact: false },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ open, onClose }) {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isCoach  = user && (hasRole('ROLE_COACH') || hasRole('ROLE_ADMIN') || hasRole('ROLE_DIRECTOR'))
  const isAdmin  = user && hasRole('ROLE_ADMIN')
  const isParent = user && hasRole('ROLE_PARENT') && !isCoach

  const navLinks = isCoach ? NAV_COACH : isParent ? NAV_PARENT : []

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname === to || location.pathname.startsWith(to + '/')

  const linkCls = (to, exact) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive(to, exact)
        ? 'bg-mig-orange/10 text-mig-orange'
        : 'text-mig-muted hover:text-mig-text hover:bg-white/5'
    }`

  const handleLogout = () => { logout(); navigate('/'); onClose() }
  const homeHref = user ? (isCoach ? '/dashboard' : isParent ? '/parent' : '/') : '/'

  return (
    <aside
      className={`fixed inset-y-0 left-0 w-60 bg-mig-surface border-r border-mig-border flex flex-col z-50 transition-transform duration-200 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-mig-border shrink-0">
        <Link to={homeHref} onClick={onClose} className="block group">
          <div className="flex items-center gap-2.5 mb-0.5">
            <span className="text-xs font-black bg-mig-orange text-white px-1.5 py-0.5 rounded tracking-wide">IQ</span>
            <span className="text-xl font-black tracking-tight text-mig-text group-hover:text-mig-orange transition-colors">
              PitchIQ
            </span>
          </div>
          <p className="text-xs text-mig-dim font-medium">by MIG Football</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navLinks.map(({ to, label, icon, exact }) => (
          <Link key={to} to={to} onClick={onClose} className={linkCls(to, exact)}>
            <span className="shrink-0">{icon}</span>
            {label}
          </Link>
        ))}

        {isAdmin && (
          <Link to="/admin" onClick={onClose} className={linkCls('/admin', true)}>
            <span className="shrink-0"><CogIcon /></span>
            Admin
          </Link>
        )}

        <div className="pt-3 mt-2 border-t border-mig-border space-y-0.5">
          <Link to="/stats" onClick={onClose} className={linkCls('/stats', false)}>
            <span className="shrink-0"><ChartIcon /></span>
            Leaderboard
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-mig-border shrink-0">
        {user ? (
          <>
            <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-mig-orange/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-mig-orange">
                  {(user.firstName?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-mig-text truncate leading-tight">
                  {user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.email}
                </p>
                <p className="text-xs text-mig-dim leading-tight mt-0.5 capitalize">
                  {user.role?.toLowerCase()}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-mig-muted hover:text-mig-danger hover:bg-mig-danger/5 transition-colors"
            >
              <LogoutIcon /> Sign out
            </button>
          </>
        ) : (
          <div className="space-y-1.5 pb-1">
            <Link to="/login" onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-mig-muted hover:text-mig-text hover:bg-white/5 transition-colors">
              <PersonIcon /> Sign In
            </Link>
            <Link to="/register" onClick={onClose}
              className="flex items-center justify-center py-2 rounded-lg text-sm font-semibold bg-mig-orange hover:bg-mig-orange-dark text-white transition-colors">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-mig-bg flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-30 bg-mig-surface border-b border-mig-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-mig-muted hover:text-mig-text transition-colors"
            aria-label="Open navigation"
          >
            <MenuIcon />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black bg-mig-orange text-white px-1.5 py-0.5 rounded">IQ</span>
            <span className="font-black text-mig-text tracking-tight">PitchIQ</span>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
