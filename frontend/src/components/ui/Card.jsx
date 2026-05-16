export default function Card({ children, className = '', noPad = false }) {
  return (
    <div className={`bg-mig-surface border border-mig-border rounded-xl ${noPad ? '' : 'p-5'} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h3 className="text-sm font-semibold text-mig-text uppercase tracking-wider">{title}</h3>
        {subtitle && <p className="text-xs text-mig-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
