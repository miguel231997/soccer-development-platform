import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listPlayers, listTeams, createPlayer } from '../../api/coach'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'
import FormError from '../../components/FormError'

const POSITIONS = ['GK','CB','LB','RB','LWB','RWB','CDM','CM','CAM','LM','RM','LW','RW','CF','ST']
const STRONG_FEET = ['RIGHT','LEFT','BOTH']

function NewPlayerModal({ onClose, onCreated }) {
  const teamsFetcher = useCallback(() => listTeams(), [])
  const { data: teams } = useFetch(teamsFetcher)

  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', primaryPosition: '',
    secondaryPosition: '', strongFoot: 'RIGHT', jerseyNumber: '', teamId: '',
    publicProfileEnabled: false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        primaryPosition: form.primaryPosition,
        secondaryPosition: form.secondaryPosition || null,
        strongFoot: form.strongFoot,
        jerseyNumber: form.jerseyNumber ? Number(form.jerseyNumber) : null,
        teamId: form.teamId ? Number(form.teamId) : null,
        publicProfileEnabled: form.publicProfileEnabled,
      }
      const player = await createPlayer(payload)
      onCreated(player)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create player.')
    } finally { setSaving(false) }
  }

  const inputCls = "w-full bg-mig-bg border border-mig-border text-mig-text placeholder-mig-dim rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mig-orange/40 focus:border-mig-orange transition-colors"

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-mig-surface border border-mig-border rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-mig-border">
          <h2 className="text-lg font-semibold text-mig-text">New Player</h2>
          <button onClick={onClose} className="text-mig-muted hover:text-mig-text transition-colors text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <FormError message={error} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-mig-muted mb-1">First name *</label>
              <input required value={form.firstName} onChange={set('firstName')} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-mig-muted mb-1">Last name *</label>
              <input required value={form.lastName} onChange={set('lastName')} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-mig-muted mb-1">Date of birth *</label>
              <input required type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-mig-muted mb-1">Jersey #</label>
              <input type="number" min="1" max="99" value={form.jerseyNumber} onChange={set('jerseyNumber')} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-mig-muted mb-1">Primary position *</label>
              <select required value={form.primaryPosition} onChange={set('primaryPosition')} className={inputCls}>
                <option value="">Select…</option>
                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-mig-muted mb-1">Secondary position</label>
              <select value={form.secondaryPosition} onChange={set('secondaryPosition')} className={inputCls}>
                <option value="">None</option>
                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-mig-muted mb-1">Strong foot</label>
              <select value={form.strongFoot} onChange={set('strongFoot')} className={inputCls}>
                {STRONG_FEET.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-mig-muted mb-1">Assign to team</label>
              <select value={form.teamId} onChange={set('teamId')} className={inputCls}>
                <option value="">No team yet</option>
                {(teams ?? []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm border border-mig-border text-mig-muted hover:text-mig-text hover:border-mig-orange/30 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-mig-orange hover:bg-mig-orange-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
              {saving ? 'Creating…' : 'Create Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PlayersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [playersKey, setPlayersKey] = useState(0)
  const canCreate = user?.role === 'COACH' || user?.role === 'ADMIN' || user?.role === 'DIRECTOR'

  const fetcher = useCallback(() => listPlayers(), [playersKey])
  const { data: players, loading, error } = useFetch(fetcher)

  const active = (players ?? []).filter((p) => p.active)
  const activeTeam = (p) => p.teams?.find((t) => t.active)

  const handleCreated = (player) => {
    setShowModal(false)
    navigate(`/players/${player.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight text-mig-text">Players</h1>
        {canCreate && (
          <button onClick={() => setShowModal(true)}
            className="bg-mig-orange hover:bg-mig-orange-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            + New Player
          </button>
        )}
      </div>

      {loading && <Spinner label="Loading players…" />}
      {error && <ErrorAlert message={error} />}

      {!loading && !error && active.length === 0 && (
        <p className="text-mig-muted text-sm">No active players found.</p>
      )}

      {!loading && !error && active.length > 0 && (
        <div className="bg-mig-surface border border-mig-border rounded-xl overflow-hidden divide-y divide-mig-border">
          {active.map((p) => {
            const team = activeTeam(p)
            return (
              <Link
                key={p.id}
                to={`/players/${p.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-mig-card transition"
              >
                <div className="w-9 h-9 rounded-full bg-mig-orange/20 flex items-center justify-center text-mig-orange font-bold text-sm shrink-0 overflow-hidden">
                  {p.profileImageUrl
                    ? <img src={p.profileImageUrl} alt="" className="w-full h-full object-cover" />
                    : `${p.firstName?.[0]}${p.lastName?.[0]}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-mig-text">{p.firstName} {p.lastName}</p>
                  <p className="text-xs text-mig-dim">
                    {p.primaryPosition ?? '—'}
                    {p.jerseyNumber != null && ` · #${p.jerseyNumber}`}
                    {team && ` · ${team.teamName}`}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {showModal && (
        <NewPlayerModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </div>
  )
}
