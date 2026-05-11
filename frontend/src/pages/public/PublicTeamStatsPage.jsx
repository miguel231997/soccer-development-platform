import { useParams } from 'react-router-dom'

export default function PublicTeamStatsPage() {
  const { teamId } = useParams()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Team Stats</h1>
      <p className="text-gray-500">Team ID: {teamId}</p>
    </div>
  )
}
