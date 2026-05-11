import { useCallback, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  listMyChildren,
  getChildStats,
  getChildEvaluations,
  getChildReports,
  listMyRegistrationRequests,
  submitPlayerRegistration,
  joinTeamWithCode,
} from '../../api/parent'
import { useFetch } from '../../hooks/useFetch'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

const POSITIONS = ['GK','CB','LB','RB','LWB','RWB','CDM','CM','CAM','LM','RM','LW','RW','CF','ST']

// ─── Rating display helpers ───────────────────────────────────────────────────

const RATINGS = [
  { key: 'overallRating',        label: 'Overall' },
  { key: 'technicalRating',      label: 'Technical' },
  { key: 'tacticalRating',       label: 'Tactical' },
  { key: 'physicalRating',       label: 'Physical' },
  { key: 'mentalityRating',      label: 'Mentality' },
  { key: 'attackingRating',      label: 'Attacking' },
  { key: 'defendingRating',      label: 'Defending' },
  { key: 'decisionMakingRating', label: 'Decision' },
  { key: 'workRateRating',       label: 'Work Rate' },
]

function ratingColor(v) {
  if (v >= 8) return 'text-green-600'
  if (v >= 5) return 'text-blue-600'
  return 'text-red-500'
}

const STATUS_STYLE = {
  PENDING:  'bg-yellow-50 text-yellow-700',
  APPROVED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
}

// ─── Root page ────────────────────────────────────────────────────────────────

export default function ParentDashboardPage() {
  const { user } = useAuth()
  const [selectedIdx, setSelectedIdx] = useState(0)

  const childrenFetcher = useCallback(() => listMyChildren(), [])
  const requestsFetcher = useCallback(() => listMyRegistrationRequests(), [])

  const { data: children, loading: cLoading, error: cError } = useFetch(childrenFetcher)
  const { data: requests, loading: rLoading } = useFetch(requestsFetcher)

  const selected = children?.[selectedIdx] ?? null

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Children</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome, {user?.firstName || user?.email}.</p>
      </div>

      {cLoading && <Spinner label="Loading children…" />}
      {cError && <ErrorAlert message={cError} />}

      {!cLoading && !cError && children?.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center space-y-2">
          <p className="text-gray-600 font-medium">No linked children found.</p>
          <p className="text-sm text-gray-400">
            Submit a registration request below to link a child to your account.
          </p>
        </div>
      )}

      {!cLoading && !cError && children && children.length > 0 && (
        <>
          {/* Child selector tabs */}
          {children.length > 1 && (
            <div className="flex gap-1 border-b border-gray-200">
              {children.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedIdx(i)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
                    i === selectedIdx
                      ? 'border-green-600 text-green-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {c.firstName} {c.lastName}
                </button>
              ))}
            </div>
          )}

          {selected && <ChildPanel player={selected} />}
        </>
      )}

      {/* Actions */}
      <RegisterChildForm onSubmitted={() => window.location.reload()} />
      <JoinTeamForm onJoined={() => window.location.reload()} />

      {/* Registration requests */}
      <RegistrationRequests requests={requests} loading={rLoading} />
    </div>
  )
}

// ─── Child panel ──────────────────────────────────────────────────────────────

