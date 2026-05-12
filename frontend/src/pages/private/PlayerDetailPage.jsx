import { useCallback, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPlayer, getPlayerStats, getPlayerEvaluations, uploadPlayerImage } from '../../api/coach'
import { useFetch } from '../../hooks/useFetch'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

const STAT_COLS = [
  { key: 'opponent',       label: 'Match' },
  { key: 'minutesPlayed',  label: 'Min' },
  { key: 'goals',          label: 'G' },
  { key: 'assists',        label: 'A' },
  { key: 'shots',          label: 'Shots' },
  { key: 'shotsOnTarget',  label: 'SoT' },
  { key: 'saves',          label: 'Saves' },
  { key: 'cleanSheet',     label: 'CS' },
  { key: 'xg',             label: 'xG', decimal: true },
  { key: 'xa',             label: 'xA', decimal: true },
]

const RATING_KEYS = [
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

export default function PlayerDetailPage() {
  const { playerId } = useParams()
  const [tab, setTab] = useState('info')
  const [imageUrl, setImageUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const fileInputRef = useRef(null)

  const playerFetcher = useCallback(() => getPlayer(playerId), [playerId])
  const statsFetcher  = useCallback(() => getPlayerStats(playerId), [playerId])
  const evalsFetcher  = useCallback(() => getPlayerEvaluations(playerId), [playerId])

  const { data: player, loading: pLoading, error: pError } = useFetch(playerFetcher, [playerId])
  const { data: stats,  loading: sLoading } = useFetch(statsFetcher,  [playerId])
  const { data: evals,  loading: eLoading } = useFetch(evalsFetcher,  [playerId])

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadErr(''); setUploading(true)
    try {
      const updated = await uploadPlayerImage(playerId, file)
      setImageUrl(updated.profileImageUrl)
    } catch (err) {
      setUploadErr(err?.response?.data?.message || 'Upload failed.')
    } finally { setUploading(false) }
  }

  if (pLoading) return <Spinner label="Loading player…" />
  if (pError)   return <ErrorAlert message={pError} />

  const activeTeam = player.teams?.find((t) => t.active)
  const dob = player.dateOfBirth
    ? new Date(player.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : null

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        {activeTeam && (
          <Link to={`/teams/${activeTeam.teamId}`} className="text-sm text-gray-400 hover:text-green-700">
            ← {activeTeam.teamName}
          </Link>
        )}
        <div className="flex items-start gap-4 mt-2">
          <div className="relative shrink-0 group">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl font-bold overflow-hidden">
              {(imageUrl ?? player.profileImageUrl)
                ? <img src={imageUrl ?? player.profileImageUrl} alt="" className="w-full h-full object-cover" />
                : `${player.firstName?.[0]}${player.lastName?.[0]}`}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-black/40 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition disabled:cursor-wait"
            >
              {uploading ? '…' : 'Upload'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="hidden" onChange={handleImagePick} />
            {uploadErr && <p className="absolute top-full mt-1 text-xs text-red-600 whitespace-nowrap">{uploadErr}</p>}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {player.firstName} {player.lastName}
              {player.jerseyNumber != null && (
                <span className="ml-2 text-base font-mono bg-green-700 text-white px-2 py-0.5 rounded">
                  #{player.jerseyNumber}
                </span>
              )}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {player.primaryPosition ?? '—'}
              {player.secondaryPosition && ` / ${player.secondaryPosition}`}
              {activeTeam && ` · ${activeTeam.teamName}`}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {['info', 'stats', 'evaluations'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize transition ${
              tab === t
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'stats' ? `Stats (${(stats ?? []).length})` : t === 'evaluations' ? `Evaluations (${(evals ?? []).length})` : t}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {tab === 'info' && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <InfoRow label="Primary position" value={player.primaryPosition} />
          <InfoRow label="Secondary position" value={player.secondaryPosition} />
          <InfoRow label="Strong foot" value={player.strongFoot} />
          <InfoRow label="Date of birth" value={dob} />
          <InfoRow label="Status" value={player.active ? 'Active' : 'Inactive'} />
          <InfoRow label="Public profile" value={player.publicProfileEnabled ? 'Enabled' : 'Disabled'} />
          {player.teams?.map((t) => (
            <InfoRow
              key={t.teamId}
              label={t.active ? 'Current team' : 'Former team'}
              value={<Link to={`/teams/${t.teamId}`} className="text-green-700 hover:underline">{t.teamName}</Link>}
            />
          ))}
        </div>
      )}

      {/* Stats tab */}
      {tab === 'stats' && (
        <>
          {sLoading && <Spinner label="Loading stats…" />}
          {!sLoading && (stats ?? []).length === 0 && (
            <p className="text-gray-500 text-sm">No match stats recorded.</p>
          )}
          {!sLoading && (stats ?? []).length > 0 && (
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
                    {stats.map((s) => (
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
          )}
        </>
      )}

      {/* Evaluations tab */}
      {tab === 'evaluations' && (
        <>
          {eLoading && <Spinner label="Loading evaluations…" />}
          {!eLoading && (evals ?? []).length === 0 && (
            <p className="text-gray-500 text-sm">No evaluations recorded.</p>
          )}
          {!eLoading && (evals ?? []).length > 0 && (
            <div className="space-y-3">
              {evals.map((ev) => (
                <div key={ev.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-medium text-gray-800">vs {ev.opponent}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {ev.matchDateTime
                          ? new Date(ev.matchDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                        {ev.positionPlayed && ` · played ${ev.positionPlayed}`}
                        {ev.coachName && ` · by ${ev.coachName}`}
                      </p>
                    </div>
                    {ev.overallRating && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-700">{ev.overallRating}</p>
                        <p className="text-xs text-gray-400">Overall</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {RATING_KEYS.filter((r) => r.key !== 'overallRating').map(({ key, label }) =>
                      ev[key] != null ? (
                        <div key={key} className="text-center">
                          <p className="text-sm font-semibold text-gray-700">{ev[key]}</p>
                          <p className="text-xs text-gray-400">{label}</p>
                        </div>
                      ) : null,
                    )}
                  </div>
                  {ev.parentVisibleNotes && (
                    <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded p-2">
                      <span className="text-xs font-medium text-gray-400 block mb-1">Parent notes</span>
                      {ev.parentVisibleNotes}
                    </div>
                  )}
                  {ev.coachOnlyNotes && (
                    <div className="mt-2 text-sm text-gray-600 bg-yellow-50 rounded p-2">
                      <span className="text-xs font-medium text-yellow-600 block mb-1">Coach only</span>
                      {ev.coachOnlyNotes}
                    </div>
                  )}
                  {ev.matchId && (
                    <div className="mt-3">
                      <Link
                        to={`/matches/${ev.matchId}/players/${playerId}/evaluation`}
                        className="text-xs text-green-700 hover:underline"
                      >
                        Edit evaluation →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 shrink-0">{label}:</span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
  )
}
