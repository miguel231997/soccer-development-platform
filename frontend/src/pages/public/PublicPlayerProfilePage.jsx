import { useParams } from 'react-router-dom'

export default function PublicPlayerProfilePage() {
  const { playerId } = useParams()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Player Profile</h1>
      <p className="text-gray-500">Player ID: {playerId}</p>
    </div>
  )
}
