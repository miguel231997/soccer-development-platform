import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { listTeams } from '../../api/coach'
import { useFetch } from '../../hooks/useFetch'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

export default function TeamsPage() {
  const fetcher = useCallback(() => listTeams(), [])
  const { data: teams, loading, error } = useFetch(fetcher)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black tracking-tight text-mig-text">Teams</h1>

      {loading && <Spinner label="Loading teams…" />}
      {error && <ErrorAlert message={error} />}

      {!loading && !error && teams?.length === 0 && (
        <p className="text-mig-muted text-sm">No teams assigned to your account.</p>
      )}

      {!loading && !error && teams && teams.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((t) => (
            <Link
              key={t.id}
              to={`/teams/${t.id}`}
              className="bg-mig-surface border border-mig-border rounded-lg p-5 hover:border-mig-orange/40 hover:shadow-sm transition group"
            >
              <p className="font-semibold text-lg text-mig-text group-hover:text-mig-orange">{t.name}</p>
              {t.clubName && <p className="text-sm text-mig-dim mt-0.5">{t.clubName}</p>}
              <div className="flex gap-2 mt-3 flex-wrap">
                {t.ageGroup && (
                  <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">{t.ageGroup}</span>
                )}
                {t.gender && (
                  <span className="text-xs bg-mig-card text-mig-dim border border-mig-border px-2 py-0.5 rounded">{t.gender}</span>
                )}
                {t.competitiveLevel && (
                  <span className="text-xs bg-mig-orange/10 text-mig-orange border border-mig-orange/20 px-2 py-0.5 rounded">{t.competitiveLevel}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
