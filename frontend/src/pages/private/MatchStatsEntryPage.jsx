import { useParams } from 'react-router-dom'

export default function MatchStatsEntryPage() {
  const { matchId } = useParams()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Match Stats Entry</h1>
      <p className="text-gray-500">Match ID: {matchId}</p>
    </div>
  )
}
