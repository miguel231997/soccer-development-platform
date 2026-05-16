import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useFetch } from '../../hooks/useFetch'
import { listTeams, listMatches, joinTeamWithCode, listSeasons, createSeason } from '../../api/coach'
import { listRegistrationRequests, approveRegistrationRequest, rejectRegistrationRequest } from '../../api/admin'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'
import FormError from '../../components/FormError'

function matchStatus(match) {
  const past = new Date(match.matchDateTime) < new Date()
  if (match.finalized) return { label: 'Finalized', color: 'gray' }
  if (past) return { label: 'Pending', color: 'yellow' }
  return { label: 'Upcoming', color: 'green' }
}

function StatusBadge({ status }) {
  const colors = {
    green:  'bg-mig-success/10 text-mig-success border border-mig-success/20',
    yellow: 'bg-mig-warning/10 text-mig-warning border border-mig-warning/20',
    gray:   'bg-mig-card text-mig-dim border border-mig-border',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${colors[status.color]}`}>
      {status.label}
    </span>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [teamsKey, setTeamsKey] = useState(0)

  const teamsFetcher = useCallback(() => listTeams(), [teamsKey])
  const matchesFetcher = useCallback(() => listMatches(), [])

  const { data: teams, loading: teamsLoading, error: teamsError } = useFetch(teamsFetcher)
  const { data: allMatches, loading: matchesLoading, error: matchesError } = useFetch(matchesFetcher)

  const now = new Date()
  const upcoming = (allMatches ?? [])
    .filter((m) => !m.finalized && new Date(m.matchDateTime) >= now)
    .sort((a, b) => new Date(a.matchDateTime) - new Date(b.matchDateTime))
    .slice(0, 5)
  const recent = (allMatches ?? [])
    .filter((m) => new Date(m.matchDateTime) < now)
    .sort((a, b) => new Date(b.matchDateTime) - new Date(a.matchDateTime))
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-mig-text">Dashboard</h1>
        <p className="text-mig-muted text-sm mt-1">Welcome back, {user?.firstName || user?.email}.</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="My Teams" value={teams?.length ?? '—'} loading={teamsLoading} />
        <StatCard label="Upcoming Matches" value={upcoming.length} loading={matchesLoading} />
        <StatCard
          label="Pending Review"
          value={(allMatches ?? []).filter((m) => !m.finalized && new Date(m.matchDateTime) < now).length}
          loading={matchesLoading}
          warn
        />
      </div>

      <SeasonSetupSection />

      {/* Teams */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-mig-text">My Teams</h2>
          <div className="flex items-center gap-3">
            {user?.role === 'COACH' && (
              <JoinTeamInline onJoined={() => setTeamsKey((k) => k + 1)} />
            )}
            <Link to="/teams" className="text-sm text-mig-orange hover:underline">View all →</Link>
          </div>
        </div>
        {teamsLoading && <Spinner label="Loading teams…" />}
        {teamsError && <ErrorAlert message={teamsError} />}
        {!teamsLoading && !teamsError && (
          teams?.length === 0 ? (
            <p className="text-sm text-mig-muted">No teams assigned.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {teams?.map((t) => (
                <Link
                  key={t.id}
                  to={`/teams/${t.id}`}
                  className="bg-mig-surface border border-mig-border rounded-lg p-4 hover:border-mig-orange/40 hover:shadow-sm transition group"
                >
                  <p className="font-semibold text-mig-text group-hover:text-mig-orange">{t.name}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {t.ageGroup && <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">{t.ageGroup}</span>}
                    {t.gender && <span className="text-xs bg-mig-card text-mig-dim border border-mig-border px-2 py-0.5 rounded">{t.gender}</span>}
                    {t.competitiveLevel && <span className="text-xs bg-mig-orange/10 text-mig-orange border border-mig-orange/20 px-2 py-0.5 rounded">{t.competitiveLevel}</span>}
                  </div>
                  {t.clubName && <p className="text-xs text-mig-dim mt-1">{t.clubName}</p>}
                </Link>
              ))}
            </div>
          )
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming */}
        <section>
          <h2 className="text-lg font-semibold text-mig-text mb-3">Upcoming Matches</h2>
          {matchesLoading && <Spinner label="Loading matches…" />}
          {matchesError && <ErrorAlert message={matchesError} />}
          {!matchesLoading && !matchesError && (
            upcoming.length === 0 ? (
              <p className="text-sm text-mig-muted">No upcoming matches.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((m) => <MatchRow key={m.id} match={m} />)}
              </div>
            )
          )}
        </section>

        {/* Recent */}
        <section>
          <h2 className="text-lg font-semibold text-mig-text mb-3">Recent Matches</h2>
          {matchesLoading && <Spinner label="Loading matches…" />}
          {!matchesLoading && !matchesError && (
            recent.length === 0 ? (
              <p className="text-sm text-mig-muted">No recent matches.</p>
            ) : (
              <div className="space-y-2">
                {recent.map((m) => <MatchRow key={m.id} match={m} />)}
              </div>
            )
          )}
        </section>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link to="/teams" className="text-sm bg-mig-orange hover:bg-mig-orange-dark text-white px-4 py-2 rounded-lg font-semibold transition-colors">Teams</Link>
        <Link to="/matches" className="text-sm border border-mig-border text-mig-muted hover:text-mig-text hover:border-mig-orange/30 px-4 py-2 rounded-lg transition-colors">All Matches</Link>
        <Link to="/players" className="text-sm border border-mig-border text-mig-muted hover:text-mig-text hover:border-mig-orange/30 px-4 py-2 rounded-lg transition-colors">Players</Link>
      </div>

      <PendingRegistrationRequests />
    </div>
  )
}

const SEASON_YEARS = Array.from({ length: 15 }, (_, i) => {
  const s = 2024 + i
  return `${s}-${s + 1}`
})

function SeasonSetupSection() {
  const { user } = useAuth()
  const canEdit = ['COACH', 'ADMIN', 'DIRECTOR'].includes(user?.role)
  const [seasonsKey, setSeasonsKey] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const seasonsFetcher = useCallback(() => listSeasons(), [seasonsKey])
  const { data: seasons, loading: seasonsLoading } = useFetch(seasonsFetcher, [seasonsKey])

  const [selectedYear, setSelectedYear] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  if (!canEdit) return null

  const flash = (m, isErr = false) => {
    if (isErr) { setErr(m); setTimeout(() => setErr(''), 4000) }
    else { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!selectedYear) return
    setSaving(true); setErr('')
    const [startYear, endYear] = selectedYear.split('-').map(Number)
    try {
      await createSeason({
        name: selectedYear,
        startDate: `${startYear}-08-01`,
        endDate: `${endYear}-07-31`,
        active: (seasons ?? []).length === 0,
      })
      setSeasonsKey((k) => k + 1)
      setSelectedYear('')
      setShowForm(false)
      flash(`${selectedYear} season created.`)
    } catch (error) {
      flash(error?.response?.data?.message || 'Failed to create season.', true)
    } finally { setSaving(false) }
  }

  const existingNames = new Set((seasons ?? []).map((s) => s.name))
  const available = SEASON_YEARS.filter((y) => !existingNames.has(y))

  return (
    <section className="bg-mig-surface border border-mig-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-mig-text">Seasons</h2>
          {!seasonsLoading && (seasons ?? []).length === 0 && (
            <p className="text-xs text-mig-warning mt-0.5">No seasons yet — create one before adding matches.</p>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm bg-mig-orange hover:bg-mig-orange-dark text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
          >
            + New Season
          </button>
        )}
      </div>

      {msg && <p className="text-xs text-mig-success mb-2">{msg}</p>}
      {err && <FormError message={err} />}

      {showForm && (
        <form onSubmit={handleCreate} className="flex items-center gap-2 mb-3">
          <select
            required
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full bg-mig-bg border border-mig-border text-mig-text placeholder-mig-dim rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-mig-orange/40 focus:border-mig-orange transition-colors flex-1"
          >
            <option value="">Select season year…</option>
            {available.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button type="submit" disabled={saving || !selectedYear}
            className="text-sm bg-mig-orange hover:bg-mig-orange-dark text-white px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50 shrink-0">
            {saving ? '…' : 'Create'}
          </button>
          <button type="button" onClick={() => { setShowForm(false); setSelectedYear('') }}
            className="text-sm text-mig-muted hover:text-mig-text transition-colors">
            Cancel
          </button>
        </form>
      )}

      {!seasonsLoading && (seasons ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(seasons ?? []).map((s) => (
            <span key={s.id}
              className={`text-xs px-2 py-1 rounded border ${s.active ? 'bg-mig-orange/10 border-mig-orange/30 text-mig-orange font-medium' : 'bg-mig-card border-mig-border text-mig-dim'}`}>
              {s.name}{s.active ? ' (active)' : ''}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}

function JoinTeamInline({ onJoined }) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      const result = await joinTeamWithCode(code.trim())
      setSuccess(`Joined ${result.teamName}`)
      setCode(''); setOpen(false)
      onJoined()
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid or expired code.')
    } finally { setLoading(false) }
  }

  return (
    <div className="relative">
      {success && (
        <span className="text-xs text-mig-success mr-2">{success}</span>
      )}
      {!open ? (
        <button onClick={() => { setOpen(true); setSuccess('') }}
          className="text-sm border border-mig-border text-mig-muted hover:text-mig-text hover:border-mig-orange/30 px-3 py-1.5 rounded-lg transition-colors">
          + Join a Team
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div>
            <FormError message={error} />
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Team code"
                required
                autoFocus
                className="bg-mig-bg border border-mig-border text-mig-text placeholder-mig-dim rounded-lg px-3 py-1.5 text-sm font-mono w-52 focus:outline-none focus:ring-2 focus:ring-mig-orange/40 focus:border-mig-orange transition-colors"
              />
              <button type="submit" disabled={loading || !code.trim()}
                className="text-sm bg-mig-orange hover:bg-mig-orange-dark text-white px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50">
                {loading ? '…' : 'Join'}
              </button>
              <button type="button" onClick={() => { setOpen(false); setError('') }}
                className="text-mig-muted hover:text-mig-text transition-colors text-xl">×</button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

function PendingRegistrationRequests() {
  const fetcher = useCallback(() => listRegistrationRequests(), [])
  const { data: requests, loading } = useFetch(fetcher)
  const [localUpdates, setLocalUpdates] = useState({})
  const [acting, setActing] = useState(null)
  const [rejectId, setRejectId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const all = (requests ?? []).map((r) => ({ ...r, ...(localUpdates[r.id] ?? {}) }))
  const pending = all.filter((r) => r.status === 'PENDING')

  if (loading || pending.length === 0) return null

  const handleApprove = async (id) => {
    setActing(id)
    try {
      const updated = await approveRegistrationRequest(id)
      setLocalUpdates((p) => ({ ...p, [id]: updated }))
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to approve.')
    } finally { setActing(null) }
  }

  const handleReject = async () => {
    setActing(rejectId)
    try {
      const updated = await rejectRegistrationRequest(rejectId, rejectReason)
      setLocalUpdates((p) => ({ ...p, [rejectId]: updated }))
      setRejectId(null); setRejectReason('')
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to reject.')
    } finally { setActing(null) }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-mig-text mb-3">
        Player Registration Requests
        <span className="ml-2 text-xs bg-mig-warning/10 text-mig-warning border border-mig-warning/20 px-2 py-0.5 rounded font-medium">{pending.length} pending</span>
      </h2>
      <div className="bg-mig-surface border border-mig-warning/20 rounded-lg divide-y divide-mig-border">
        {pending.map((r) => (
          <div key={r.id} className="px-4 py-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-sm text-mig-text">{r.firstName} {r.lastName}</p>
              <p className="text-xs text-mig-muted">
                {r.teamName} · {r.primaryPosition}{r.jerseyNumber ? ` · #${r.jerseyNumber}` : ''} · DOB: {r.dateOfBirth}
              </p>
              <p className="text-xs text-mig-dim">Submitted by {r.parentUserName}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button disabled={acting === r.id} onClick={() => handleApprove(r.id)}
                className="text-xs bg-mig-orange hover:bg-mig-orange-dark text-white px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50">
                {acting === r.id ? '…' : 'Approve'}
              </button>
              <button disabled={acting === r.id} onClick={() => setRejectId(r.id)}
                className="text-xs border border-mig-border text-mig-muted hover:text-mig-text px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {rejectId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-mig-surface border border-mig-border rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-semibold text-mig-text">Reject request</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason (optional)" rows={3}
              className="w-full bg-mig-bg border border-mig-border text-mig-text placeholder-mig-dim rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mig-danger/40 focus:border-mig-danger transition-colors" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setRejectId(null); setRejectReason('') }}
                className="text-sm border border-mig-border text-mig-muted hover:text-mig-text px-4 py-2 rounded-lg transition-colors">Cancel</button>
              <button disabled={acting} onClick={handleReject}
                className="text-sm bg-mig-danger/10 hover:bg-mig-danger/20 text-mig-danger border border-mig-danger/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                {acting ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function StatCard({ label, value, loading, warn }) {
  return (
    <div className={`bg-mig-surface border rounded-lg p-4 ${warn && value > 0 ? 'border-mig-warning/30' : 'border-mig-border'}`}>
      <p className={`text-2xl font-bold ${warn && value > 0 ? 'text-mig-warning' : 'text-mig-orange'}`}>
        {loading ? '…' : value}
      </p>
      <p className="text-xs text-mig-muted mt-0.5">{label}</p>
    </div>
  )
}

function MatchRow({ match }) {
  const status = matchStatus(match)
  const date = new Date(match.matchDateTime)
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  const scoreStr = match.homeScore != null && match.awayScore != null
    ? `${match.homeScore}–${match.awayScore}`
    : null

  return (
    <Link
      to={`/matches/${match.id}`}
      className="flex items-center justify-between bg-mig-surface border border-mig-border rounded-lg px-4 py-3 hover:border-mig-orange/40 hover:shadow-sm transition"
    >
      <div className="min-w-0">
        <p className="font-medium text-mig-text truncate">
          {match.teamName} vs {match.opponent}
        </p>
        <p className="text-xs text-mig-dim mt-0.5">{dateStr} · {timeStr}{match.location && ` · ${match.location}`}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {scoreStr && <span className="text-sm font-mono font-semibold text-mig-text">{scoreStr}</span>}
        <StatusBadge status={status} />
      </div>
    </Link>
  )
}
