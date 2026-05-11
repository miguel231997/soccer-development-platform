import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-green-800 mb-4">Soccer Development Platform</h1>
      <p className="text-gray-600 mb-8">Track players, matches, and team performance.</p>
      <div className="flex justify-center gap-4">
        <Link to="/stats" className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-600">
          View Stats
        </Link>
        <Link to="/login" className="border border-green-700 text-green-700 px-6 py-2 rounded hover:bg-green-50">
          Sign In
        </Link>
      </div>
    </div>
  )
}
