import { useState } from 'react'
import Spinner from './Spinner'
import ErrorAlert from './ErrorAlert'

const SECTIONS = [
  {
    label: 'Shooting',
    stats: [
      { key: 'goals',          label: 'Goals' },
      { key: 'shots',          label: 'Shots' },
      { key: 'shotsOnTarget',  label: 'Shots on target' },
    ],
  },
  {
    label: 'Passing',
    stats: [
      { key: 'assists',          label: 'Assists' },
      { key: 'successfulPasses', label: 'Successful passes' },
      { key: 'accurateLongBalls',label: 'Accurate long balls' },
      { key: 'chancesCreated',   label: 'Chances created' },
      { key: 'successfulCrosses',label: 'Successful crosses' },
    ],
  },
  {
    label: 'Possession',
    stats: [
      { key: 'successfulDribbles', label: 'Successful dribbles' },
      { key: 'duelsWon',           label: 'Duels won' },
      { key: 'dispossessed',       label: 'Dispossessed' },
      { key: 'foulsWon',           label: 'Fouls won' },
    ],
  },
  {
    label: 'Defending',
    stats: [
      { key: 'tackles',       label: 'Tackles' },
      { key: 'interceptions', label: 'Interceptions' },
      { key: 'foulsCommitted',label: 'Fouls committed' },
      { key: 'blockedShots',  label: 'Blocked shots' },
      { key: 'clearances',    label: 'Clearances' },
      { key: 'goalsConceded', label: 'Goals conceded while on pitch' },
    ],
  },
  {
    label: 'Discipline',
    stats: [
      { key: 'yellowCards', label: 'Yellow cards' },
      { key: 'redCards',    label: 'Red cards' },
    ],
  },
]

function barColor(pct) {
  if (pct >= 75) return 'bg-green-500'
  if (pct >= 40) return 'bg-orange-400'
  return 'bg-red-500'
}

function StatRow({ label, entry }) {
  if (!entry) return null
  const { value, percentile } = entry
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="flex-1 text-sm text-gray-700">{label}</span>
      <span className="w-8 text-right text-sm font-semibold text-gray-800 shrink-0">{value}</span>
      <div className="w-28 shrink-0">
        <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor(percentile)}`}
            style={{ width: `${percentile}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function RankModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Rank</h2>
          <button onClick={onClose} className="text-green-600 font-semibold text-sm hover:text-green-700">Done</button>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Rank shows how this player compares to other players in the same team, season, and age group
          for each stat.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          A <span className="font-semibold text-green-600">green bar</span> means the player ranks
          among the best for that stat. An{' '}
          <span className="font-semibold text-orange-500">orange bar</span> means average/middle
          range. A <span className="font-semibold text-red-500">red bar</span> means among the lowest.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          The length of the bar represents the player's percentile rank. For stats where fewer is
          better (e.g. fouls committed, dispossessed), lower numbers produce a higher rank.
        </p>
      </div>
    </div>
  )
}

export default function PlayerSeasonStatsTab({ data, loading, error }) {
  const [showRankInfo, setShowRankInfo] = useState(false)

  if (loading) return <Spinner label="Loading stats…" />
  if (error)   return <ErrorAlert message={error} />
  if (!data)   return (
    <div className="text-center py-10 text-gray-400 text-sm">No season statistics recorded yet.</div>
  )

  return (
    <div className="space-y-5">
      {showRankInfo && <RankModal onClose={() => setShowRankInfo(false)} />}

      {/* Card header */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 pt-4 pb-2 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Season performance</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Stats compared to other players in the same team &amp; season
            {data.seasonName && ` · ${data.seasonName}`}
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <div key={section.label} className="px-4 py-2">
            {/* Section header */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-bold text-gray-700">{section.label}</span>
              <button
                onClick={() => setShowRankInfo(true)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
              >
                Rank
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-400 text-gray-400 text-xs font-bold leading-none">?</span>
              </button>
            </div>
            {/* Stat rows */}
            {section.stats.map(({ key, label }) => (
              <StatRow key={key} label={label} entry={data[key]} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
