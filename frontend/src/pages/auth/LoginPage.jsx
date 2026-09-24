import { useState, useCallback } from 'react'
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
  const [showPassword, setShowPassword] = useState(false)
  const togglePassword = useCallback(() => setShowPassword((v) => !v), [])

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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="••••••••"
                className={inputCls(fieldErrors.password) + ' pr-10'}
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-mig-dim hover:text-mig-muted transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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
