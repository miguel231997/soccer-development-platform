import { useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getMatch, listPlayers, getMatchStats, getMatchEvaluations, finalizeMatch,
} from '../../api/coach'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'
import FormError from '../../components/FormError'

export default function MatchDetailPage() {
  const { matchId } = useParams()
  const { hasRole } = useAuth()
  const isParent = hasRole('ROLE_PARENT') && !hasRole('ROLE_COACH') && !hasRole('ROLE_ADMIN') && !hasRole('ROLE_DIRECTOR')
  const [finalizing, setFinalizing] = useState(false)
  const [finalizeError, setFinalizeError] = useState(null)

  const fetcher = useCallback(
    () => Promise.all([
      getMatch(matchId),
      listPlayers(),
      getMatchStats(matchId),
      getMatchEvaluations(matchId),
    ]).then(([match, players, stats, evals]) => ({ match, players, stats, evals })),
    [matchId],
  )

  const { data, loading, error, } = useFetch(fetcher, [matchId])

  const handleFinalize = async () => {
    if (!window.confirm('Finalize this match? Stats and score will be locked.')) return
    setFinalizing(true)
    setFinalizeError(null)
    try {
      await finalizeMatch(matchId)
      window.location.reload()
    } catch (e) {
      setFinalizeError(e?.response?.data?.message || 'Finalization failed.')
      setFinalizing(false)
    }
  }

  if (loading) return <Spinner label="Loading match…" />
  if (error)   return <ErrorAlert message={error} />

  const { match, players, stats, evals } = data

  const roster = (players ?? []).filter(
    (p) => p.active && p.teams?.some((t) => t.teamId === match.teamId && t.active),
  )

  const statsByPlayer = Object.fromEntries((stats ?? []).map((s) => [s.playerId, s]))
  // Track which players have ANY eval and which the current coach has submitted (own=true)
  const evalsForPlayer = {}
  ;(evals ?? []).forEach((e) => {
    if (!evalsForPlayer[e.playerId]) evalsForPlayer[e.playerId] = { any: false, own: false }
    evalsForPlayer[e.playerId].any = true
    if (e.own) evalsForPlayer[e.playerId].own = true
  })

  const date = new Date(match.matchDateTime)
  const dateStr = date.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
  const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  const score = match.homeScore != null && match.awayScore != null
    ? `${match.homeScore}–${match.awayScore}`
    : null

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <Link to="/matches" className="text-sm text-gray-400 hover:text-green-700">← Matches</Link>

      {/* Match info card */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-800">
                {match.teamName} vs {match.opponent}
              </h1>
              {match.finalized ? (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium">Finalized</span>
              ) : (
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium">
                  {new Date(match.matchDateTime) < new Date() ? 'Pending' : 'Upcoming'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{dateStr} · {timeStr}</p>
          </div>
          {score && (
            <div className="text-center">
              <p className="text-3xl font-bold font-mono text-gray-800">{score}</p>
              <p className="text-xs text-gray-400">{match.homeAway}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {match.location && <Detail label="Location" value={match.location} />}
          {match.homeAway && <Detail label="Home/Away" value={match.homeAway} />}
          {match.competitionName && <Detail label="Competition" value={match.competitionName} />}
          {match.competitionType && <Detail label="Type" value={match.competitionType} />}
          {match.seasonName && <Detail label="Season" value={match.seasonName} />}
          {match.seasonPhaseName && <Detail label="Phase" value={match.seasonPhaseName} />}
        </div>

        {!match.finalized && (
          <div className="pt-2 border-t border-gray-100 flex items-center gap-3 flex-wrap">
            <Link
              to={`/matches/${matchId}/stats`}
              className="text-sm bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Enter Stats
            </Link>
            {!isParent && (
              <>
                <FormError message={finalizeError} />
                <button
                  onClick={handleFinalize}
                  disabled={finalizing}
                  className="text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  {finalizing ? 'Finalizing…' : 'Finalize Match'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Player status table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Player Status</h2>
          <span className="text-xs text-gray-400">{roster.length} players</span>
        </div>

        {roster.length === 0 ? (
          <p className="px-4 py-8 text-center text-gray-500 text-sm">No active players on this team.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Player</th>
                  <th className="px-4 py-2 text-left font-medium">Pos</th>
                  <th className="px-4 py-2 text-center font-medium">Stats</th>
                  {!isParent && <th className="px-4 py-2 text-center font-medium">Eval</th>}
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roster.map((p) => {
                  const hasStat = !!statsByPlayer[p.id]
                  const evalInfo = evalsForPlayer[p.id] ?? { any: false, own: false }
                  const hasEval = evalInfo.own  // checkmark only when current coach submitted
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link to={`/players/${p.id}`} className="font-medium text-gray-800 hover:text-green-700">
                          {p.firstName} {p.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.primaryPosition ?? '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusDot done={hasStat} />
                      </td>
                      {!isParent && (
                        <td className="px-4 py-3 text-center">
                          <StatusDot done={hasEval} />
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end flex-wrap">
                          {!match.finalized && (
                            <Link
                              to={`/matches/${matchId}/stats`}
                              className="text-xs text-green-700 border border-green-300 px-2 py-1 rounded hover:bg-green-50"
                            >
                              Stats
                            </Link>
                          )}
                          {!isParent && !match.finalized && (
                            <Link
                              to={`/matches/${matchId}/players/${p.id}/evaluation`}
                              className="text-xs text-blue-700 border border-blue-300 px-2 py-1 rounded hover:bg-blue-50"
                            >
                              {evalInfo.own ? 'Edit My Eval' : 'Evaluate'}
                            </Link>
                          )}
                          {!isParent && match.finalized && evalInfo.own && (
                            <Link
                              to={`/matches/${matchId}/players/${p.id}/evaluation`}
                              className="text-xs text-gray-600 border border-gray-300 px-2 py-1 rounded"
                            >
                              View My Eval
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <span>
      <span className="text-gray-400">{label}: </span>
      <span className="font-medium text-gray-700">{value}</span>
    </span>
  )
}

function StatusDot({ done }) {
  return done
    ? <span className="inline-block w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-bold">✓</span>
    : <span className="inline-block w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-xs flex items-center justify-center">–</span>
}
