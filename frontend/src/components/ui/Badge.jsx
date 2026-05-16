/**
 * variant: 'orange' | 'success' | 'warning' | 'danger' | 'gray' | 'blue' | 'default'
 */
export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    orange:  'bg-mig-orange/15 text-mig-orange border border-mig-orange/20',
    success: 'bg-mig-success/10 text-mig-success border border-mig-success/20',
    warning: 'bg-mig-warning/10 text-mig-warning border border-mig-warning/20',
    danger:  'bg-mig-danger/10 text-mig-danger border border-mig-danger/20',
    gray:    'bg-mig-card text-mig-muted border border-mig-border',
    blue:    'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    default: 'bg-mig-card text-mig-muted border border-mig-border',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
