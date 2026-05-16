import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import FormError from '../../components/FormError'

const PASSWORD_HINT = 'Min 8 chars · uppercase · lowercase · number · special (!@#$)'

const inputCls = 'w-full bg-mig-bg border border-mig-border text-mig-text placeholder-mig-dim rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mig-orange/40 focus:border-mig-orange transition-colors'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', registrationCode: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await register(form)
      if (user?.role === 'PARENT') navigate('/parent')
      else navigate('/dashboard')
    } catch (err) {
      const body = err?.response?.data
      if (body?.data && typeof body.data === 'object') {
        const fieldErrors = Object.values(body.data)
        setError(fieldErrors[0] || 'Validation failed. Check your inputs.')
      } else {
        setError(body?.message || 'Registration failed. Check your registration code and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const FIELDS = [
    { name: 'firstName',        label: 'First name',        type: 'text',     placeholder: 'John' },
    { name: 'lastName',         label: 'Last name',         type: 'text',     placeholder: 'Smith' },
    { name: 'email',            label: 'Email',             type: 'email',    placeholder: 'you@example.com' },
    { name: 'password',         label: 'Password',          type: 'password', placeholder: '••••••••', hint: PASSWORD_HINT },
    { name: 'registrationCode', label: 'Registration code', type: 'text',     placeholder: 'Provided by your club' },
  ]

  return (
    <div className="min-h-screen bg-mig-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <span className="text-sm font-black bg-mig-orange text-white px-2 py-1 rounded">IQ</span>
            <span className="text-2xl font-black tracking-tight text-mig-text">PitchIQ</span>
          </div>
          <p className="text-sm text-mig-muted">Create your account</p>
          <p className="text-xs text-mig-dim mt-1">You need a registration code from your club administrator.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormError message={error} />

          {FIELDS.map(({ name, label, type, placeholder, hint }) => (
            <div key={name}>
              <label className="block text-xs font-semibold text-mig-muted uppercase tracking-wider mb-1.5">
                {label}
              </label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                required
                placeholder={placeholder}
                autoComplete={name === 'password' ? 'new-password' : name}
                className={inputCls}
              />
              {hint && <p className="mt-1.5 text-xs text-mig-dim">{hint}</p>}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mig-orange hover:bg-mig-orange-dark disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-center text-xs text-mig-muted pt-1">
            Already have an account?{' '}
            <Link to="/login" className="text-mig-orange hover:text-mig-orange-dark font-semibold">
              Sign in
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
