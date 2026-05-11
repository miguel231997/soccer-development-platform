import { useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublicTeamStats } from '../../api/public'
import { useFetch } from '../../hooks/useFetch'

export default function PublicTeamStatsPage() {
  const { teamId } = useParams()

  const fetcher = useCallback(() => getPublicTeamStats(teamId), [teamId])
  const { data: team, loading, error } = useFetch(fetcher, [teamId])

  if (loading) return <PageSpinner />
  if (error)   return <ErrorBanner message={error} />

  const players = team?.players ?? []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Team header */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{team.teamName}</h1>
            {team.clubName && (
              <p className="text-sm text-gray-500 mt-0.5">{team.clubName}</p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {team.ageGroup && (
              <Badge color="blue">{team.ageGroup}</Badge>
            )}
            {team.gender && (
              <Badge color="gray">{team.gender}</Badge>
            )}
            {team.competitiveLevel && (
              <Badge color="green">{team.competitiveLevel}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Players table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-gray-700">Roster Stats</span>
          <span className="text-xs text-gray-400">{players.length} players</span>
        </div>

        {players.length === 0 ? (
          <p className="px-4 py-8 text-center text-gray-500 text-sm">No public player data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <Th>#</Th>
                  <Th>Player</Th>
                  <Th>Pos</Th>
                  <Th align="right">Apps</Th>
                  <Th align="right">G</Th>
                  <Th align="right">A</Th>
                  <Th align="right">G+A</Th>
                  <Th align="right">Shots</Th>
                  <Th align="right">SoT</Th>
                  <Th align="right">xG</Th>
                  <Th align="right">Min</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {players.map((p, i) => (
                  <tr key={p.playerId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/players/${p.playerId}/profile`}
                        className="font-medium text-green-700 hover:underline"
                      >
                        {p.playerName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.position ?? '—'}</td>
                    <Td>{p.appearances}</Td>
                    <Td bold>{p.goals}</Td>
                    <Td bold>{p.assists}</Td>
                    <Td bold>{p.goals + p.assists}</Td>
                    <Td>{p.shots}</Td>
                    <Td>{p.shotsOnTarget}</Td>
                    <Td>{Number(p.xg ?? 0).toFixed(2)}</Td>
                    <Td>{p.minutesPlayed}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-center">
        <Link to="/stats" className="text-sm text-green-700 hover:underline">
          ← Back to leaderboards
        </Link>
      </div>
    </div>
  )
}

function Th({ children, align = 'left' }) {
  return <th className={`px-4 py-2 text-${align} font-medium`}>{children}</th>
}

function Td({ children, bold }) {
  return (
    <td className={`px-4 py-3 text-right ${bold ? 'font-semibold text-green-800' : 'text-gray-600'}`}>
      {children ?? '—'}
    </td>
  )
}

function Badge({ children, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-gray-100 text-gray-600',
    green: 'bg-green-50 text-green-700',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-24 text-gray-400">
      <svg className="animate-spin h-6 w-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Loading team stats…
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
      {message}
    </div>
  )
}
