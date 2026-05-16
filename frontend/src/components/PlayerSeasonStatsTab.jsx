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
  if (pct >= 75) return 'bg-mig-success'
  if (pct >= 40) return 'bg-mig-orange'
  return 'bg-mig-danger'
}

function StatRow({ label, entry }) {
  if (!entry) return null
  const { value, percentile } = entry
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-mig-border last:border-0">
      <span className="flex-1 text-sm text-mig-muted">{label}</span>
      <span className="w-8 text-right text-sm font-bold text-mig-text shrink-0">{value}</span>
      <div className="w-28 shrink-0">
        <div className="h-1.5 rounded-full bg-mig-border overflow-hidden">
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
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-mig-surface border border-mig-border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-mig-text">About Rank</h2>
          <button onClick={onClose} className="text-mig-orange font-semibold text-sm hover:text-mig-orange-dark">Done</button>
        </div>
        <p className="text-sm text-mig-muted leading-relaxed">
          Rank shows how this player compares to other players in the same team, season, and age group for each stat.
        </p>
        <div className="space-y-2 text-sm text-mig-muted">
          <p><span className="font-semibold text-mig-success">Green</span> — among the best for that stat.</p>
          <p><span className="font-semibold text-mig-orange">Orange</span> — middle range.</p>
          <p><span className="font-semibold text-mig-danger">Red</span> — among the lowest.</p>
        </div>
        <p className="text-sm text-mig-muted leading-relaxed">
          For stats where fewer is better (fouls, dispossessed), lower numbers produce a higher rank.
        </p>
      </div>
    </div>
  )
}

export default function PlayerSeasonStatsTab({ data, loading, error }) {
  const [showRankInfo, setShowRankInfo] = useState(false)

  if (loading) return <Spinner label="Loading season stats…" />
  if (error)   return <ErrorAlert message={error} />
  if (!data)   return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-semibold text-mig-muted">No season statistics recorded yet.</p>
    </div>
  )

  return (
    <div className="space-y-5">
      {showRankInfo && <RankModal onClose={() => setShowRankInfo(false)} />}

      <div className="bg-mig-surface border border-mig-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-mig-border">
          <h2 className="text-sm font-bold text-mig-text uppercase tracking-wider">Season Performance</h2>
          <p className="text-xs text-mig-muted mt-0.5">
            Compared to teammates in the same season
            {data.seasonName && ` · ${data.seasonName}`}
          </p>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.label} className="px-5 py-3 border-b border-mig-border last:border-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-mig-muted uppercase tracking-wider">{section.label}</span>
              <button
                onClick={() => setShowRankInfo(true)}
                className="flex items-center gap-1 text-xs text-mig-dim hover:text-mig-muted transition-colors"
              >
                Rank
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-mig-dim text-mig-dim text-xs font-bold">?</span>
              </button>
            </div>
            {section.stats.map(({ key, label }) => (
              <StatRow key={key} label={label} entry={data[key]} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
