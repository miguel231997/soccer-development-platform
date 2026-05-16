export default function StatTile({ label, value, loading, accent, warn, sub }) {
  const valueColor = warn && value > 0
    ? 'text-mig-warning'
    : accent
      ? 'text-mig-orange'
      : 'text-mig-text'

  const borderColor = warn && value > 0 ? 'border-mig-warning/30' : 'border-mig-border'

  return (
    <div className={`bg-mig-surface border ${borderColor} rounded-xl p-4`}>
      <p className={`text-3xl font-black ${valueColor}`}>
        {loading ? <span className="text-mig-dim">—</span> : value}
      </p>
      <p className="text-xs text-mig-muted font-semibold uppercase tracking-wider mt-1">{label}</p>
      {sub && <p className="text-xs text-mig-dim mt-0.5">{sub}</p>}
    </div>
  )
}
