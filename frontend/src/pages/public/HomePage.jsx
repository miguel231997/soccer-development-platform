import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-mig-orange/10 border border-mig-orange/20 text-mig-orange text-xs font-semibold px-3 py-1.5 rounded-full mb-8 uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-mig-orange animate-pulse" />
        Player Development Intelligence Platform
      </div>

      {/* Brand lockup */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl font-black bg-mig-orange text-white px-2.5 py-1.5 rounded-lg">IQ</span>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-mig-text">PitchIQ</h1>
      </div>
      <p className="text-sm text-mig-dim font-semibold tracking-widest uppercase mb-2">by MIG Football</p>

      {/* Tagline */}
      <p className="text-xl sm:text-2xl font-bold text-mig-muted mt-4 mb-2">
        Track.{' '}
        <span className="text-mig-orange">Analyze.</span>{' '}
        Develop.
      </p>
      <p className="text-sm text-mig-dim max-w-md mt-2 mb-10 leading-relaxed">
        The intelligence platform built for competitive youth football academies.
        Data-driven player development, match analysis, and coaching tools in one place.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/stats"
          className="px-6 py-2.5 text-sm font-semibold bg-mig-orange hover:bg-mig-orange-dark text-white rounded-lg transition-colors"
        >
          View Leaderboard
        </Link>
        <Link
          to="/login"
          className="px-6 py-2.5 text-sm font-semibold border border-mig-border text-mig-muted hover:text-mig-text hover:border-mig-orange/50 rounded-lg transition-colors"
        >
          Sign In
        </Link>
      </div>

      {/* Divider */}
      <div className="mt-20 w-full max-w-2xl border-t border-mig-border pt-10">
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { label: 'Track', desc: 'Match stats, evaluations & development reports' },
            { label: 'Analyze', desc: 'Percentile rankings, season performance trends' },
            { label: 'Develop', desc: 'Coach-to-parent insights and player growth data' },
          ].map(({ label, desc }) => (
            <div key={label}>
              <p className="text-mig-orange font-black text-sm uppercase tracking-wider mb-1">{label}</p>
              <p className="text-xs text-mig-dim leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-12 text-xs text-mig-dim">
        Modern Innovation Growth · MIG Football
      </p>
    </div>
  )
}
