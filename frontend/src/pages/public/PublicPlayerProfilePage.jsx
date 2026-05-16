import { useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublicPlayer, getPublicPlayerSeasonStats } from '../../api/public'
import { useFetch } from '../../hooks/useFetch'
import PlayerSeasonStatsTab from '../../components/PlayerSeasonStatsTab'

const STAT_ROWS = [
  { key: 'appearances',     label: 'Appearances' },
  { key: 'minutesPlayed',   label: 'Minutes Played' },
  { key: 'goals',           label: 'Goals' },
  { key: 'assists',         label: 'Assists' },
  { key: 'shots',           label: 'Shots' },
  { key: 'shotsOnTarget',   label: 'Shots on Target' },
  { key: 'saves',           label: 'Saves' },
  { key: 'cleanSheets',     label: 'Clean Sheets' },
  { key: 'xg',              label: 'xG',               decimal: true },
  { key: 'xa',              label: 'xA',               decimal: true },
  { key: 'xt',              label: 'xT',               decimal: true },
  { key: 'dangerPrevented', label: 'Danger Prevented', decimal: true },
]

export default function PublicPlayerProfilePage() {
  const { playerId } = useParams()
  const [tab, setTab] = useState('overview')

  const fetcher       = useCallback(() => getPublicPlayer(playerId), [playerId])
  const statsFetcher  = useCallback(() => getPublicPlayerSeasonStats(playerId), [playerId])
  const { data: player,      loading,    error }      = useFetch(fetcher,      [playerId])
  const { data: seasonStats, loading: sLoading, error: sError } = useFetch(statsFetcher, [playerId])

  if (loading) return <PageSpinner />
  if (error)   return <ErrorBanner message={error} />

  const fullName = `${player.firstName} ${player.lastName}`

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-mig-surface border border-mig-border rounded-lg p-6 flex gap-6 items-start">
        {/* Profile image */}
        <div className="shrink-0">
          {player.profileImageUrl ? (
            <img
              src={player.profileImageUrl}
              alt={fullName}
              className="w-24 h-24 rounded-full object-cover border-2 border-mig-orange/30"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-mig-orange/20 flex items-center justify-center text-mig-orange text-3xl font-bold select-none">
              {player.firstName?.[0]}{player.lastName?.[0]}
            </div>
          )}
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black tracking-tight text-mig-text">{fullName}</h1>
            {player.jerseyNumber != null && (
              <span className="text-sm font-mono bg-mig-orange text-white px-2 py-0.5 rounded">
                #{player.jerseyNumber}
              </span>
            )}
            {player.ageGroup && (
              <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                {player.ageGroup}
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-mig-muted">
            <InfoRow label="Primary position" value={player.primaryPosition} />
            <InfoRow label="Secondary position" value={player.secondaryPosition} />
            <InfoRow label="Strong foot" value={player.strongFoot} />
            <InfoRow
              label="Team"
              value={
                player.teamId ? (
                  <Link
                    to={`/stats/teams/${player.teamId}`}
                    className="text-mig-orange hover:underline"
                  >
                    {player.teamName}
                  </Link>
                ) : player.teamName
              }
            />
            <InfoRow label="Club" value={player.clubName} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-mig-border">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'stats',    label: 'Stats' },
        ].map(({ id: t, label }) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t
                ? 'border-mig-orange text-mig-orange'
                : 'border-transparent text-mig-muted hover:text-mig-text'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="bg-mig-surface border border-mig-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-mig-border">
              <h2 className="font-semibold text-mig-text">Career Statistics</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-mig-border">
              {STAT_ROWS.map(({ key, label, decimal }) => {
                const raw = player[key]
                if (raw == null) return null
                const display = decimal ? Number(raw).toFixed(2) : raw
                return (
                  <div key={key} className="px-4 py-3 text-center">
                    <p className="text-2xl font-bold text-mig-orange">{display}</p>
                    <p className="text-xs text-mig-muted mt-0.5">{label}</p>
                  </div>
                )
              })}
            </div>
          </div>
          <p className="text-xs text-mig-dim text-center">
            Public profile — no private evaluations or coach notes are shown.
          </p>
        </>
      )}

      {tab === 'stats' && (
        <PlayerSeasonStatsTab data={seasonStats} loading={sLoading} error={sError} />
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-1">
      <span className="text-mig-dim">{label}:</span>
      <span className="font-medium text-mig-muted">{value}</span>
    </div>
  )
}

function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-24 text-mig-muted">
      <svg className="animate-spin h-6 w-6 mr-2 text-mig-orange" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Loading player profile…
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <div className="max-w-3xl mx-auto flex items-start gap-3 bg-mig-danger/10 border border-mig-danger/30 text-mig-danger rounded-lg px-4 py-3 text-sm">
      <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </div>
  )
}
