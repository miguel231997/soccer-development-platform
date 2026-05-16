import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import FormError from '../../components/FormError'

const PASSWORD_HINT = 'Min 8 characters · uppercase · lowercase · number · special character (e.g. !@#$)'

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
      // Spring @Valid returns { message: "Validation failed", data: { field: "msg" } }
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
    { name: 'firstName',        label: 'First name',        type: 'text' },
    { name: 'lastName',         label: 'Last name',         type: 'text' },
    { name: 'email',            label: 'Email',             type: 'email' },
    { name: 'password',         label: 'Password',          type: 'password', hint: PASSWORD_HINT },
    { name: 'registrationCode', label: 'Registration code', type: 'text' },
  ]

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Create Account</h1>
      <p className="text-sm text-center text-gray-500 mb-6">
        You need a registration code from your club administrator.
      </p>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <FormError message={error} />

        {FIELDS.map(({ name, label, type, hint }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              name={name}
              value={form[name]}
              onChange={handleChange}
              required
              autoComplete={name === 'password' ? 'new-password' : name}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {hint && (
              <p className="mt-1 text-xs text-gray-400">{hint}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Register'}
        </button>
        <p className="text-sm text-center text-gray-500">
          Have an account?{' '}
          <Link to="/login" className="text-green-700 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
