import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { listMyChildren, listMyRegistrationRequests } from '../../api/parent'
import { useFetch } from '../../hooks/useFetch'

export default function ParentDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const childrenFetcher = useCallback(() => listMyChildren(), [])
  const requestsFetcher = useCallback(() => listMyRegistrationRequests(), [])
  const { data: children } = useFetch(childrenFetcher)
  const { data: requests } = useFetch(requestsFetcher)

  const pendingCount = (requests ?? []).filter((r) => r.status === 'PENDING').length

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-mig-text">Parent Portal</h1>
        <p className="text-sm text-mig-muted mt-0.5">Welcome back, {user?.firstName || user?.email}.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NavCard
          onClick={() => navigate('/parent/children')}
          title="My Children"
          subtitle={
            children == null
              ? 'Loading…'
              : children.length === 0
              ? 'No children registered yet'
              : `${children.length} child${children.length !== 1 ? 'ren' : ''} registered`
          }
          badge={pendingCount > 0 ? `${pendingCount} pending` : null}
          icon={<UsersIcon />}
        />
        <NavCard
          onClick={() => navigate('/parent/children/register')}
          title="Register a Child"
          subtitle="Add a child to a team using a team invite code"
          icon={<AddPersonIcon />}
          accent
        />
      </div>

      {children && children.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs text-mig-dim font-semibold uppercase tracking-wider">Quick Access</h2>
          <div className="grid gap-2">
            {children.slice(0, 5).map((child) => (
              <button
                key={child.id}
                onClick={() => navigate(`/parent/children/${child.id}`)}
                className="bg-mig-surface border border-mig-border rounded-lg px-4 py-3 flex items-center gap-3 hover:border-mig-orange/40 transition text-left"
              >
                <div className="w-9 h-9 rounded-full bg-mig-orange/20 flex items-center justify-center text-mig-orange font-bold text-sm shrink-0 overflow-hidden">
                  {child.profileImageUrl
                    ? <img src={child.profileImageUrl} alt="" className="w-full h-full object-cover" />
                    : `${child.firstName?.[0]}${child.lastName?.[0]}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-mig-text text-sm">
                    {child.firstName} {child.lastName}
                  </p>
                  <p className="text-xs text-mig-dim">
                    {child.primaryPosition}
                    {child.teams?.length > 0 && ` · ${child.teams.length} team${child.teams.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <span className="text-mig-dim">›</span>
              </button>
            ))}
            {children.length > 5 && (
              <button onClick={() => navigate('/parent/children')}
                className="text-sm text-mig-orange text-center py-2 hover:underline">
                View all {children.length} children →
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

function NavCard({ onClick, title, subtitle, badge, icon, accent }) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-lg border p-5 space-y-1 hover:shadow-sm transition ${
        accent
          ? 'border-mig-orange/30 bg-mig-orange/5 hover:border-mig-orange/50'
          : 'border-mig-border bg-mig-surface hover:border-mig-orange/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={accent ? 'text-mig-orange' : 'text-mig-muted'}>{icon}</div>
        {badge && (
          <span className="text-xs bg-mig-warning/10 text-mig-warning border border-mig-warning/20 px-2 py-0.5 rounded font-medium">
            {badge}
          </span>
        )}
      </div>
      <p className={`font-semibold ${accent ? 'text-mig-orange' : 'text-mig-text'}`}>{title}</p>
      <p className="text-xs text-mig-muted">{subtitle}</p>
    </button>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  )
}

function AddPersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  )
}
