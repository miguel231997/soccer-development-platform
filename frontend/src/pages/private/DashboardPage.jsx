import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useFetch } from '../../hooks/useFetch'
import { listTeams, listMatches } from '../../api/coach'
import { listRegistrationRequests, approveRegistrationRequest, rejectRegistrationRequest } from '../../api/admin'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

function matchStatus(match) {
  const past = new Date(match.matchDateTime) < new Date()
  if (match.finalized) return { label: 'Finalized', color: 'gray' }
  if (past) return { label: 'Pending', color: 'yellow' }
  return { label: 'Upcoming', color: 'green' }
}

function StatusBadge({ status }) {
  const colors = {
    green:  'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    gray:   'bg-gray-100 text-gray-500',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${colors[status.color]}`}>
      {status.label}
    </span>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  const teamsFetcher = useCallback(() => listTeams(), [])
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
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.firstName || user?.email}.</p>
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

      {/* Teams */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700">My Teams</h2>
          <Link to="/teams" className="text-sm text-green-700 hover:underline">View all →</Link>
        </div>
        {teamsLoading && <Spinner label="Loading teams…" />}
        {teamsError && <ErrorAlert message={teamsError} />}
        {!teamsLoading && !teamsError && (
          teams?.length === 0 ? (
            <p className="text-sm text-gray-500">No teams assigned.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {teams?.map((t) => (
                <Link
                  key={t.id}
                  to={`/teams/${t.id}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-400 hover:shadow-sm transition group"
                >
                  <p className="font-semibold text-gray-800 group-hover:text-green-700">{t.name}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {t.ageGroup && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{t.ageGroup}</span>}
                    {t.gender && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{t.gender}</span>}
                    {t.competitiveLevel && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">{t.competitiveLevel}</span>}
                  </div>
                  {t.clubName && <p className="text-xs text-gray-400 mt-1">{t.clubName}</p>}
                </Link>
              ))}
            </div>
          )
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Upcoming Matches</h2>
          {matchesLoading && <Spinner label="Loading matches…" />}
          {matchesError && <ErrorAlert message={matchesError} />}
          {!matchesLoading && !matchesError && (
            upcoming.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming matches.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((m) => <MatchRow key={m.id} match={m} />)}
              </div>
            )
          )}
        </section>

        {/* Recent */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Recent Matches</h2>
          {matchesLoading && <Spinner label="Loading matches…" />}
          {!matchesLoading && !matchesError && (
            recent.length === 0 ? (
              <p className="text-sm text-gray-500">No recent matches.</p>
            ) : (
              <div className="space-y-2">
                {recent.map((m) => <MatchRow key={m.id} match={m} />)}
              </div>
            )
          )}
        </section>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link to="/teams" className="text-sm bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600">Teams</Link>
        <Link to="/matches" className="text-sm border border-green-700 text-green-700 px-4 py-2 rounded hover:bg-green-50">All Matches</Link>
        <Link to="/players" className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50">Players</Link>
      </div>

      <PendingRegistrationRequests />
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
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Player Registration Requests
        <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">{pending.length} pending</span>
      </h2>
      <div className="bg-white border border-yellow-200 rounded-lg divide-y divide-gray-100">
        {pending.map((r) => (
          <div key={r.id} className="px-4 py-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-sm text-gray-800">{r.firstName} {r.lastName}</p>
              <p className="text-xs text-gray-500">
                {r.teamName} · {r.primaryPosition}{r.jerseyNumber ? ` · #${r.jerseyNumber}` : ''} · DOB: {r.dateOfBirth}
              </p>
              <p className="text-xs text-gray-400">Submitted by {r.parentUserName}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button disabled={acting === r.id} onClick={() => handleApprove(r.id)}
                className="text-xs bg-green-700 text-white px-3 py-1.5 rounded hover:bg-green-600 disabled:opacity-50">
                {acting === r.id ? '…' : 'Approve'}
              </button>
              <button disabled={acting === r.id} onClick={() => setRejectId(r.id)}
                className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-50 disabled:opacity-50">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {rejectId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Reject request</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason (optional)" rows={3}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setRejectId(null); setRejectReason('') }}
                className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50">Cancel</button>
              <button disabled={acting} onClick={handleReject}
                className="text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 disabled:opacity-50">
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
    <div className={`bg-white border rounded-lg p-4 ${warn && value > 0 ? 'border-yellow-300' : 'border-gray-200'}`}>
      <p className={`text-2xl font-bold ${warn && value > 0 ? 'text-yellow-600' : 'text-green-700'}`}>
        {loading ? '…' : value}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
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
      className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-green-400 hover:shadow-sm transition"
    >
      <div className="min-w-0">
        <p className="font-medium text-gray-800 truncate">
          {match.teamName} vs {match.opponent}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{dateStr} · {timeStr}{match.location && ` · ${match.location}`}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {scoreStr && <span className="text-sm font-mono font-semibold text-gray-700">{scoreStr}</span>}
        <StatusBadge status={status} />
      </div>
    </Link>
  )
}
