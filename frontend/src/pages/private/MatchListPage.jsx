import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listMatches, createMatch, listTeams, listSeasons, listCompetitions } from '../../api/coach'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'
import FormError from '../../components/FormError'

const STATUS_TABS = ['All', 'Upcoming', 'Pending', 'Finalized']

const STATUS_STYLE = {
  Upcoming:  'bg-mig-success/10 text-mig-success border border-mig-success/20',
  Pending:   'bg-mig-warning/10 text-mig-warning border border-mig-warning/20',
  Finalized: 'bg-mig-card text-mig-dim border border-mig-border',
}

function matchStatus(match) {
  const past = new Date(match.matchDateTime) < new Date()
  if (match.finalized) return 'Finalized'
  if (past) return 'Pending'
  return 'Upcoming'
}

function NewMatchModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    teamId: '', seasonId: '', competitionId: '',
    opponent: '', matchDateTime: '', location: '', homeAway: 'HOME',
  })
  const [competitionState, setCompetitionState] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const teamsFetcher = useCallback(() => listTeams(), [])
  const seasonsFetcher = useCallback(() => listSeasons(), [])
  const competitionsFetcher = useCallback(() => listCompetitions(competitionState || undefined), [competitionState])

  const { data: teams } = useFetch(teamsFetcher)
  const { data: seasons } = useFetch(seasonsFetcher)
  const { data: competitions } = useFetch(competitionsFetcher, [competitionState])

  const noSeasons = (seasons ?? []).length === 0
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        teamId: Number(form.teamId),
        seasonId: Number(form.seasonId),
        seasonPhaseId: null,
        competitionId: form.competitionId ? Number(form.competitionId) : null,
        opponent: form.opponent,
        matchDateTime: new Date(form.matchDateTime).toISOString(),
        location: form.location || null,
        homeAway: form.homeAway,
      }
      const created = await createMatch(payload)
      onCreated(created)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create match.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full bg-mig-bg border border-mig-border text-mig-text placeholder-mig-dim rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mig-orange/40 focus:border-mig-orange transition-colors"

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-mig-surface border border-mig-border rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-mig-border">
          <h2 className="text-lg font-semibold text-mig-text">New Match</h2>
          <button onClick={onClose} className="text-mig-muted hover:text-mig-text transition-colors text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {noSeasons && (
            <div className="bg-mig-warning/10 border border-mig-warning/20 rounded-lg px-3 py-2 text-mig-warning text-sm">
              Please create a season before adding matches.{' '}
              <button type="button" onClick={onClose} className="underline">Go back to dashboard.</button>
            </div>
          )}

          <FormError message={error} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-mig-muted mb-1">Team *</label>
              <select value={form.teamId} onChange={set('teamId')} required className={inputCls}>
                <option value="">Select team…</option>
                {(teams ?? []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-mig-muted mb-1">Home / Away *</label>
              <select value={form.homeAway} onChange={set('homeAway')} required className={inputCls}>
                <option value="HOME">Home</option>
                <option value="AWAY">Away</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-mig-muted mb-1">Opponent *</label>
            <input type="text" value={form.opponent} onChange={set('opponent')} required
              placeholder="e.g. Bay United FC" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-mig-muted mb-1">Date &amp; Time *</label>
            <input type="datetime-local" value={form.matchDateTime} onChange={set('matchDateTime')} required className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-mig-muted mb-1">Location</label>
            <input type="text" value={form.location} onChange={set('location')}
              placeholder="e.g. Silver Lake Sports Complex – Field 1" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-mig-muted mb-1">Season *</label>
            <select value={form.seasonId} onChange={set('seasonId')} required className={inputCls}>
              <option value="">Select season…</option>
              {(seasons ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-mig-muted mb-1">Filter by state</label>
              <select value={competitionState}
                onChange={(e) => { setCompetitionState(e.target.value); set('competitionId')({ target: { value: '' } }) }}
                className={inputCls}>
                <option value="">National / All</option>
                <option value="NJ">New Jersey</option>
                <option value="NY">New York</option>
                <option value="PA">Pennsylvania</option>
                <option value="CT">Connecticut</option>
                <option value="VA">Virginia</option>
                <option value="FL">Florida</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-mig-muted mb-1">Competition</label>
              <select value={form.competitionId} onChange={set('competitionId')} className={inputCls}>
                <option value="">Friendly / None</option>
                {(competitions ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.compSeason ? ` · ${c.compSeason}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm border border-mig-border text-mig-muted hover:text-mig-text hover:border-mig-orange/30 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving || noSeasons}
              className="px-4 py-2 text-sm bg-mig-orange hover:bg-mig-orange-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
              {saving ? 'Creating…' : 'Create Match'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MatchListPage() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [seasonFilter, setSeasonFilter] = useState('')
  const [competitionFilter, setCompetitionFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()
  const canCreateMatch = user?.role !== 'PARENT'

  const fetcher = useCallback(() => listMatches(), [])
  const { data: matches, loading, error } = useFetch(fetcher)
  const [localMatches, setLocalMatches] = useState(null)

  const allMatches = localMatches ?? matches ?? []

  const uniqueSeasons = [...new Map(
    allMatches.filter((m) => m.seasonId).map((m) => [m.seasonId, { id: m.seasonId, name: m.seasonName }])
  ).values()]

  const uniqueCompetitions = [...new Map(
    allMatches.filter((m) => m.competitionId).map((m) => [m.competitionId, { id: m.competitionId, name: m.competitionName }])
  ).values()]

  const sorted = [...allMatches].sort((a, b) => new Date(b.matchDateTime) - new Date(a.matchDateTime))

  const visible = sorted
    .filter((m) => statusFilter === 'All' || matchStatus(m) === statusFilter)
    .filter((m) => !seasonFilter || String(m.seasonId) === seasonFilter)
    .filter((m) => !competitionFilter || String(m.competitionId) === competitionFilter)

  const handleCreated = (newMatch) => {
    setShowModal(false)
    navigate(`/matches/${newMatch.id}`)
  }

  const selectCls = "bg-mig-bg border border-mig-border text-mig-text rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-mig-orange/40 focus:border-mig-orange transition-colors"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight text-mig-text">Matches</h1>
        {canCreateMatch && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-mig-orange hover:bg-mig-orange-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + New Match
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-mig-border">
        {STATUS_TABS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              statusFilter === f
                ? 'border-mig-orange text-mig-orange'
                : 'border-transparent text-mig-muted hover:text-mig-text'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Season + Competition filters */}
      {(uniqueSeasons.length > 0 || uniqueCompetitions.length > 0) && (
        <div className="flex gap-3 flex-wrap">
          {uniqueSeasons.length > 0 && (
            <select
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
              className={selectCls}
            >
              <option value="">All Seasons</option>
              {uniqueSeasons.map((s) => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
            </select>
          )}
          {uniqueCompetitions.length > 0 && (
            <select
              value={competitionFilter}
              onChange={(e) => setCompetitionFilter(e.target.value)}
              className={selectCls}
            >
              <option value="">All Competitions</option>
              {uniqueCompetitions.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          )}
          {(seasonFilter || competitionFilter) && (
            <button
              onClick={() => { setSeasonFilter(''); setCompetitionFilter('') }}
              className="text-sm text-mig-muted hover:text-mig-text underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {loading && <Spinner label="Loading matches…" />}
      {error && <ErrorAlert message={error} />}

      {!loading && !error && visible.length === 0 && (
        <p className="text-mig-muted text-sm">No matches found.</p>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="bg-mig-surface border border-mig-border rounded-xl overflow-hidden divide-y divide-mig-border">
          {visible.map((m) => {
            const status = matchStatus(m)
            const date = new Date(m.matchDateTime)
            const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
            const score = m.homeScore != null && m.awayScore != null ? `${m.homeScore}–${m.awayScore}` : null

            const meta = [
              m.seasonName,
              m.competitionName,
              m.location,
            ].filter(Boolean).join(' · ')

            return (
              <Link
                key={m.id}
                to={`/matches/${m.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-mig-card transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-mig-text truncate">
                    {m.teamName} vs {m.opponent}
                  </p>
                  <p className="text-xs text-mig-dim mt-0.5">
                    {dateStr} · {timeStr}{meta ? ` · ${meta}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {score && <span className="text-sm font-mono font-semibold text-mig-text">{score}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_STYLE[status]}`}>
                    {status}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {showModal && (
        <NewMatchModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
