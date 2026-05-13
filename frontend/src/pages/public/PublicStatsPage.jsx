import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getLeaderboard, getCompetitions } from '../../api/public'
import { useFetch } from '../../hooks/useFetch'

const STAT_OPTIONS = [
  { value: 'GOALS', label: 'Goals' },
  { value: 'ASSISTS', label: 'Assists' },
  { value: 'GOALS_ASSISTS', label: 'Goals + Assists' },
  { value: 'APPEARANCES', label: 'Appearances' },
  { value: 'MINUTES', label: 'Minutes Played' },
  { value: 'SHOTS', label: 'Shots' },
  { value: 'SHOTS_ON_TARGET', label: 'Shots on Target' },
  { value: 'XG', label: 'xG' },
  { value: 'XA', label: 'xA' },
  { value: 'XT', label: 'xT' },
  { value: 'DANGER_PREVENTED', label: 'Danger Prevented' },
]

const AGE_GROUPS = [
  'U6','U7','U8','U9','U10','U11','U12','U13','U14',
  'U15','U16','U17','U18','U19','ADULT',
]

const POSITIONS = [
  'GK','CB','LB','RB','LWB','RWB',
  'CDM','CM','CAM','LM','RM',
  'LW','RW','CF','ST',
]

function statValue(entry, stat) {
  switch (stat) {
    case 'GOALS': return entry.goals
    case 'ASSISTS': return entry.assists
    case 'GOALS_ASSISTS': return entry.goals + entry.assists
    case 'APPEARANCES': return entry.appearances
    case 'MINUTES': return entry.minutesPlayed
    case 'SHOTS': return entry.shots
    case 'SHOTS_ON_TARGET': return entry.shotsOnTarget
    case 'XG': return Number(entry.xg ?? 0).toFixed(2)
    case 'XA': return Number(entry.xa ?? 0).toFixed(2)
    case 'XT': return Number(entry.xt ?? 0).toFixed(2)
    case 'DANGER_PREVENTED': return Number(entry.dangerPrevented ?? 0).toFixed(2)
    default: return '—'
  }
}

const STATES = [
  { code: 'NJ', label: 'New Jersey' },
  { code: 'NY', label: 'New York' },
  { code: 'PA', label: 'Pennsylvania' },
  { code: 'CT', label: 'Connecticut' },
  { code: 'VA', label: 'Virginia' },
  { code: 'FL', label: 'Florida' },
]

const INIT = {
  stat: 'GOALS',
  ageGroup: '',
  position: '',
  competitionState: '',
  competitionId: '',
  minAppearances: '1',
}

export default function PublicStatsPage() {
  const [filters, setFilters] = useState(INIT)
  const [committed, setCommitted] = useState(INIT)

  const compFetcher = useCallback(
    () => getCompetitions(filters.competitionState || undefined),
    [filters.competitionState],
  )
  const { data: competitions } = useFetch(compFetcher, [filters.competitionState])

  const fetcher = useCallback(
    () => {
      const params = { stat: committed.stat, minAppearances: committed.minAppearances || 1 }
      if (committed.ageGroup) params.ageGroup = committed.ageGroup
      if (committed.position) params.position = committed.position
      if (committed.competitionId) params.competitionId = committed.competitionId
      return getLeaderboard(params)
    },
    [committed],
  )

  const { data: rows, loading, error } = useFetch(fetcher, [committed])

  const statLabel = STAT_OPTIONS.find((o) => o.value === committed.stat)?.label ?? committed.stat

  const handleField = (e) => {
    const { name, value } = e.target
    setFilters((f) => {
      const next = { ...f, [name]: value }
      if (name === 'competitionState') next.competitionId = ''
      return next
    })
  }
  const handleApply = (e) => { e.preventDefault(); setCommitted(filters) }
  const handleReset = () => { setFilters(INIT); setCommitted(INIT) }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Player Leaderboards</h1>
        <p className="text-gray-500 text-sm mt-1">Public stats — no login required.</p>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleApply}
        className="bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
      >
        <FilterSelect label="Stat" name="stat" value={filters.stat} onChange={handleField}>
          {STAT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </FilterSelect>

        <FilterSelect label="Age group" name="ageGroup" value={filters.ageGroup} onChange={handleField}>
          <option value="">All</option>
          {AGE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </FilterSelect>

        <FilterSelect label="Position" name="position" value={filters.position} onChange={handleField}>
          <option value="">All</option>
          {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </FilterSelect>

        <FilterInput label="Min appearances" name="minAppearances" type="number" min="1"
          value={filters.minAppearances} onChange={handleField} />

        <FilterSelect label="State" name="competitionState" value={filters.competitionState} onChange={handleField}>
          <option value="">All states</option>
          {STATES.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
        </FilterSelect>

        <FilterSelect label="Competition" name="competitionId" value={filters.competitionId} onChange={handleField}>
          <option value="">All competitions</option>
          {(competitions ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </FilterSelect>

        <div className="flex items-end gap-2 col-span-2 sm:col-span-1">
          <button
            type="submit"
            className="flex-1 bg-green-700 text-white text-sm py-2 rounded hover:bg-green-600"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 border border-gray-300 text-gray-600 text-sm py-2 rounded hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Table */}
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && rows && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-gray-700">{statLabel} Leaderboard</span>
            <span className="text-xs text-gray-400">{rows.length} players</span>
          </div>
          {rows.length === 0 ? (
            <p className="px-4 py-8 text-center text-gray-500 text-sm">No players match the selected filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <Th>#</Th>
                    <Th>Player</Th>
                    <Th>Team</Th>
                    <Th>Age Group</Th>
                    <Th>Position</Th>
                    <Th align="right">{statLabel}</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((entry, i) => (
                    <tr key={entry.playerId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/players/${entry.playerId}/profile`}
                          className="flex items-center gap-2.5 hover:opacity-80 transition"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400 shrink-0">
                            {entry.profileImageUrl
                              ? <img src={entry.profileImageUrl} alt="" className="w-full h-full object-cover" />
                              : <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>}
                          </div>
                          <span className="font-medium text-green-700">{entry.playerName}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {entry.teamId ? (
                          <Link to={`/stats/teams/${entry.teamId}`} className="hover:underline hover:text-green-700">
                            {entry.teamName}
                          </Link>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {entry.ageGroup ? (
                          <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">
                            {entry.ageGroup}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{entry.position ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-800">
                        {statValue(entry, committed.stat)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FilterSelect({ label, name, value, onChange, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {children}
      </select>
    </label>
  )
}

function FilterInput({ label, name, value, onChange, type = 'text', ...rest }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        {...rest}
      />
    </label>
  )
}

function Th({ children, align = 'left' }) {
  return (
    <th className={`px-4 py-2 text-${align} font-medium`}>{children}</th>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16 text-gray-400">
      <svg className="animate-spin h-6 w-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Loading leaderboard…
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
      {message}
    </div>
  )
}
