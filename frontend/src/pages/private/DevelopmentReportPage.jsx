import { useParams } from 'react-router-dom'

export default function DevelopmentReportPage() {
  const { playerId } = useParams()
  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-mig-text mb-4">Development Report</h1>
      <p className="text-mig-muted">Player ID: {playerId}</p>
    </div>
  )
}
