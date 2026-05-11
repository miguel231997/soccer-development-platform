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
      <h1 className="text-2xl font-bold text-gray-800">Teams</h1>

      {loading && <Spinner label="Loading teams…" />}
      {error && <ErrorAlert message={error} />}

      {!loading && !error && teams?.length === 0 && (
        <p className="text-gray-500 text-sm">No teams assigned to your account.</p>
      )}

      {!loading && !error && teams && teams.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((t) => (
            <Link
              key={t.id}
              to={`/teams/${t.id}`}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:border-green-400 hover:shadow-sm transition group"
            >
              <p className="font-semibold text-lg text-gray-800 group-hover:text-green-700">{t.name}</p>
              {t.clubName && <p className="text-sm text-gray-400 mt-0.5">{t.clubName}</p>}
              <div className="flex gap-2 mt-3 flex-wrap">
                {t.ageGroup && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{t.ageGroup}</span>
                )}
                {t.gender && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{t.gender}</span>
                )}
                {t.competitiveLevel && (
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">{t.competitiveLevel}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
