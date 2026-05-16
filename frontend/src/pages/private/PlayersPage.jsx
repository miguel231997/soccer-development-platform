import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listPlayers, listTeams, createPlayer } from '../../api/coach'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

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

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">New Player</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
              <input required value={form.firstName} onChange={set('firstName')}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
              <input required value={form.lastName} onChange={set('lastName')}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth *</label>
              <input required type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jersey #</label>
              <input type="number" min="1" max="99" value={form.jerseyNumber} onChange={set('jerseyNumber')}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary position *</label>
              <select required value={form.primaryPosition} onChange={set('primaryPosition')}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select…</option>
                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary position</label>
              <select value={form.secondaryPosition} onChange={set('secondaryPosition')}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">None</option>
                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Strong foot</label>
              <select value={form.strongFoot} onChange={set('strongFoot')}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {STRONG_FEET.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign to team</label>
              <select value={form.teamId} onChange={set('teamId')}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">No team yet</option>
                {(teams ?? []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-green-700 text-white rounded hover:bg-green-600 disabled:opacity-50">
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
        <h1 className="text-2xl font-bold text-gray-800">Players</h1>
        {canCreate && (
          <button onClick={() => setShowModal(true)}
            className="bg-green-700 text-white text-sm px-4 py-2 rounded hover:bg-green-600">
            + New Player
          </button>
        )}
      </div>

      {loading && <Spinner label="Loading players…" />}
      {error && <ErrorAlert message={error} />}

      {!loading && !error && active.length === 0 && (
        <p className="text-gray-500 text-sm">No active players found.</p>
      )}

      {!loading && !error && active.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
          {active.map((p) => {
            const team = activeTeam(p)
            return (
              <Link
                key={p.id}
                to={`/players/${p.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition"
              >
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0 overflow-hidden">
                  {p.profileImageUrl
                    ? <img src={p.profileImageUrl} alt="" className="w-full h-full object-cover" />
                    : `${p.firstName?.[0]}${p.lastName?.[0]}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{p.firstName} {p.lastName}</p>
                  <p className="text-xs text-gray-400">
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
