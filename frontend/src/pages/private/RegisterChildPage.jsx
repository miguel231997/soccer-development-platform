import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { listMyTeams, listTeamPlayersById, joinTeam, submitPlayerRegistration } from '../../api/parent'
import FormError from '../../components/FormError'
import Spinner from '../../components/Spinner'

const POSITIONS = ['GK','CB','LB','RB','LWB','RWB','CDM','CM','CAM','LM','RM','LW','RW','CF','ST']

export default function RegisterChildPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // steps: 'team' → 'select' → 'details'
  const [step, setStep] = useState('team')
  const [teamInfo, setTeamInfo] = useState(null)   // { teamId, teamName }
  const [teamPlayers, setTeamPlayers] = useState([])
  const [playersLoading, setPlayersLoading] = useState(false)

  // For parents who arrive here post-registration (team already known)
  // or for team picker (existing parents)
  const [myTeams, setMyTeams] = useState([])
  const [teamsLoading, setTeamsLoading] = useState(false)

  // For existing parents joining an additional team via code
  const [joinCode, setJoinCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [showJoinCode, setShowJoinCode] = useState(false)

  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '',
    primaryPosition: '', secondaryPosition: '', strongFoot: 'RIGHT', jerseyNumber: '',
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  // If coming from registration with team pre-filled, skip straight to player select
  useEffect(() => {
    const { teamId, teamName } = location.state ?? {}
    if (teamId && teamName) {
      selectTeam({ teamId, teamName })
    } else {
      loadMyTeams()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMyTeams = async () => {
    setTeamsLoading(true)
    try {
      const teams = await listMyTeams()
      setMyTeams(teams ?? [])
    } finally {
      setTeamsLoading(false)
    }
  }

  const selectTeam = async ({ teamId, teamName }) => {
    setTeamInfo({ teamId, teamName })
    setPlayersLoading(true)
    try {
      const players = await listTeamPlayersById(teamId)
      setTeamPlayers(players ?? [])
    } finally {
      setPlayersLoading(false)
    }
    setStep('select')
  }

  const handleJoinCode = async (e) => {
    e.preventDefault()
    setJoinError('')
    setJoinLoading(true)
    try {
      const result = await joinTeam(joinCode.trim())
      await selectTeam({ teamId: result.teamId, teamName: result.teamName })
      setJoinCode('')
      setShowJoinCode(false)
    } catch (err) {
      setJoinError(err?.response?.data?.message || 'Invalid or inactive code.')
    } finally {
      setJoinLoading(false)
    }
  }

  const handleSelectExisting = async (player) => {
    setFormError('')
    setSaving(true)
    try {
      await submitPlayerRegistration({ teamId: teamInfo.teamId, existingPlayerId: player.id })
      navigate('/parent/children', { state: { registered: `${player.firstName} ${player.lastName}` } })
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to submit. Please try again.')
      setSaving(false)
    }
  }

  const handleSubmitNew = async (e) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      await submitPlayerRegistration({
        teamId: teamInfo.teamId,
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

  const inputCls = "w-full bg-mig-bg border border-mig-border text-mig-text placeholder-mig-dim rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mig-orange/40 focus:border-mig-orange transition-colors"

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/parent/children')}
          className="text-xs text-mig-muted hover:text-mig-orange transition-colors font-medium uppercase tracking-wide">← Back</button>
        <h1 className="text-2xl font-black tracking-tight text-mig-text">Register a Child</h1>
      </div>

      {/* Step 1 — Pick a team */}
      {step === 'team' && (
        <div className="bg-mig-surface border border-mig-border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-mig-text">Which team is your child on?</h2>
            <p className="text-sm text-mig-muted mt-1">Select one of your teams below.</p>
          </div>

          {teamsLoading && <Spinner label="Loading teams…" />}

          {!teamsLoading && myTeams.length > 0 && (
            <ul className="divide-y divide-mig-border border border-mig-border rounded-xl overflow-hidden">
              {myTeams.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => selectTeam({ teamId: t.id, teamName: t.name })}
                    className="w-full text-left px-4 py-3 hover:bg-mig-card transition-colors"
                  >
                    <p className="font-medium text-mig-text">{t.name}</p>
                    <p className="text-xs text-mig-dim">{t.clubName}{t.ageGroup && ` · ${t.ageGroup}`}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!teamsLoading && myTeams.length === 0 && (
            <p className="text-sm text-mig-muted italic">You haven't joined any teams yet. Use a registration code below to join your child's team.</p>
          )}

          {/* Join a new team via code */}
          <div className="pt-2 border-t border-mig-border">
            {!showJoinCode ? (
              <button onClick={() => setShowJoinCode(true)} className="text-sm text-mig-orange hover:underline">
                My child's team isn't listed — join with a code →
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-mig-muted">Enter the registration code your club admin gave you.</p>
                <FormError message={joinError} />
                <form onSubmit={handleJoinCode} className="flex gap-3">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="e.g. A1B2C3D4"
                    required
                    className={`flex-1 ${inputCls} font-mono`}
                  />
                  <button type="submit" disabled={joinLoading || !joinCode.trim()}
                    className="bg-mig-orange hover:bg-mig-orange-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                    {joinLoading ? 'Joining…' : 'Join'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2 — Select existing player or add new */}
      {step === 'select' && teamInfo && (
        <div className="space-y-4">
          <TeamBanner teamInfo={teamInfo} onReset={() => { setStep('team'); setTeamInfo(null) }} />

          <div className="bg-mig-surface border border-mig-border rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-mig-text">Is your child already on this team?</h2>
            <p className="text-sm text-mig-muted">
              If a coach has already added your child, select them below to request a parent link.
              Otherwise, add them as a new player.
            </p>

            <FormError message={formError} />

            {playersLoading && <Spinner label="Loading roster…" />}

            {!playersLoading && teamPlayers.length > 0 && (
              <ul className="divide-y divide-mig-border border border-mig-border rounded-xl overflow-hidden">
                {teamPlayers.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-mig-card transition-colors">
                    <div className="w-9 h-9 rounded-full bg-mig-orange/20 overflow-hidden flex-shrink-0 flex items-center justify-center text-mig-orange font-bold text-sm">
                      {p.profileImageUrl
                        ? <img src={p.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        : <PersonIcon />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-mig-text">
                        {p.firstName} {p.lastName}
                        {p.jerseyNumber != null && (
                          <span className="ml-1.5 text-xs font-mono bg-mig-orange text-white px-1.5 py-0.5 rounded">
                            #{p.jerseyNumber}
                          </span>
                        )}
                      </p>
                      {p.primaryPosition && <p className="text-xs text-mig-dim">{p.primaryPosition}</p>}
                    </div>
                    <button
                      onClick={() => handleSelectExisting(p)}
                      disabled={saving}
                      className="text-sm bg-mig-orange hover:bg-mig-orange-dark text-white font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                    >
                      This is my child
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!playersLoading && teamPlayers.length === 0 && (
              <p className="text-sm text-mig-muted italic">No players have been added to this team yet.</p>
            )}

            <div className="pt-2 border-t border-mig-border">
              <button onClick={() => setStep('details')} className="text-sm text-mig-orange hover:underline">
                My child isn't listed — add them as a new player →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — New child details form */}
      {step === 'details' && teamInfo && (
        <div className="space-y-4">
          <TeamBanner teamInfo={teamInfo} onReset={() => { setStep('team'); setTeamInfo(null) }} />

          <div className="bg-mig-surface border border-mig-border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep('select')} className="text-xs text-mig-muted hover:text-mig-orange transition-colors font-medium uppercase tracking-wide">← Back</button>
              <h2 className="font-semibold text-mig-text">Child's details</h2>
            </div>
            <FormError message={formError} />

            <form onSubmit={handleSubmitNew} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-mig-muted mb-1">First name *</label>
                  <input type="text" value={form.firstName} onChange={set('firstName')} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-mig-muted mb-1">Last name *</label>
                  <input type="text" value={form.lastName} onChange={set('lastName')} required className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-mig-muted mb-1">Date of birth *</label>
                  <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-mig-muted mb-1">Jersey number</label>
                  <input type="number" min="1" max="99" value={form.jerseyNumber} onChange={set('jerseyNumber')} className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-mig-muted mb-1">Primary position *</label>
                  <select value={form.primaryPosition} onChange={set('primaryPosition')} required className={inputCls}>
                    <option value="">—</option>
                    {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-mig-muted mb-1">Secondary position</label>
                  <select value={form.secondaryPosition} onChange={set('secondaryPosition')} className={inputCls}>
                    <option value="">—</option>
                    {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-mig-muted mb-1">Strong foot</label>
                  <select value={form.strongFoot} onChange={set('strongFoot')} className={inputCls}>
                    <option value="RIGHT">Right</option>
                    <option value="LEFT">Left</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="bg-mig-orange hover:bg-mig-orange-dark text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50">
                  {saving ? 'Submitting…' : 'Submit Registration Request'}
                </button>
                <button type="button" onClick={() => navigate('/parent/children')}
                  className="text-sm border border-mig-border text-mig-muted hover:text-mig-text hover:border-mig-orange/30 px-4 py-2 rounded-lg transition-colors">
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

function TeamBanner({ teamInfo, onReset }) {
  return (
    <div className="bg-mig-success/10 border border-mig-success/20 rounded-lg px-4 py-3 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-mig-success">Team: {teamInfo.teamName}</p>
      </div>
      <button onClick={onReset} className="text-xs text-mig-success underline">Change</button>
    </div>
  )
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  )
}
