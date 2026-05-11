import { useAuth } from '../../context/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-500">Welcome, {user?.username}.</p>
    </div>
  )
}
