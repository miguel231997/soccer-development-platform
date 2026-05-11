import { useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMatch, listPlayers, getMatchStats, upsertStats } from '../../api/coach'
import { useFetch } from '../../hooks/useFetch'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

const INT_FIELDS = [
  { key: 'minutesPlayed', label: 'Min',   width: 'w-14' },
  { key: 'goals',         label: 'G',     width: 'w-12' },
  { key: 'assists',       label: 'A',     width: 'w-12' },
  { key: 'shots',         label: 'Shots', width: 'w-12' },
  { key: 'shotsOnTarget', label: 'SoT',   width: 'w-12' },
  { key: 'saves',         label: 'Saves', width: 'w-12' },
]

const DEC_FIELDS = [
  { key: 'xg',              label: 'xG', width: 'w-14' },
  { key: 'xa',              label: 'xA', width: 'w-14' },
  { key: 'xt',              label: 'xT', width: 'w-14' },
  { key: 'dangerPrevented', label: 'DP', width: 'w-14' },
]

function emptyRow() {
  return {
    minutesPlayed: '', goals: '', assists: '', shots: '',
    shotsOnTarget: '', saves: '', cleanSheet: false,
    xg: '', xa: '', xt: '', dangerPrevented: '',
  }
}

function fromExisting(s) {
  if (!s) return emptyRow()
  return {
    minutesPlayed: s.minutesPlayed ?? '',
    goals: s.goals ?? '',
    assists: s.assists ?? '',
    shots: s.shots ?? '',
    shotsOnTarget: s.shotsOnTarget ?? '',
    saves: s.saves ?? '',
    cleanSheet: s.cleanSheet ?? false,
    xg: s.xg ?? '',
    xa: s.xa ?? '',
    xt: s.xt ?? '',
    dangerPrevented: s.dangerPrevented ?? '',
  }
}

function toPayload(form) {
  const payload = {}
  INT_FIELDS.forEach(({ key }) => {
    if (form[key] !== '') payload[key] = Number(form[key])
  })
  DEC_FIELDS.forEach(({ key }) => {
    if (form[key] !== '') payload[key] = form[key]
  })
  payload.cleanSheet = form.cleanSheet
  return payload
}

export default function MatchStatsEntryPage() {
  const { matchId } = useParams()

  const fetcher = useCallback(
    () => Promise.all([getMatch(matchId), listPlayers(), getMatchStats(matchId)])
         .then(([match, players, stats]) => ({ match, players, stats })),
    [matchId],
  )

  const { data, loading, error } = useFetch(fetcher, [matchId])

  if (loading) return <Spinner label="Loading match…" />
  if (error)   return <ErrorAlert message={error} />

  const { match, players, stats } = data

  const roster = (players ?? []).filter(
    (p) => p.active && p.teams?.some((t) => t.teamId === match.teamId && t.active),
  )
  const statsByPlayer = Object.fromEntries((stats ?? []).map((s) => [s.playerId, s]))

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/matches/${matchId}`} className="text-sm text-gray-400 hover:text-green-700">← Match</Link>
        <h1 className="text-xl font-bold text-gray-800 mt-1">
          Stats Entry — {match.teamName} vs {match.opponent}
        </h1>
        {match.finalized && (
          <div className="mt-2 text-sm bg-gray-100 text-gray-600 rounded px-3 py-2 inline-block">
            Match is finalized. Stats are locked.
          </div>
        )}
      </div>

      {roster.length === 0 ? (
        <p className="text-gray-500 text-sm">No active players on this team.</p>
      ) : (
        <div className="space-y-3">
          {roster.map((player) => (
            <PlayerStatsRow
              key={player.id}
              player={player}
              existing={statsByPlayer[player.id]}
              matchId={matchId}
              finalized={match.finalized}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PlayerStatsRow({ player, existing, matchId, finalized }) {
  const [form, setForm] = useState(() => fromExisting(existing))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSaved(false)
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      await upsertStats(matchId, player.id, toPayload(form))
      setSaved(true)
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`bg-white border rounded-lg p-4 ${saved ? 'border-green-300' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Link to={`/players/${player.id}`} className="font-medium text-gray-800 hover:text-green-700">
            {player.firstName} {player.lastName}
          </Link>
          {player.primaryPosition && (
            <span className="text-xs text-gray-400">{player.primaryPosition}</span>
          )}
          {player.jerseyNumber != null && (
            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              #{player.jerseyNumber}
            </span>
          )}
          {existing && <span className="text-xs text-green-600">✓ has stats</span>}
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600">Saved</span>}
          {error && <span className="text-xs text-red-600">{error}</span>}
          {!finalized && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm bg-green-700 text-white px-3 py-1.5 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        {/* Integer fields */}
        {INT_FIELDS.map(({ key, label, width }) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">{label}</span>
            <input
              type="number"
              name={key}
              min="0"
              value={form[key]}
              onChange={handleChange}
              disabled={finalized}
              className={`${width} border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-400`}
            />
          </label>
        ))}

        {/* Clean sheet */}
        <label className="flex flex-col gap-1 items-center">
          <span className="text-xs font-medium text-gray-500">CS</span>
          <input
            type="checkbox"
            name="cleanSheet"
            checked={form.cleanSheet}
            onChange={handleChange}
            disabled={finalized}
            className="w-5 h-5 accent-green-600 mt-1"
          />
        </label>

        {/* Decimal fields */}
        {DEC_FIELDS.map(({ key, label, width }) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">{label}</span>
            <input
              type="number"
              name={key}
              min="0"
              step="0.01"
              value={form[key]}
              onChange={handleChange}
              disabled={finalized}
              className={`${width} border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-400`}
            />
          </label>
        ))}
      </div>
    </div>
  )
}