function ChildPanel({ player }) {
  const [tab, setTab] = useState('stats')

  const statsFetcher  = useCallback(() => getChildStats(player.id),       [player.id])
  const evalsFetcher  = useCallback(() => getChildEvaluations(player.id), [player.id])
  const reportsFetcher = useCallback(() => getChildReports(player.id),    [player.id])

  const { data: stats,   loading: sLoading,  error: sError }  = useFetch(statsFetcher,   [player.id])
  const { data: evals,   loading: eLoading,  error: eError }  = useFetch(evalsFetcher,   [player.id])
  const { data: reports, loading: rpLoading, error: rpError } = useFetch(reportsFetcher, [player.id])

  const activeTeam = player.teams?.find((t) => t.active)
  const dob = player.dateOfBirth
    ? new Date(player.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : null

  return (
    <div className="space-y-5">
      {/* Profile card */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex gap-5 items-start">
        <div className="w-16 h-16 rounded-full shrink-0 bg-green-100 flex items-center justify-center text-green-700 text-xl font-bold overflow-hidden">
          {player.profileImageUrl
            ? <img src={player.profileImageUrl} alt="" className="w-full h-full object-cover" />
            : `${player.firstName?.[0]}${player.lastName?.[0]}`}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-gray-800">
              {player.firstName} {player.lastName}
            </h2>
            {player.jerseyNumber != null && (
              <span className="text-sm font-mono bg-green-700 text-white px-2 py-0.5 rounded">
                #{player.jerseyNumber}
              </span>
            )}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
            <InfoPair label="Position" value={player.primaryPosition} />
            {player.secondaryPosition && <InfoPair label="Alt position" value={player.secondaryPosition} />}
            <InfoPair label="Strong foot" value={player.strongFoot} />
            <InfoPair label="Date of birth" value={dob} />
            {activeTeam && <InfoPair label="Team" value={activeTeam.teamName} />}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { id: 'stats',   label: `Stats (${(stats ?? []).length})` },
          { id: 'evals',   label: `Evaluations (${(evals ?? []).length})` },
          { id: 'reports', label: `Reports (${(reports ?? []).length})` },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === id
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Stats */}
      {tab === 'stats' && (
        <StatsTab stats={stats} loading={sLoading} error={sError} />
      )}

      {/* Tab: Evaluations */}
      {tab === 'evals' && (
        <EvalsTab evals={evals} loading={eLoading} error={eError} />
      )}

      {/* Tab: Reports */}
      {tab === 'reports' && (
        <ReportsTab reports={reports} loading={rpLoading} error={rpError} />
      )}
    </div>
  )
}

// ─── Stats tab ────────────────────────────────────────────────────────────────

const STAT_COLS = [
  { key: 'opponent',      label: 'vs' },
  { key: 'minutesPlayed', label: 'Min' },
  { key: 'goals',         label: 'G' },
  { key: 'assists',       label: 'A' },
  { key: 'shots',         label: 'Shots' },
  { key: 'shotsOnTarget', label: 'SoT' },
  { key: 'saves',         label: 'Saves' },
  { key: 'cleanSheet',    label: 'CS' },
  { key: 'xg',            label: 'xG', decimal: true },
]

function StatsTab({ stats, loading, error }) {
  if (loading) return <Spinner label="Loading stats…" />
  if (error)   return <ErrorAlert message={error} />
  if (!stats || stats.length === 0) {
    return <EmptyState>No match statistics recorded yet.</EmptyState>
  }

  const sorted = [...stats].sort((a, b) => new Date(b.matchDateTime) - new Date(a.matchDateTime))

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              {STAT_COLS.map((c) => (
                <th key={c.key} className="px-3 py-2 text-left font-medium">{c.label}</th>
              ))}
              <th className="px-3 py-2 text-left font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                {STAT_COLS.map((c) => (
                  <td key={c.key} className="px-3 py-2 text-gray-700">
                    {c.key === 'cleanSheet'
                      ? (s.cleanSheet ? '✓' : '—')
                      : c.decimal
                        ? Number(s[c.key] ?? 0).toFixed(2)
                        : (s[c.key] ?? '—')}
                  </td>
                ))}
                <td className="px-3 py-2 text-gray-400 text-xs">
                  {s.matchDateTime
                    ? new Date(s.matchDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Evaluations tab ──────────────────────────────────────────────────────────

function EvalsTab({ evals, loading, error }) {
  if (loading) return <Spinner label="Loading evaluations…" />
  if (error)   return <ErrorAlert message={error} />
  if (!evals || evals.length === 0) {
    return <EmptyState>No evaluations available yet.</EmptyState>
  }

  const sorted = [...evals].sort((a, b) => new Date(b.matchDateTime ?? 0) - new Date(a.matchDateTime ?? 0))

  return (
    <div className="space-y-4">
      {sorted.map((ev) => (
        <EvalCard key={ev.id} ev={ev} />
      ))}
    </div>
  )
}

function EvalCard({ ev }) {
  const date = ev.matchDateTime
    ? new Date(ev.matchDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  // Defensive: never render coachOnlyNotes — ParentEvaluationDto doesn't include it,
  // but we explicitly only access the fields we know parents should see.
  const visibleRatings = RATINGS.filter(({ key }) => ev[key] != null)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-medium text-gray-800">vs {ev.opponent}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {date}
            {ev.positionPlayed && ` · played ${ev.positionPlayed}`}
          </p>
        </div>
        {ev.overallRating != null && (
          <div className="text-center">
            <p className={`text-2xl font-bold ${ratingColor(ev.overallRating)}`}>
              {ev.overallRating}
            </p>
            <p className="text-xs text-gray-400">Overall</p>
          </div>
        )}
      </div>

      {/* Rating grid — only detail ratings (skip overall, shown above) */}
      {visibleRatings.filter((r) => r.key !== 'overallRating').length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {visibleRatings
            .filter(({ key }) => key !== 'overallRating')
            .map(({ key, label }) => (
              <div key={key} className="text-center">
                <p className={`text-base font-bold ${ratingColor(ev[key])}`}>{ev[key]}</p>
                <p className="text-xs text-gray-400 leading-tight">{label}</p>
              </div>
            ))}
        </div>
      )}

      {/* Parent-visible notes only */}
      {ev.parentVisibleNotes && (
        <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
          <p className="text-xs font-medium text-gray-400 mb-1">Coach notes</p>
          {ev.parentVisibleNotes}
        </div>
      )}
    </div>
  )
}

// ─── Reports tab ──────────────────────────────────────────────────────────────

function ReportsTab({ reports, loading, error }) {
  if (loading) return <Spinner label="Loading reports…" />
  if (error)   return <ErrorAlert message={error} />

  // Double-check: only show reports that are approved (backend already filters,
  // but we guard the UI as well).
  const approved = (reports ?? []).filter((r) => r.approvedForParent)

  if (approved.length === 0) {
    return <EmptyState>No approved development reports available yet.</EmptyState>
  }

  const sorted = [...approved].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="space-y-4">
      {sorted.map((r) => <ReportCard key={r.id} report={r} />)}
    </div>
  )
}

