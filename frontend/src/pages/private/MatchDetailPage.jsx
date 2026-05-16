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
      <Link to="/matches" className="text-xs text-mig-muted hover:text-mig-orange transition-colors font-medium uppercase tracking-wide">← Matches</Link>

      {/* Match info card */}
      <div className="bg-mig-surface border border-mig-border rounded-lg p-5 space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-mig-text">
                {match.teamName} vs {match.opponent}
              </h1>
              {match.finalized ? (
                <span className="text-xs bg-mig-card text-mig-dim border border-mig-border px-2 py-0.5 rounded font-medium">Finalized</span>
              ) : (
                <span className="text-xs bg-mig-success/10 text-mig-success border border-mig-success/20 px-2 py-0.5 rounded font-medium">
                  {new Date(match.matchDateTime) < new Date() ? 'Pending' : 'Upcoming'}
                </span>
              )}
            </div>
            <p className="text-sm text-mig-muted mt-1">{dateStr} · {timeStr}</p>
          </div>
          {score && (
            <div className="text-center">
              <p className="text-3xl font-bold font-mono text-mig-text">{score}</p>
              <p className="text-xs text-mig-dim">{match.homeAway}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-mig-muted">
          {match.location && <Detail label="Location" value={match.location} />}
          {match.homeAway && <Detail label="Home/Away" value={match.homeAway} />}
          {match.competitionName && <Detail label="Competition" value={match.competitionName} />}
          {match.competitionType && <Detail label="Type" value={match.competitionType} />}
          {match.seasonName && <Detail label="Season" value={match.seasonName} />}
          {match.seasonPhaseName && <Detail label="Phase" value={match.seasonPhaseName} />}
        </div>

        {!match.finalized && (
          <div className="pt-2 border-t border-mig-border flex items-center gap-3 flex-wrap">
            <Link
              to={`/matches/${matchId}/stats`}
              className="text-sm bg-mig-orange hover:bg-mig-orange-dark text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Enter Stats
            </Link>
            {!isParent && (
              <>
                <FormError message={finalizeError} />
                <button
                  onClick={handleFinalize}
                  disabled={finalizing}
                  className="text-sm border border-mig-border text-mig-muted hover:text-mig-text hover:border-mig-orange/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {finalizing ? 'Finalizing…' : 'Finalize Match'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Player status table */}
      <div className="bg-mig-surface border border-mig-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-mig-border flex items-center justify-between">
          <h2 className="font-semibold text-mig-text">Player Status</h2>
          <span className="text-xs text-mig-dim">{roster.length} players</span>
        </div>

        {roster.length === 0 ? (
          <p className="px-4 py-8 text-center text-mig-muted text-sm">No active players on this team.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-mig-bg text-mig-dim text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Player</th>
                  <th className="px-4 py-2 text-left font-medium">Pos</th>
                  <th className="px-4 py-2 text-center font-medium">Stats</th>
                  {!isParent && <th className="px-4 py-2 text-center font-medium">Eval</th>}
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mig-border">
                {roster.map((p) => {
                  const hasStat = !!statsByPlayer[p.id]
                  const evalInfo = evalsForPlayer[p.id] ?? { any: false, own: false }
                  const hasEval = evalInfo.own  // checkmark only when current coach submitted
                  return (
                    <tr key={p.id} className="hover:bg-mig-card transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/players/${p.id}`} className="font-medium text-mig-text hover:text-mig-orange">
                          {p.firstName} {p.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-mig-muted">{p.primaryPosition ?? '—'}</td>
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
                              className="text-xs text-mig-orange border border-mig-orange/30 px-2 py-1 rounded hover:bg-mig-orange/10 transition-colors"
                            >
                              Stats
                            </Link>
                          )}
                          {!isParent && !match.finalized && (
                            <Link
                              to={`/matches/${matchId}/players/${p.id}/evaluation`}
                              className="text-xs text-blue-400 border border-blue-500/30 px-2 py-1 rounded hover:bg-blue-500/10 transition-colors"
                            >
                              {evalInfo.own ? 'Edit My Eval' : 'Evaluate'}
                            </Link>
                          )}
                          {!isParent && match.finalized && evalInfo.own && (
                            <Link
                              to={`/matches/${matchId}/players/${p.id}/evaluation`}
                              className="text-xs text-mig-muted border border-mig-border px-2 py-1 rounded transition-colors"
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
      <span className="text-mig-dim">{label}: </span>
      <span className="font-medium text-mig-muted">{value}</span>
    </span>
  )
}

function StatusDot({ done }) {
  return done
    ? <span className="inline-flex w-5 h-5 rounded-full bg-mig-success/10 text-mig-success text-xs items-center justify-center font-bold">✓</span>
    : <span className="inline-flex w-5 h-5 rounded-full bg-mig-card text-mig-dim text-xs items-center justify-center">–</span>
}
