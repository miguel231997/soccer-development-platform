import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { lookupTeamInviteCode, submitPlayerRegistration } from '../../api/parent'

const POSITIONS = ['GK','CB','LB','RB','LWB','RWB','CDM','CM','CAM','LM','RM','LW','RW','CF','ST']

export default function RegisterChildPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('code') // 'code' | 'details'
  const [teamInfo, setTeamInfo] = useState(null) // { teamId, teamName, code }
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)

  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '',
    primaryPosition: '', secondaryPosition: '', strongFoot: 'RIGHT', jerseyNumber: '',
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const handleCodeLookup = async (e) => {
    e.preventDefault()
    setCodeError('')
    setCodeLoading(true)
    try {
      const info = await lookupTeamInviteCode(codeInput.trim())
      setTeamInfo({ ...info, code: codeInput.trim() })
      setStep('details')
    } catch (err) {
      setCodeError(err?.response?.data?.message || 'Invalid or inactive team code.')
    } finally {
      setCodeLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      await submitPlayerRegistration({
        teamInviteCode: teamInfo.code,
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        primaryPosition: form.primaryPosition,
        secondaryPosition: form.secondaryPosition || null,
        strongFoot: form.strongFoot || null,
        jerseyNumber: form.jerseyNumber ? Number(form.jerseyNumber) : null,
      })
      navigate('/parent/children', { state: { registered: `${form.firstName} ${form.lastName}` } })
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to submit. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/parent/children')}
          className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
        <h1 className="text-2xl font-bold text-gray-800">Register a Child</h1>
      </div>

      {step === 'code' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-gray-700">Step 1 — Enter team code</h2>
            <p className="text-sm text-gray-500 mt-1">
              Ask your club administrator for the team's player registration code.
              This code is different from the code you used to create your account.
            </p>
          </div>
          {codeError && <p className="text-red-600 text-sm">{codeError}</p>}
          <form onSubmit={handleCodeLookup} className="flex gap-3">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. A1B2C3D4"
              required
              className="flex-1 border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button type="submit" disabled={codeLoading || !codeInput.trim()}
              className="bg-green-700 text-white text-sm px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50">
              {codeLoading ? 'Checking…' : 'Next'}
            </button>
          </form>
        </div>
      )}

      {step === 'details' && teamInfo && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Team: {teamInfo.teamName}</p>
              <p className="text-xs text-green-600">Code verified. Fill in your child's details below.</p>
            </div>
            <button onClick={() => { setStep('code'); setTeamInfo(null) }}
              className="text-xs text-green-700 underline">Change</button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-gray-700">Step 2 — Child's details</h2>
            {formError && <p className="text-red-600 text-sm">{formError}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
                  <input type="text" value={form.firstName} onChange={set('firstName')} required
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
                  <input type="text" value={form.lastName} onChange={set('lastName')} required
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth *</label>
                  <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} required
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jersey number</label>
                  <input type="number" min="1" max="99" value={form.jerseyNumber} onChange={set('jerseyNumber')}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary position *</label>
                  <select value={form.primaryPosition} onChange={set('primaryPosition')} required
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">—</option>
                    {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secondary position</label>
                  <select value={form.secondaryPosition} onChange={set('secondaryPosition')}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">—</option>
                    {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Strong foot</label>
                  <select value={form.strongFoot} onChange={set('strongFoot')}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="RIGHT">Right</option>
                    <option value="LEFT">Left</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="bg-green-700 text-white text-sm px-5 py-2 rounded hover:bg-green-600 disabled:opacity-50">
                  {saving ? 'Submitting…' : 'Submit Registration Request'}
                </button>
                <button type="button" onClick={() => navigate('/parent/children')}
                  className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
