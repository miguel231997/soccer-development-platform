export default function PageHeader({ title, subtitle, back, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        {back && <div className="mb-2">{back}</div>}
        <h1 className="text-2xl font-black tracking-tight text-mig-text">{title}</h1>
        {subtitle && <p className="text-sm text-mig-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 mt-1">{action}</div>}
    </div>
  )
}

export function BackLink({ children, ...props }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-mig-muted hover:text-mig-orange transition-colors cursor-pointer font-medium uppercase tracking-wide" {...props}>
      ← {children}
    </span>
  )
}
