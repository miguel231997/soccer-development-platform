import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { listMatches } from '../../api/coach'
import { useFetch } from '../../hooks/useFetch'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

const FILTERS = ['All', 'Upcoming', 'Pending', 'Finalized']

function matchStatus(match) {
  const past = new Date(match.matchDateTime) < new Date()
  if (match.finalized) return 'Finalized'
  if (past) return 'Pending'
  return 'Upcoming'
}

const STATUS_STYLE = {
  Upcoming:  'bg-green-50 text-green-700',
  Pending:   'bg-yellow-50 text-yellow-700',
  Finalized: 'bg-gray-100 text-gray-500',
}

export default function MatchListPage() {
  const [filter, setFilter] = useState('All')
  const fetcher = useCallback(() => listMatches(), [])
  const { data: matches, loading, error } = useFetch(fetcher)

  const sorted = [...(matches ?? [])].sort(
    (a, b) => new Date(b.matchDateTime) - new Date(a.matchDateTime),
  )
  const visible = filter === 'All' ? sorted : sorted.filter((m) => matchStatus(m) === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Matches</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              filter === f
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <Spinner label="Loading matches…" />}
      {error && <ErrorAlert message={error} />}

      {!loading && !error && visible.length === 0 && (
        <p className="text-gray-500 text-sm">No matches found.</p>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
          {visible.map((m) => {
            const status = matchStatus(m)
            const date = new Date(m.matchDateTime)
            const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
            const score = m.homeScore != null && m.awayScore != null ? `${m.homeScore}–${m.awayScore}` : null

            return (
              <Link
                key={m.id}
                to={`/matches/${m.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {m.teamName} vs {m.opponent}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {dateStr} · {timeStr}
                    {m.location && ` · ${m.location}`}
                    {m.competitionName && ` · ${m.competitionName}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {score && <span className="text-sm font-mono font-semibold text-gray-700">{score}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_STYLE[status]}`}>
                    {status}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
