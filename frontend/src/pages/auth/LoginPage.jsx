import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import FormError from '../../components/FormError'

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

const inputCls = (err) =>
  `w-full bg-mig-bg border ${err ? 'border-mig-danger' : 'border-mig-border'} text-mig-text placeholder-mig-dim rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${err ? 'focus:ring-mig-danger/40' : 'focus:ring-mig-orange/40'} focus:border-mig-orange transition-colors`

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
    if (!form.email.trim()) errors.email = 'Email is required.'
    else if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address (e.g. name@example.com).'
    if (!form.password) errors.password = 'Password is required.'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    const errors = validate()
    if (errors.email || errors.password) { setFieldErrors(errors); return }
    setLoading(true)
    try {
      const user = await login(form.email.trim(), form.password)
      if (user?.role === 'ADMIN')   navigate('/admin')
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
    <div className="min-h-screen bg-mig-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <span className="text-sm font-black bg-mig-orange text-white px-2 py-1 rounded">IQ</span>
            <span className="text-2xl font-black tracking-tight text-mig-text">PitchIQ</span>
          </div>
          <p className="text-sm text-mig-muted">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormError message={formError} />

          <div>
            <label className="block text-xs font-semibold text-mig-muted uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="text"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              className={inputCls(fieldErrors.email)}
            />
            {fieldErrors.email && <p className="mt-1.5 text-xs text-mig-danger">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-mig-muted uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder="••••••••"
              className={inputCls(fieldErrors.password)}
            />
            {fieldErrors.password && <p className="mt-1.5 text-xs text-mig-danger">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mig-orange hover:bg-mig-orange-dark disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-center text-xs text-mig-muted pt-1">
            No account?{' '}
            <Link to="/register" className="text-mig-orange hover:text-mig-orange-dark font-semibold">
              Get started
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-mig-dim mt-8">
          MIG Player IQ · by MIG Football
        </p>
      </div>
    </div>
  )
}
