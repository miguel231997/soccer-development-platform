import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { listPlayers } from '../../api/coach'
import { useFetch } from '../../hooks/useFetch'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

export default function PlayersPage() {
  const fetcher = useCallback(() => listPlayers(), [])
  const { data: players, loading, error } = useFetch(fetcher)

  const active = (players ?? []).filter((p) => p.active)
  const activeTeam = (p) => p.teams?.find((t) => t.active)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Players</h1>

      {loading && <Spinner label="Loading players…" />}
      {error && <ErrorAlert message={error} />}

      {!loading && !error && active.length === 0 && (
        <p className="text-gray-500 text-sm">No active players found.</p>
      )}

      {!loading && !error && active.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
          {active.map((p) => {
            const team = activeTeam(p)
            return (
              <Link
                key={p.id}
                to={`/players/${p.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition"
              >
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0 overflow-hidden">
                  {p.profileImageUrl
                    ? <img src={p.profileImageUrl} alt="" className="w-full h-full object-cover" />
                    : `${p.firstName?.[0]}${p.lastName?.[0]}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{p.firstName} {p.lastName}</p>
                  <p className="text-xs text-gray-400">
                    {p.primaryPosition ?? '—'}
                    {p.jerseyNumber != null && ` · #${p.jerseyNumber}`}
                    {team && ` · ${team.teamName}`}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
