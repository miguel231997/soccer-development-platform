import { useCallback, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listMatches, createMatch, listTeams, listSeasons, listSeasonPhases, listCompetitions } from '../../api/coach'
import { useFetch } from '../../hooks/useFetch'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

const FILTERS = ['All', 'Upcoming', 'Pending', 'Finalized']

function matchStatus(match) {
  const past = new Date(match.matchDateTime) < new Date()
  if (match.finalized) return 'Finalized'
  if (past) return 'Pending'
  return 'Upcoming'
}

const STATUS_STYLE = {
  Upcoming:  'bg-green-50 text-green-700',
  Pending:   'bg-yellow-50 text-yellow-700',
  Finalized: 'bg-gray-100 text-gray-500',
}

const EMPTY_FORM = {
  teamId: '', seasonId: '', seasonPhaseId: '', competitionId: '',
  opponent: '', matchDateTime: '', location: '', homeAway: 'HOME',
}

function NewMatchModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [phases, setPhases] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const teamsFetcher = useCallback(() => listTeams(), [])
  const seasonsFetcher = useCallback(() => listSeasons(), [])
  const competitionsFetcher = useCallback(() => listCompetitions(), [])

  const { data: teams } = useFetch(teamsFetcher)
  const { data: seasons } = useFetch(seasonsFetcher)
  const { data: competitions } = useFetch(competitionsFetcher)

  useEffect(() => {
    if (!form.seasonId) { setPhases([]); return }
    listSeasonPhases(form.seasonId).then(setPhases).catch(() => setPhases([]))
  }, [form.seasonId])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        teamId: Number(form.teamId),
        seasonId: Number(form.seasonId),
        seasonPhaseId: form.seasonPhaseId ? Number(form.seasonPhaseId) : null,
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

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">New Match</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team *</label>
              <select value={form.teamId} onChange={set('teamId')} required
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select team…</option>
                {(teams ?? []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Home / Away *</label>
              <select value={form.homeAway} onChange={set('homeAway')} required
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="HOME">Home</option>
                <option value="AWAY">Away</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opponent *</label>
            <input type="text" value={form.opponent} onChange={set('opponent')} required
              placeholder="e.g. Bay United FC"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
            <input type="datetime-local" value={form.matchDateTime} onChange={set('matchDateTime')} required
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" value={form.location} onChange={set('location')}
              placeholder="e.g. Silver Lake Sports Complex – Field 1"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season *</label>
              <select value={form.seasonId} onChange={set('seasonId')} required
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select season…</option>
                {(seasons ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
              <select value={form.seasonPhaseId} onChange={set('seasonPhaseId')}
                disabled={!form.seasonId || phases.length === 0}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50">
                <option value="">None</option>
                {phases.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Competition</label>
            <select value={form.competitionId} onChange={set('competitionId')}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">None</option>
              {(competitions ?? []).map((c) => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-green-700 text-white rounded hover:bg-green-600 disabled:opacity-50">
              {saving ? 'Creating…' : 'Create Match'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MatchListPage() {
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  const fetcher = useCallback(() => listMatches(), [])
  const { data: matches, loading, error, } = useFetch(fetcher)
  const [localMatches, setLocalMatches] = useState(null)

  const allMatches = localMatches ?? matches

  const sorted = [...(allMatches ?? [])].sort(
    (a, b) => new Date(b.matchDateTime) - new Date(a.matchDateTime),
  )
  const visible = filter === 'All' ? sorted : sorted.filter((m) => matchStatus(m) === filter)

  const handleCreated = (newMatch) => {
    setShowModal(false)
    navigate(`/matches/${newMatch.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Matches</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-700 text-white text-sm px-4 py-2 rounded hover:bg-green-600"
        >
          + New Match
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              filter === f
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <Spinner label="Loading matches…" />}
      {error && <ErrorAlert message={error} />}

      {!loading && !error && visible.length === 0 && (
        <p className="text-gray-500 text-sm">No matches found.</p>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
          {visible.map((m) => {
            const status = matchStatus(m)
            const date = new Date(m.matchDateTime)
            const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
            const score = m.homeScore != null && m.awayScore != null ? `${m.homeScore}–${m.awayScore}` : null

            return (
              <Link
                key={m.id}
                to={`/matches/${m.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {m.teamName} vs {m.opponent}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {dateStr} · {timeStr}
                    {m.location && ` · ${m.location}`}
                    {m.competitionName && ` · ${m.competitionName}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {score && <span className="text-sm font-mono font-semibold text-gray-700">{score}</span>}
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
