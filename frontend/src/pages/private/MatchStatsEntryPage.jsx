import { useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMatch, listPlayers, getMatchStats, upsertStats } from '../../api/coach'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

const SECTIONS = [
  {
    label: 'General',
    fields: [
      { key: 'minutesPlayed', label: 'Min',   width: 'w-14', type: 'int' },
      { key: 'saves',         label: 'Saves', width: 'w-14', type: 'int' },
      { key: 'cleanSheet',    label: 'CS',                   type: 'bool' },
    ],
  },
  {
    label: 'Shooting',
    fields: [
      { key: 'goals',         label: 'Goals',   width: 'w-14', type: 'int' },
      { key: 'shots',         label: 'Shots',   width: 'w-14', type: 'int' },
      { key: 'shotsOnTarget', label: 'SoT',     width: 'w-14', type: 'int' },
    ],
  },
  {
    label: 'Passing',
    fields: [
      { key: 'assists',          label: 'Assists',       width: 'w-14', type: 'int' },
      { key: 'successfulPasses', label: 'Passes',        width: 'w-14', type: 'int' },
      { key: 'accurateLongBalls',label: 'Long balls',    width: 'w-14', type: 'int' },
      { key: 'chancesCreated',   label: 'Chances',       width: 'w-14', type: 'int' },
      { key: 'successfulCrosses',label: 'Crosses',       width: 'w-14', type: 'int' },
    ],
  },
  {
    label: 'Possession',
    fields: [
      { key: 'successfulDribbles', label: 'Dribbles',    width: 'w-14', type: 'int' },
      { key: 'duelsWon',           label: 'Duels won',   width: 'w-14', type: 'int' },
      { key: 'dispossessed',       label: 'Dispossessed',width: 'w-14', type: 'int' },
      { key: 'foulsWon',           label: 'Fouls won',   width: 'w-14', type: 'int' },
    ],
  },
  {
    label: 'Defending',
    fields: [
      { key: 'tackles',       label: 'Tackles',       width: 'w-14', type: 'int' },
      { key: 'interceptions', label: 'Interceptions', width: 'w-14', type: 'int' },
      { key: 'foulsCommitted',label: 'Fouls',         width: 'w-14', type: 'int' },
      { key: 'blockedShots',  label: 'Blk shots',     width: 'w-14', type: 'int' },
      { key: 'clearances',    label: 'Clearances',    width: 'w-14', type: 'int' },
      { key: 'goalsConceded', label: 'Goals conceded',width: 'w-14', type: 'int' },
    ],
  },
  {
    label: 'Discipline',
    fields: [
      { key: 'yellowCards', label: 'Yellow', width: 'w-14', type: 'int' },
      { key: 'redCards',    label: 'Red',    width: 'w-14', type: 'int' },
    ],
  },
  {
    label: 'Advanced',
    fields: [
      { key: 'xg',              label: 'xG', width: 'w-16', type: 'dec' },
      { key: 'xa',              label: 'xA', width: 'w-16', type: 'dec' },
      { key: 'xt',              label: 'xT', width: 'w-16', type: 'dec' },
      { key: 'dangerPrevented', label: 'DP', width: 'w-16', type: 'dec' },
    ],
  },
]

const ALL_KEYS = SECTIONS.flatMap((s) => s.fields.map((f) => f.key))

function emptyRow() {
  return Object.fromEntries(ALL_KEYS.map((k) => [k, k === 'cleanSheet' ? false : '']))
}

function fromExisting(s) {
  if (!s) return emptyRow()
  return Object.fromEntries(ALL_KEYS.map((k) => {
    if (k === 'cleanSheet') return [k, s.cleanSheet ?? false]
    return [k, s[k] ?? '']
  }))
}

function toPayload(form) {
  const payload = {}
  ALL_KEYS.forEach((key) => {
    const field = SECTIONS.flatMap((s) => s.fields).find((f) => f.key === key)
    if (!field) return
    if (field.type === 'bool') {
      payload[key] = form[key]
    } else if (form[key] !== '') {
      payload[key] = Number(form[key])
    }
  })
  return payload
}

export default function MatchStatsEntryPage() {
  const { matchId } = useParams()
  const { hasRole } = useAuth()
  const isParent = hasRole('ROLE_PARENT') && !hasRole('ROLE_COACH') && !hasRole('ROLE_ADMIN') && !hasRole('ROLE_DIRECTOR')

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
            {isParent
              ? 'This match has been finalized. Stats can no longer be edited.'
              : 'Match is finalized. Stats are locked.'}
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
      {/* Player header */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
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
          {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
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

      {/* Sections */}
      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {section.label}
            </p>
            <div className="flex flex-wrap gap-3 items-end">
              {section.fields.map(({ key, label, width, type }) => (
                type === 'bool' ? (
                  <label key={key} className="flex flex-col gap-1 items-center">
                    <span className="text-xs font-medium text-gray-500">{label}</span>
                    <input
                      type="checkbox"
                      name={key}
                      checked={form[key]}
                      onChange={handleChange}
                      disabled={finalized}
                      className="w-5 h-5 accent-green-600 mt-1"
                    />
                  </label>
                ) : (
                  <label key={key} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-500">{label}</span>
                    <input
                      type="number"
                      name={key}
                      min="0"
                      step={type === 'dec' ? '0.01' : '1'}
                      value={form[key]}
                      onChange={handleChange}
                      disabled={finalized}
                      className={`${width} border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-400`}
                    />
                  </label>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
