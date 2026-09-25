import { useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMatch, listPlayers, getMatchStats, upsertStats } from '../../api/coach'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

const ACTIVE_SECTIONS = [
  {
    label: 'Shooting',
    fields: [
      { key: 'goals',         label: 'Goals',         width: 'w-14', type: 'int' },
      { key: 'assists',       label: 'Assists',        width: 'w-14', type: 'int' },
      { key: 'shots',         label: 'Shots',          width: 'w-14', type: 'int' },
      { key: 'shotsOnTarget', label: 'SoT',            width: 'w-14', type: 'int' },
    ],
  },
  {
    label: 'Goalkeeping',
    fields: [
      { key: 'saves',         label: 'Saves',          width: 'w-14', type: 'int' },
      { key: 'goalsConceded', label: 'Goals conceded', width: 'w-14', type: 'int' },
      { key: 'cleanSheet',    label: 'Clean sheet',                    type: 'bool' },
    ],
  },
  {
    label: 'Discipline',
    fields: [
      { key: 'yellowCards', label: 'Yellow', width: 'w-14', type: 'int' },
      { key: 'redCards',    label: 'Red',    width: 'w-14', type: 'int' },
    ],
  },
]

const COMING_SOON_LABELS = ['General', 'Passing', 'Possession', 'Defending', 'Advanced']

// Full field list kept for form state so existing saved values aren't lost
const ALL_FIELD_DEFS = [
  ...ACTIVE_SECTIONS.flatMap((s) => s.fields),
  { key: 'minutesPlayed',      type: 'int' },
  { key: 'successfulPasses',   type: 'int' },
  { key: 'accurateLongBalls',  type: 'int' },
  { key: 'chancesCreated',     type: 'int' },
  { key: 'successfulCrosses',  type: 'int' },
  { key: 'successfulDribbles', type: 'int' },
  { key: 'duelsWon',           type: 'int' },
  { key: 'dispossessed',       type: 'int' },
  { key: 'foulsWon',           type: 'int' },
  { key: 'tackles',            type: 'int' },
  { key: 'interceptions',      type: 'int' },
  { key: 'foulsCommitted',     type: 'int' },
  { key: 'blockedShots',       type: 'int' },
  { key: 'clearances',         type: 'int' },
  { key: 'xg',                 type: 'dec' },
  { key: 'xa',                 type: 'dec' },
  { key: 'xt',                 type: 'dec' },
  { key: 'dangerPrevented',    type: 'dec' },
]

const ALL_KEYS = ALL_FIELD_DEFS.map((f) => f.key)

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
  ALL_FIELD_DEFS.forEach(({ key, type }) => {
    if (type === 'bool') {
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
        <Link to={`/matches/${matchId}`} className="text-xs text-mig-muted hover:text-mig-orange transition-colors font-medium uppercase tracking-wide">← Match</Link>
        <h1 className="text-xl font-bold text-mig-text mt-1">
          {isParent ? 'Match Stats' : 'Stats Entry'} — {match.teamName} vs {match.opponent}
        </h1>
        {(match.finalized || isParent) && (
          <div className="mt-2 text-sm bg-mig-card text-mig-muted border border-mig-border rounded-lg px-3 py-2 inline-block">
            {isParent ? "Viewing your child's stats for this match." : 'Match is finalized. Stats are locked.'}
          </div>
        )}
      </div>

      {roster.length === 0 ? (
        <p className="text-mig-muted text-sm">{isParent ? 'No stats available for this match.' : 'No active players on this team.'}</p>
      ) : (
        <div className="space-y-3">
          {roster.map((player) => (
            <PlayerStatsRow
              key={player.id}
              player={player}
              existing={statsByPlayer[player.id]}
              matchId={matchId}
              finalized={match.finalized}
              isParent={isParent}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PlayerStatsRow({ player, existing, matchId, finalized, isParent }) {
  const [form, setForm] = useState(() => fromExisting(existing))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const readOnly = finalized || isParent

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
    <div className={`bg-mig-surface border rounded-lg p-4 ${saved ? 'border-mig-success/30' : 'border-mig-border'}`}>
      {/* Player header */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Link to={`/players/${player.id}`} className="font-medium text-mig-text hover:text-mig-orange">
            {player.firstName} {player.lastName}
          </Link>
          {player.primaryPosition && (
            <span className="text-xs text-mig-dim">{player.primaryPosition}</span>
          )}
          {player.jerseyNumber != null && (
            <span className="text-xs font-mono bg-mig-card text-mig-muted border border-mig-border px-1.5 py-0.5 rounded">
              #{player.jerseyNumber}
            </span>
          )}
          {existing && <span className="text-xs text-mig-success">✓ has stats</span>}
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-mig-success">Saved</span>}
          {error && <span className="text-xs text-mig-danger font-medium">{error}</span>}
          {!readOnly && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm bg-mig-orange hover:bg-mig-orange-dark text-white font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Active sections */}
      <div className="space-y-4">
        {ACTIVE_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-xs font-semibold text-mig-dim uppercase tracking-wider mb-2">
              {section.label}
            </p>
            <div className="flex flex-wrap gap-3 items-end">
              {section.fields.map(({ key, label, width, type }) => (
                type === 'bool' ? (
                  <label key={key} className="flex flex-col gap-1 items-center">
                    <span className="text-xs font-medium text-mig-muted">{label}</span>
                    <input
                      type="checkbox"
                      name={key}
                      checked={form[key]}
                      onChange={handleChange}
                      disabled={readOnly}
                      className="w-5 h-5 accent-orange-500 mt-1"
                    />
                  </label>
                ) : (
                  <label key={key} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-mig-muted">{label}</span>
                    <input
                      type="number"
                      name={key}
                      min="0"
                      step={type === 'dec' ? '0.01' : '1'}
                      value={form[key]}
                      onChange={handleChange}
                      disabled={readOnly}
                      className={`${width} bg-mig-bg border border-mig-border text-mig-text rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-mig-orange/40 focus:border-mig-orange transition-colors disabled:opacity-50 disabled:text-mig-dim`}
                    />
                  </label>
                )
              ))}
            </div>
          </div>
        ))}

        {/* Coming soon sections — parents see label, coaches see nothing */}
        {isParent && (
          <div className="pt-2 border-t border-mig-border space-y-2">
            {COMING_SOON_LABELS.map((label) => (
              <div key={label} className="flex items-center justify-between">
                <p className="text-xs font-semibold text-mig-dim uppercase tracking-wider">{label}</p>
                <span className="text-xs bg-mig-card text-mig-dim border border-mig-border px-2 py-0.5 rounded font-medium">Coming Soon</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
