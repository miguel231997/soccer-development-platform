import { useAuth } from '../../context/AuthContext'

export default function ParentDashboardPage() {
  const { user } = useAuth()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Parent Dashboard</h1>
      <p className="text-gray-500">Welcome, {user?.username}.</p>
    </div>
  )
}
