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
      <div className="bg-mig-surface border border-mig-border rounded-lg p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-mig-text">{team.teamName}</h1>
            {team.clubName && (
              <p className="text-sm text-mig-muted mt-0.5">{team.clubName}</p>
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
              <Badge color="orange">{team.competitiveLevel}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Players table */}
      <div className="bg-mig-surface border border-mig-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-mig-border flex items-center justify-between">
          <span className="font-semibold text-mig-text">Roster Stats</span>
          <span className="text-xs text-mig-dim">{players.length} players</span>
        </div>

        {players.length === 0 ? (
          <p className="px-4 py-8 text-center text-mig-muted text-sm">No public player data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-mig-bg text-mig-dim text-xs uppercase tracking-wider">
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
              <tbody className="divide-y divide-mig-border">
                {players.map((p, i) => (
                  <tr key={p.playerId} className="hover:bg-mig-card transition-colors">
                    <td className="px-4 py-3 text-mig-dim font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/players/${p.playerId}/profile`}
                        className="font-medium text-mig-orange hover:underline"
                      >
                        {p.playerName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-mig-muted">{p.position ?? '—'}</td>
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
        <Link to="/stats" className="text-sm text-mig-orange hover:underline">
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
    <td className={`px-4 py-3 text-right ${bold ? 'font-semibold text-mig-orange' : 'text-mig-muted'}`}>
      {children ?? '—'}
    </td>
  )
}

function Badge({ children, color }) {
  const colors = {
    blue:   'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    gray:   'bg-mig-card text-mig-dim border border-mig-border',
    orange: 'bg-mig-orange/10 text-mig-orange border border-mig-orange/20',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-24 text-mig-muted">
      <svg className="animate-spin h-6 w-6 mr-2 text-mig-orange" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Loading team stats…
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <div className="max-w-4xl mx-auto flex items-start gap-3 bg-mig-danger/10 border border-mig-danger/30 text-mig-danger rounded-lg px-4 py-3 text-sm">
      <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </div>
  )
}
