import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isCoach = user && (hasRole('ROLE_COACH') || hasRole('ROLE_ADMIN') || hasRole('ROLE_DIRECTOR'))

  return (
    <nav className="bg-green-800 text-white px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold tracking-tight">
        Soccer Dev Platform
      </Link>

      <div className="flex items-center gap-4 text-sm">
        <Link to="/stats" className="hover:text-green-200">Stats</Link>

        {!user ? (
          <>
            <Link to="/login" className="hover:text-green-200">Login</Link>
            <Link to="/register" className="bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded">
              Register
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="hover:text-green-200">Dashboard</Link>
            {isCoach && (
              <>
                <Link to="/teams" className="hover:text-green-200">Teams</Link>
                <Link to="/matches" className="hover:text-green-200">Matches</Link>
                <Link to="/players" className="hover:text-green-200">Players</Link>
              </>
            )}
            {hasRole('ROLE_ADMIN') && (
              <Link to="/admin" className="hover:text-green-200">Admin</Link>
            )}
            <span className="text-green-300">|</span>
            <span className="text-green-200 text-xs">{user.username}</span>
            <button onClick={handleLogout} className="hover:text-green-200">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
