import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // Backend LoginRequest field is "email", not "username".
  // Backend wraps every response in ApiResponse<T>, so the payload is at data.data.
  // AuthResponse shape: { token, id, email, firstName, lastName, role }
  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    const authResponse = data.data          // unwrap ApiResponse
    const { token, ...userFields } = authResponse
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userFields))
    setUser(userFields)
    return userFields
  }

  // RegisterRequest: { email, password, firstName, lastName, registrationCode }
  const register = async (payload) => {
    const { data } = await api.post('/api/auth/register', payload)
    const authResponse = data.data
    const { token, ...userFields } = authResponse
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userFields))
    setUser(userFields)
    return userFields
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // user.role from AuthResponse is the enum name, e.g. "ADMIN".
  // Callers pass Spring Security style role strings, e.g. "ROLE_ADMIN".
  const hasRole = (role) => {
    if (!user?.role) return false
    return `ROLE_${user.role}` === role
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
