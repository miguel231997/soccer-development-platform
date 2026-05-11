import { useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTeam, listPlayers, listTeamMatches } from '../../api/coach'
import { useFetch } from '../../hooks/useFetch'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

function matchStatus(match) {
  const past = new Date(match.matchDateTime) < new Date()
  if (match.finalized) return { label: 'Finalized', cls: 'bg-gray-100 text-gray-500' }
  if (past) return { label: 'Pending', cls: 'bg-yellow-50 text-yellow-700' }
  return { label: 'Upcoming', cls: 'bg-green-50 text-green-700' }
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
        <Link to="/teams" className="text-sm text-gray-400 hover:text-green-700">← Teams</Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">{team.name}</h1>
        {team.clubName && <p className="text-gray-500 text-sm">{team.clubName}</p>}
        <div className="flex gap-2 mt-2 flex-wrap">
          {team.ageGroup && <Badge color="blue">{team.ageGroup}</Badge>}
          {team.gender && <Badge color="gray">{team.gender}</Badge>}
          {team.competitiveLevel && <Badge color="green">{team.competitiveLevel}</Badge>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {['roster', 'matches'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize transition ${
              tab === t
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
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
            <p className="text-gray-500 text-sm">No active players on this team.</p>
          )}
          {!playersLoading && roster.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {roster.map((p) => (
                <Link
                  key={p.id}
                  to={`/players/${p.id}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-400 hover:shadow-sm transition group flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                    {p.profileImageUrl
                      ? <img src={p.profileImageUrl} alt="" className="w-full h-full object-cover" />
                      : `${p.firstName?.[0]}${p.lastName?.[0]}`
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 group-hover:text-green-700 truncate">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
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
            <p className="text-gray-500 text-sm">No matches scheduled for this team.</p>
          )}
          {!matchesLoading && sortedMatches.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
              {sortedMatches.map((m) => {
                const st = matchStatus(m)
                const date = new Date(m.matchDateTime)
                const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                const score = m.homeScore != null && m.awayScore != null ? `${m.homeScore}–${m.awayScore}` : null
                return (
                  <Link
                    key={m.id}
                    to={`/matches/${m.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <div>
                      <p className="font-medium text-gray-800">vs {m.opponent}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {dateStr}{m.location && ` · ${m.location}`}
                        {m.homeAway && ` · ${m.homeAway}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {score && <span className="font-mono text-sm font-semibold text-gray-700">{score}</span>}
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
  const cls = { blue: 'bg-blue-50 text-blue-700', gray: 'bg-gray-100 text-gray-600', green: 'bg-green-50 text-green-700' }
  return <span className={`text-xs px-2 py-0.5 rounded font-medium ${cls[color]}`}>{children}</span>
}
