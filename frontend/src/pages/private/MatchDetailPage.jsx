import { useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getMatch, listPlayers, getMatchStats, getMatchEvaluations, finalizeMatch, updateMatch, updateMatchScore, updateMatchAnalysis, updateMatchGameStats,
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
  const teamGoals = match.homeAway === 'HOME' ? match.homeScore : match.awayScore
  const oppGoals  = match.homeAway === 'HOME' ? match.awayScore : match.homeScore
  const result = score
    ? teamGoals > oppGoals ? { label: 'W', cls: 'text-mig-success' }
    : teamGoals === oppGoals ? { label: 'D', cls: 'text-mig-warning' }
    : { label: 'L', cls: 'text-mig-danger' }
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
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <p className="text-xs text-mig-dim">{match.homeAway}</p>
                {result && <span className={`text-xs font-bold ${result.cls}`}>{result.label}</span>}
              </div>
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

        {!isParent && (
          <ScoreEntry match={match} onSaved={() => window.location.reload()} />
        )}

        <div className="pt-2 border-t border-mig-border flex items-center gap-3 flex-wrap">
          {isParent ? (
            <Link
              to={`/matches/${matchId}/stats`}
              className="text-sm border border-mig-border text-mig-muted hover:text-mig-text hover:border-mig-orange/30 font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              View Stats
            </Link>
          ) : (
            <>
              {!match.finalized && (
                <Link
                  to={`/matches/${matchId}/stats`}
                  className="text-sm bg-mig-orange hover:bg-mig-orange-dark text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Enter Stats
                </Link>
              )}
              <FormError message={finalizeError} />
              {!match.finalized && (
                <button
                  onClick={handleFinalize}
                  disabled={finalizing}
                  className="text-sm border border-mig-border text-mig-muted hover:text-mig-text hover:border-mig-orange/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {finalizing ? 'Finalizing…' : 'Finalize Match'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <PostGameAnalysis match={match} isParent={isParent} />

      <GameStats match={match} isParent={isParent} />

      {/* Player status table */}
      <div className="bg-mig-surface border border-mig-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-mig-border flex items-center justify-between">
          <h2 className="font-semibold text-mig-text">Player Stats</h2>
          {!isParent && <span className="text-xs text-mig-dim">{roster.length} players</span>}
        </div>

        {isParent && (stats ?? []).length === 0 ? (
          <p className="px-4 py-8 text-center text-mig-dim text-sm italic">Player stats not available yet.</p>
        ) : roster.length === 0 ? (
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

function PostGameAnalysis({ match, isParent }) {
  const [text, setText] = useState(match.analysis ?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const locked = match.analysisLocked || match.finalized

  if (isParent) {
    if (!match.analysis) return null
    return (
      <div className="bg-mig-surface border border-mig-border rounded-lg p-5">
        <h2 className="text-sm font-semibold text-mig-text mb-2">Post-Game Analysis</h2>
        <p className="text-sm text-mig-muted whitespace-pre-wrap">{match.analysis}</p>
      </div>
    )
  }

  if (locked) {
    return (
      <div className="bg-mig-surface border border-mig-border rounded-lg p-5">
        <h2 className="text-sm font-semibold text-mig-text mb-2">Post-Game Analysis <span className="text-xs font-normal text-mig-dim">(locked)</span></h2>
        {match.analysis
          ? <p className="text-sm text-mig-muted whitespace-pre-wrap">{match.analysis}</p>
          : <p className="text-sm text-mig-dim italic">No analysis was entered.</p>
        }
      </div>
    )
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setErr('')
    try {
      await updateMatchAnalysis(match.id, text)
      window.location.reload()
    } catch (ex) {
      setErr(ex?.response?.data?.message || 'Failed to save.')
    } finally { setSaving(false) }
  }

  return (
    <div className="bg-mig-surface border border-mig-border rounded-lg p-5">
      <h2 className="text-sm font-semibold text-mig-text mb-3">Post-Game Analysis</h2>
      <form onSubmit={handleSave} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Write your post-game analysis here… tactics, performance highlights, areas to improve."
          className="w-full bg-mig-bg border border-mig-border text-mig-text placeholder-mig-dim rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mig-orange/40 focus:border-mig-orange transition-colors resize-y"
        />
        <div className="flex items-center gap-3 flex-wrap">
          <button type="submit" disabled={saving}
            className="text-sm bg-mig-orange hover:bg-mig-orange-dark text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Analysis'}
          </button>
          <span className="text-xs text-mig-dim">Once saved, the analysis is locked</span>
          {err && <span className="text-xs text-mig-danger">{err}</span>}
        </div>
      </form>
    </div>
  )
}

function ScoreEntry({ match, onSaved }) {
  const [home, setHome] = useState(match.homeScore ?? '')
  const [away, setAway] = useState(match.awayScore ?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const locked = match.scoreLocked || match.finalized

  if (locked && match.homeScore != null && match.awayScore != null) {
    return (
      <div className="pt-2 border-t border-mig-border">
        <p className="text-xs font-semibold text-mig-dim uppercase tracking-wider mb-2">Score</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-mig-muted">{match.homeAway === 'HOME' ? match.teamName : match.opponent}</span>
          <span className="font-bold font-mono text-mig-text">{match.homeScore}</span>
          <span className="text-mig-dim font-bold">–</span>
          <span className="font-bold font-mono text-mig-text">{match.awayScore}</span>
          <span className="text-mig-muted">{match.homeAway === 'HOME' ? match.opponent : match.teamName}</span>
          <span className="text-xs text-mig-dim ml-1">(locked)</span>
        </div>
      </div>
    )
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (home === '' || away === '') return
    setSaving(true); setErr('')
    try {
      await updateMatchScore(match.id, Number(home), Number(away))
      onSaved()
    } catch (ex) {
      setErr(ex?.response?.data?.message || 'Failed to save score.')
    } finally { setSaving(false) }
  }

  return (
    <div className="pt-2 border-t border-mig-border">
      <p className="text-xs font-semibold text-mig-dim uppercase tracking-wider mb-2">Score</p>
      <form onSubmit={handleSave} className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-mig-muted">{match.homeAway === 'HOME' ? match.teamName : match.opponent}</label>
          <input
            type="number" min="0" value={home}
            onChange={(e) => setHome(e.target.value)}
            className="w-14 bg-mig-bg border border-mig-border text-mig-text rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-mig-orange/40 focus:border-mig-orange transition-colors"
          />
          <span className="text-mig-dim font-bold">–</span>
          <input
            type="number" min="0" value={away}
            onChange={(e) => setAway(e.target.value)}
            className="w-14 bg-mig-bg border border-mig-border text-mig-text rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-mig-orange/40 focus:border-mig-orange transition-colors"
          />
          <label className="text-xs text-mig-muted">{match.homeAway === 'HOME' ? match.opponent : match.teamName}</label>
        </div>
        <button type="submit" disabled={saving || home === '' || away === ''}
          className="text-sm bg-mig-orange hover:bg-mig-orange-dark text-white font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Score'}
        </button>
        <span className="text-xs text-mig-dim">Once saved, the score is locked</span>
        {err && <span className="text-xs text-mig-danger">{err}</span>}
      </form>
    </div>
  )
}

function GameStats({ match, isParent }) {
  const [form, setForm] = useState({
    possessionPct: match.possessionPct ?? '',
    teamShots: match.teamShots ?? '',
    opponentShots: match.opponentShots ?? '',
    teamCompletedPasses: match.teamCompletedPasses ?? '',
    opponentCompletedPasses: match.opponentCompletedPasses ?? '',
    teamTouches: match.teamTouches ?? '',
    teamPassCompletionPct: match.teamPassCompletionPct ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  if (match.gameStatsLocked) {
    return (
      <div className="bg-mig-surface border border-mig-border rounded-lg p-5">
        <p className="text-xs font-semibold text-mig-dim uppercase tracking-wider mb-4">Game Stats</p>
        <div className="space-y-4">
          {match.possessionPct != null && (
            <StatCompareRow
              label="Possession"
              teamVal={`${match.possessionPct}%`}
              oppVal={`${100 - match.possessionPct}%`}
              teamName={match.teamName}
              oppName={match.opponent}
            />
          )}
          {(match.teamShots != null || match.opponentShots != null) && (
            <StatCompareRow
              label="Shots"
              teamVal={match.teamShots}
              oppVal={match.opponentShots}
              teamName={match.teamName}
              oppName={match.opponent}
            />
          )}
          {(match.teamCompletedPasses != null || match.opponentCompletedPasses != null) && (
            <StatCompareRow
              label="Completed Passes"
              teamVal={match.teamCompletedPasses}
              oppVal={match.opponentCompletedPasses}
              teamName={match.teamName}
              oppName={match.opponent}
            />
          )}
          {match.teamTouches != null && (
            <div>
              <p className="text-xs text-mig-dim mb-1">Touches Near Opp. Box</p>
              <p className="text-lg font-bold text-mig-text">{match.teamTouches}</p>
            </div>
          )}
          {match.teamPassCompletionPct != null && (
            <div>
              <p className="text-xs text-mig-dim mb-1">Pass Completion</p>
              <p className="text-lg font-bold text-mig-text">{match.teamPassCompletionPct}%</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isParent) {
    return (
      <div className="bg-mig-surface border border-mig-border rounded-lg p-5">
        <p className="text-xs font-semibold text-mig-dim uppercase tracking-wider mb-2">Game Stats</p>
        <p className="text-sm text-mig-dim italic">Game stats not available yet.</p>
      </div>
    )
  }

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setSaved(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setErr(''); setSaved(false)
    try {
      const payload = {}
      if (form.possessionPct !== '') payload.possessionPct = Number(form.possessionPct)
      if (form.teamShots !== '') payload.teamShots = Number(form.teamShots)
      if (form.opponentShots !== '') payload.opponentShots = Number(form.opponentShots)
      if (form.teamCompletedPasses !== '') payload.teamCompletedPasses = Number(form.teamCompletedPasses)
      if (form.opponentCompletedPasses !== '') payload.opponentCompletedPasses = Number(form.opponentCompletedPasses)
      if (form.teamTouches !== '') payload.teamTouches = Number(form.teamTouches)
      if (form.teamPassCompletionPct !== '') payload.teamPassCompletionPct = Number(form.teamPassCompletionPct)
      await updateMatchGameStats(match.id, payload)
      setSaved(true)
      setTimeout(() => window.location.reload(), 600)
    } catch (ex) {
      setErr(ex?.response?.data?.message || 'Failed to save.')
    } finally { setSaving(false) }
  }

  return (
    <div className="bg-mig-surface border border-mig-border rounded-lg p-5">
      <p className="text-xs font-semibold text-mig-dim uppercase tracking-wider mb-4">Game Stats</p>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatInput label="Possession %" value={form.possessionPct} onChange={handleChange('possessionPct')} min={0} max={100} />
          <StatInput label="Touches Near Opp. Box" value={form.teamTouches} onChange={handleChange('teamTouches')} min={0} />
          <StatInput label="Pass Completion %" value={form.teamPassCompletionPct} onChange={handleChange('teamPassCompletionPct')} min={0} max={100} />
        </div>
        <div>
          <p className="text-xs text-mig-dim mb-2">Shots</p>
          <div className="grid grid-cols-2 gap-3">
            <StatInput label={match.teamName} value={form.teamShots} onChange={handleChange('teamShots')} min={0} />
            <StatInput label={match.opponent} value={form.opponentShots} onChange={handleChange('opponentShots')} min={0} />
          </div>
        </div>
        <div>
          <p className="text-xs text-mig-dim mb-2">Completed Passes</p>
          <div className="grid grid-cols-2 gap-3">
            <StatInput label={match.teamName} value={form.teamCompletedPasses} onChange={handleChange('teamCompletedPasses')} min={0} />
            <StatInput label={match.opponent} value={form.opponentCompletedPasses} onChange={handleChange('opponentCompletedPasses')} min={0} />
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button type="submit" disabled={saving}
            className="text-sm bg-mig-orange hover:bg-mig-orange-dark text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Game Stats'}
          </button>
          <span className="text-xs text-mig-dim">Once saved, these stats are locked</span>
          {saved && <span className="text-xs text-mig-success">Saved!</span>}
          {err && <span className="text-xs text-mig-danger">{err}</span>}
        </div>
      </form>
    </div>
  )
}

function StatInput({ label, value, onChange, min = 0, max }) {
  return (
    <div>
      <label className="block text-xs text-mig-muted mb-1 truncate">{label}</label>
      <input
        type="number" min={min} max={max} value={value} onChange={onChange}
        className="w-full bg-mig-bg border border-mig-border text-mig-text rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-mig-orange/40 focus:border-mig-orange transition-colors"
      />
    </div>
  )
}

function StatCompareRow({ label, teamVal, oppVal, teamName, oppName }) {
  return (
    <div>
      <p className="text-xs text-mig-dim mb-2">{label}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1 text-center">
          <p className="text-xs text-mig-muted mb-0.5 truncate">{teamName}</p>
          <p className="text-xl font-bold text-mig-text">{teamVal ?? '—'}</p>
        </div>
        <span className="text-mig-dim text-xs font-medium">vs</span>
        <div className="flex-1 text-center">
          <p className="text-xs text-mig-muted mb-0.5 truncate">{oppName}</p>
          <p className="text-xl font-bold text-mig-text">{oppVal ?? '—'}</p>
        </div>
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