function ReportCard({ report }) {
  const [open, setOpen] = useState(false)
  const date = report.createdAt
    ? new Date(report.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Report header — always visible */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div>
          <p className="font-medium text-gray-800">{report.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {report.seasonName && `${report.seasonName} · `}{date}
          </p>
        </div>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {/* Fields parents can see — explicitly never rendering coachOnlyAnalysis */}
          {[
            { key: 'strengths',       label: 'Strengths' },
            { key: 'areasToImprove',  label: 'Areas to Improve' },
            { key: 'trainingFocus',   label: 'Training Focus' },
            { key: 'parentSummary',   label: 'Summary' },
          ].map(({ key, label }) =>
            report[key] ? (
              <div key={key}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{report[key]}</p>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}

// ─── Register child form ─────────────────────────────────────────────────────

function RegisterChildForm({ onSubmitted }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    registrationCode: '',
    firstName: '', lastName: '', dateOfBirth: '',
    primaryPosition: '', secondaryPosition: '', strongFoot: 'RIGHT', jerseyNumber: '',
  })

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setSaving(true)
    try {
      // Code identifies the team and joins the parent to it in one step
      const { teamId } = await joinTeamWithCode(form.registrationCode.trim())
      await submitPlayerRegistration({
        teamId,
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        primaryPosition: form.primaryPosition,
        secondaryPosition: form.secondaryPosition || null,
        strongFoot: form.strongFoot || null,
        jerseyNumber: form.jerseyNumber ? Number(form.jerseyNumber) : null,
      })
      setSuccess(`Registration request for ${form.firstName} ${form.lastName} submitted! The coach will review it shortly.`)
      setForm({ registrationCode: '', firstName: '', lastName: '', dateOfBirth: '', primaryPosition: '', secondaryPosition: '', strongFoot: 'RIGHT', jerseyNumber: '' })
      setOpen(false)
      onSubmitted()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit — check the registration code and try again.')
    } finally { setSaving(false) }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Register a Child</h2>
        <button onClick={() => { setOpen((o) => !o); setError('') }}
          className="text-sm bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600">
          {open ? 'Cancel' : '+ Register Child'}
        </button>
      </div>

      {success && <p className="text-green-700 bg-green-50 border border-green-200 rounded p-3 text-sm">{success}</p>}

      {open && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <p className="text-sm text-gray-500">
            Enter the team registration code your club provided, then fill in your child's details.
            The coach will review and approve the request to create your child's player profile.
          </p>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Team code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team registration code *</label>
              <input
                type="text"
                value={form.registrationCode}
                onChange={(e) => setForm((p) => ({ ...p, registrationCode: e.target.value.toUpperCase() }))}
                required
                placeholder="e.g. SLSA-PARENT-2025"
                className="w-full border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">Ask your club administrator for this code.</p>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
                <input type="text" value={form.firstName} onChange={set('firstName')} required
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
                <input type="text" value={form.lastName} onChange={set('lastName')} required
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            {/* DOB + Jersey */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth *</label>
                <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} required
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jersey number</label>
                <input type="number" min="1" max="99" value={form.jerseyNumber} onChange={set('jerseyNumber')}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            {/* Position + foot */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary position *</label>
                <select value={form.primaryPosition} onChange={set('primaryPosition')} required
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">—</option>
                  {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary position</label>
                <select value={form.secondaryPosition} onChange={set('secondaryPosition')}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">—</option>
                  {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Strong foot</label>
                <select value={form.strongFoot} onChange={set('strongFoot')}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="RIGHT">Right</option>
                  <option value="LEFT">Left</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-green-700 text-white text-sm px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50">
                {saving ? 'Submitting…' : 'Submit Request'}
              </button>
              <button type="button" onClick={() => setOpen(false)}
                className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

// ─── Join another team form ───────────────────────────────────────────────────
// For parents whose child is already registered and plays on a second team.
// Entering the code joins the parent to that team so they can then register
// the child there (or track an already-enrolled child).

function JoinTeamForm({ onJoined }) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setSaving(true)
    try {
      const { teamName } = await joinTeamWithCode(code.trim())
      setSuccess(`Joined ${teamName}. You can now register a child for that team.`)
      setCode(''); setOpen(false); onJoined()
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid or expired code.')
    } finally { setSaving(false) }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Join Another Team</h2>
          <p className="text-xs text-gray-400">Child on a second team? Enter that team's parent code first.</p>
        </div>
        <button onClick={() => { setOpen((o) => !o); setError('') }}
          className="text-sm border border-green-700 text-green-700 px-4 py-2 rounded hover:bg-green-50">
          {open ? 'Cancel' : 'Enter Code'}
        </button>
      </div>

      {success && <p className="text-green-700 bg-green-50 border border-green-200 rounded p-3 text-sm">{success}</p>}

      {open && (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-sm text-gray-500 mb-4">
            Get a parent registration code from the second team's administrator.
            This won't create a new account — it just links you to that team so you can register your child there.
          </p>
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SLSA-PARENT-2025"
              required
              className="flex-1 border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button type="submit" disabled={saving || !code.trim()}
              className="bg-green-700 text-white text-sm px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50">
              {saving ? 'Joining…' : 'Join'}
            </button>
          </form>
        </div>
      )}
    </section>
  )
}

// ─── Registration requests section ───────────────────────────────────────────

function RegistrationRequests({ requests, loading }) {
  if (loading) return null
  if (!requests || requests.length === 0) return null

  const sorted = [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-700">Registration Requests</h2>
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {sorted.map((req) => (
          <div key={req.id} className="px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-gray-800">{req.firstName} {req.lastName}</p>
              <p className="text-xs text-gray-400">
                {req.teamName}
                {req.primaryPosition && ` · ${req.primaryPosition}`}
                {req.jerseyNumber && ` · #${req.jerseyNumber}`}
              </p>
              {req.rejectionReason && (
                <p className="text-xs text-red-500 mt-0.5">Reason: {req.rejectionReason}</p>
              )}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${STATUS_STYLE[req.status] ?? 'bg-gray-100 text-gray-500'}`}>
              {req.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function InfoPair({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-1 text-sm">
      <span className="text-gray-400">{label}:</span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
  )
}

function EmptyState({ children }) {
  return (
    <div className="text-center py-10 text-gray-400 text-sm">{children}</div>
  )
}
