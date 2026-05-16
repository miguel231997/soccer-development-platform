import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import FormError from '../../components/FormError'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((fe) => ({ ...fe, [name]: '' }))
    if (formError) setFormError('')
  }

  const validate = () => {
    const errors = { email: '', password: '' }
    if (!form.email.trim()) {
      errors.email = 'Email is required.'
    } else if (!isValidEmail(form.email)) {
      errors.email = 'Enter a valid email address (e.g. name@example.com).'
    }
    if (!form.password) {
      errors.password = 'Password is required.'
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    const errors = validate()
    if (errors.email || errors.password) {
      setFieldErrors(errors)
      return
    }
    setLoading(true)
    try {
      const user = await login(form.email.trim(), form.password)
      if (user?.role === 'ADMIN')  navigate('/admin')
      else if (user?.role === 'PARENT') navigate('/parent')
      else navigate('/dashboard')
    } catch {
      setForm((f) => ({ ...f, password: '' }))
      setFormError('Email or password is incorrect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign In</h1>
      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-lg shadow p-6 space-y-4">
        {formError && <FormError message={formError} />}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="text"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            inputMode="email"
            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
              fieldErrors.email ? 'border-red-400 focus:ring-red-400' : ''
            }`}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
              fieldErrors.password ? 'border-red-400 focus:ring-red-400' : ''
            }`}
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <p className="text-sm text-center text-gray-500">
          No account?{' '}
          <Link to="/register" className="text-green-700 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}
