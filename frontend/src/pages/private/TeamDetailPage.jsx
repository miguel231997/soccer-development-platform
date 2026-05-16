import { useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTeam, listPlayers, listTeamMatches } from '../../api/coach'
import { useFetch } from '../../hooks/useFetch'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

function matchStatus(match) {
  const past = new Date(match.matchDateTime) < new Date()
  if (match.finalized) return { label: 'Finalized', cls: 'bg-mig-card text-mig-dim border border-mig-border' }
  if (past) return { label: 'Pending', cls: 'bg-mig-warning/10 text-mig-warning border border-mig-warning/20' }
  return { label: 'Upcoming', cls: 'bg-mig-success/10 text-mig-success border border-mig-success/20' }
}

export default function TeamDetailPage() {
  const { teamId } = useParams()
  const [tab, setTab] = useState('roster')

  const teamFetcher = useCallback(() => getTeam(teamId), [teamId])
  const playersFetcher = useCallback(() => listPlayers(), [])
  const matchesFetcher = useCallback(() => listTeamMatches(teamId), [teamId])

  const { data: team, loading: teamLoading, error: teamError } = useFetch(teamFetcher, [teamId])
  const { data: allPlayers, loading: playersLoading } = useFetch(playersFetcher)
  const { data: matches, loading: matchesLoading } = useFetch(matchesFetcher, [teamId])

  const roster = (allPlayers ?? []).filter((p) =>
    p.active && p.teams?.some((t) => t.teamId === Number(teamId) && t.active),
  )

  const sortedMatches = [...(matches ?? [])].sort(
    (a, b) => new Date(b.matchDateTime) - new Date(a.matchDateTime),
  )

  if (teamLoading) return <Spinner label="Loading team…" />
  if (teamError) return <ErrorAlert message={teamError} />

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Team header */}
      <div>
        <Link to="/teams" className="text-xs text-mig-muted hover:text-mig-orange transition-colors font-medium uppercase tracking-wide">← Teams</Link>
        <h1 className="text-2xl font-black tracking-tight text-mig-text mt-1">{team.name}</h1>
        {team.clubName && <p className="text-mig-muted text-sm">{team.clubName}</p>}
        <div className="flex gap-2 mt-2 flex-wrap">
          {team.ageGroup && <Badge color="blue">{team.ageGroup}</Badge>}
          {team.gender && <Badge color="gray">{team.gender}</Badge>}
          {team.competitiveLevel && <Badge color="orange">{team.competitiveLevel}</Badge>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-mig-border">
        {['roster', 'matches'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize transition ${
              tab === t
                ? 'border-mig-orange text-mig-orange'
                : 'border-transparent text-mig-muted hover:text-mig-text'
            }`}
          >
            {t === 'roster' ? `Roster (${roster.length})` : `Matches (${(matches ?? []).length})`}
          </button>
        ))}
      </div>

      {/* Roster tab */}
      {tab === 'roster' && (
        <>
          {playersLoading && <Spinner label="Loading roster…" />}
          {!playersLoading && roster.length === 0 && (
            <p className="text-mig-muted text-sm">No active players on this team.</p>
          )}
          {!playersLoading && roster.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {roster.map((p) => (
                <Link
                  key={p.id}
                  to={`/players/${p.id}`}
                  className="bg-mig-surface border border-mig-border rounded-lg p-4 hover:border-mig-orange/40 hover:shadow-sm transition group flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-mig-orange/20 flex items-center justify-center text-mig-orange font-bold text-sm">
                    {p.profileImageUrl
                      ? <img src={p.profileImageUrl} alt="" className="w-full h-full object-cover" />
                      : `${p.firstName?.[0]}${p.lastName?.[0]}`
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-mig-text group-hover:text-mig-orange truncate">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-xs text-mig-dim">
                      {p.primaryPosition ?? '—'}
                      {p.jerseyNumber != null && ` · #${p.jerseyNumber}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* Matches tab */}
      {tab === 'matches' && (
        <>
          {matchesLoading && <Spinner label="Loading matches…" />}
          {!matchesLoading && sortedMatches.length === 0 && (
            <p className="text-mig-muted text-sm">No matches scheduled for this team.</p>
          )}
          {!matchesLoading && sortedMatches.length > 0 && (
            <div className="bg-mig-surface border border-mig-border rounded-xl overflow-hidden divide-y divide-mig-border">
              {sortedMatches.map((m) => {
                const st = matchStatus(m)
                const date = new Date(m.matchDateTime)
                const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                const score = m.homeScore != null && m.awayScore != null ? `${m.homeScore}–${m.awayScore}` : null
                return (
                  <Link
                    key={m.id}
                    to={`/matches/${m.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-mig-card transition-colors"
                  >
                    <div>
                      <p className="font-medium text-mig-text">vs {m.opponent}</p>
                      <p className="text-xs text-mig-dim mt-0.5">
                        {dateStr}{m.location && ` · ${m.location}`}
                        {m.homeAway && ` · ${m.homeAway}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {score && <span className="font-mono text-sm font-semibold text-mig-text">{score}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${st.cls}`}>{st.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Badge({ children, color }) {
  const cls = {
    blue:   'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    gray:   'bg-mig-card text-mig-dim border border-mig-border',
    orange: 'bg-mig-orange/10 text-mig-orange border border-mig-orange/20',
  }
  return <span className={`text-xs px-2 py-0.5 rounded font-medium ${cls[color]}`}>{children}</span>
}
