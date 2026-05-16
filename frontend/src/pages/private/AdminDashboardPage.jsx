import { useCallback, useState } from 'react'
import {
  listClubs, createClub,
  listAllTeams, createTeam,
  listRegistrationCodes, createRegistrationCode, disableRegistrationCode,
  listTeamInviteCodes, createTeamInviteCode, disableTeamInviteCode,
  listRegistrationRequests, approveRegistrationRequest, rejectRegistrationRequest,
} from '../../api/admin'
import { useFetch } from '../../hooks/useFetch'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'
import FormError from '../../components/FormError'

const TABS = ['Clubs & Teams', 'Registration Codes', 'Team Codes', 'Player Requests']

const POSITIONS = ['GK','CB','LB','RB','LWB','RWB','CDM','CM','CAM','LM','RM','LW','RW','CF','ST']
const STRONG_FOOT = ['RIGHT','LEFT','BOTH']
const AGE_GROUPS = ['U6','U7','U8','U9','U10','U11','U12','U13','U14','U15','U16','U17','U18','U19','ADULT']
const GENDERS = ['MALE','FEMALE','COED']
const LEVELS = ['RECREATIONAL','COMPETITIVE','ELITE','ACADEMY']

// ── Reusable small bits ──────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="bg-mig-surface border border-mig-border rounded-lg p-5">
      <h3 className="text-base font-semibold text-mig-text mb-4">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-mig-muted mb-1">{label}</label>
      {children}
    </div>
  )
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full bg-mig-bg border border-mig-border text-mig-text placeholder-mig-dim rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mig-orange/40 focus:border-mig-orange transition-colors"
    />
  )
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full bg-mig-bg border border-mig-border text-mig-text rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mig-orange/40 focus:border-mig-orange transition-colors"
    >
      {children}
    </select>
  )
}

function Btn({ children, variant = 'primary', size = 'sm', disabled, ...props }) {
  const base = 'rounded-lg font-medium transition-colors disabled:opacity-50'
  const sz = size === 'xs' ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'
  const v = variant === 'primary'
    ? 'bg-mig-orange hover:bg-mig-orange-dark text-white'
    : variant === 'danger'
      ? 'bg-mig-danger/10 hover:bg-mig-danger/20 text-mig-danger border border-mig-danger/30'
      : 'border border-mig-border text-mig-muted hover:text-mig-text hover:border-mig-orange/30'
  return <button disabled={disabled} className={`${base} ${sz} ${v}`} {...props}>{children}</button>
}

// ── Clubs & Teams tab ────────────────────────────────────────────────────────

function ClubsTeamsTab() {
  const clubsFetcher = useCallback(() => listClubs(), [])
  const teamsFetcher = useCallback(() => listAllTeams(), [])
  const { data: clubs, loading: clubsLoading, error: clubsError, } = useFetch(clubsFetcher)
  const { data: teams, loading: teamsLoading, error: teamsError, } = useFetch(teamsFetcher)

  const [clubForm, setClubForm] = useState({ name: '', city: '', state: '' })
  const [teamForm, setTeamForm] = useState({ clubId: '', name: '', ageGroup: '', gender: '', competitiveLevel: '' })
  const [clubSaving, setClubSaving] = useState(false)
  const [teamSaving, setTeamSaving] = useState(false)
  const [clubErr, setClubErr] = useState('')
  const [teamErr, setTeamErr] = useState('')
  const [newClubs, setNewClubs] = useState([])
  const [newTeams, setNewTeams] = useState([])

  const allClubs = [...(clubs ?? []), ...newClubs]
  const allTeams = [...(teams ?? []), ...newTeams]

  const handleCreateClub = async (e) => {
    e.preventDefault(); setClubErr(''); setClubSaving(true)
    try {
      const created = await createClub(clubForm)
      setNewClubs((p) => [...p, created])
      setClubForm({ name: '', city: '', state: '' })
    } catch (err) {
      setClubErr(err?.response?.data?.message || 'Failed to create club.')
    } finally { setClubSaving(false) }
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault(); setTeamErr(''); setTeamSaving(true)
    try {
      const created = await createTeam({ ...teamForm, clubId: Number(teamForm.clubId) })
      setNewTeams((p) => [...p, created])
      setTeamForm({ clubId: '', name: '', ageGroup: '', gender: '', competitiveLevel: '' })
    } catch (err) {
      setTeamErr(err?.response?.data?.message || 'Failed to create team.')
    } finally { setTeamSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create club */}
        <Section title="Create Club">
          <FormError message={clubErr} />
          <form onSubmit={handleCreateClub} className="space-y-3">
            <Field label="Club name *">
              <Input value={clubForm.name} onChange={(e) => setClubForm((f) => ({ ...f, name: e.target.value }))} required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City">
                <Input value={clubForm.city} onChange={(e) => setClubForm((f) => ({ ...f, city: e.target.value }))} />
              </Field>
              <Field label="State">
                <Input value={clubForm.state} onChange={(e) => setClubForm((f) => ({ ...f, state: e.target.value }))} maxLength={2} />
              </Field>
            </div>
            <Btn type="submit" disabled={clubSaving}>{clubSaving ? 'Creating…' : 'Create Club'}</Btn>
          </form>
        </Section>

        {/* Create team */}
        <Section title="Create Team">
          <FormError message={teamErr} />
          <form onSubmit={handleCreateTeam} className="space-y-3">
            <Field label="Club *">
              <Select value={teamForm.clubId} onChange={(e) => setTeamForm((f) => ({ ...f, clubId: e.target.value }))} required>
                <option value="">Select club…</option>
                {allClubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Team name *">
              <Input value={teamForm.name} onChange={(e) => setTeamForm((f) => ({ ...f, name: e.target.value }))} required placeholder="e.g. 2015 Boys Orange" />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Age group *">
                <Select value={teamForm.ageGroup} onChange={(e) => setTeamForm((f) => ({ ...f, ageGroup: e.target.value }))} required>
                  <option value="">—</option>
                  {AGE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                </Select>
              </Field>
              <Field label="Gender *">
                <Select value={teamForm.gender} onChange={(e) => setTeamForm((f) => ({ ...f, gender: e.target.value }))} required>
                  <option value="">—</option>
                  {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                </Select>
              </Field>
              <Field label="Level *">
                <Select value={teamForm.competitiveLevel} onChange={(e) => setTeamForm((f) => ({ ...f, competitiveLevel: e.target.value }))} required>
                  <option value="">—</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </Select>
              </Field>
            </div>
            <Btn type="submit" disabled={teamSaving || allClubs.length === 0}>{teamSaving ? 'Creating…' : 'Create Team'}</Btn>
          </form>
        </Section>
      </div>

      {/* Clubs list */}
      <Section title={`All Clubs (${allClubs.length})`}>
        {clubsLoading && <Spinner label="Loading…" />}
        {clubsError && <ErrorAlert message={clubsError} />}
        {!clubsLoading && allClubs.length === 0 && <p className="text-sm text-mig-muted">No clubs yet.</p>}
        <div className="divide-y divide-mig-border">
          {allClubs.map((c) => (
            <div key={c.id} className="py-2 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-mig-text">{c.name}</p>
                {(c.city || c.state) && <p className="text-xs text-mig-dim">{[c.city, c.state].filter(Boolean).join(', ')}</p>}
              </div>
              <span className="text-xs text-mig-dim">id {c.id}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Teams list */}
      <Section title={`All Teams (${allTeams.length})`}>
        {teamsLoading && <Spinner label="Loading…" />}
        {teamsError && <ErrorAlert message={teamsError} />}
        {!teamsLoading && allTeams.length === 0 && <p className="text-sm text-mig-muted">No teams yet.</p>}
        <div className="divide-y divide-mig-border">
          {allTeams.map((t) => (
            <div key={t.id} className="py-2 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-mig-text">{t.name}</p>
                <p className="text-xs text-mig-dim">{t.clubName} · {t.ageGroup} · {t.gender} · {t.competitiveLevel}</p>
              </div>
              <span className="text-xs text-mig-dim">id {t.id}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ── Registration Codes tab ───────────────────────────────────────────────────

function RegistrationCodesTab() {
  const teamsFetcher = useCallback(() => listAllTeams(), [])
  const codesFetcher = useCallback(() => listRegistrationCodes(), [])
  const { data: teams } = useFetch(teamsFetcher)
  const { data: codes, loading, error } = useFetch(codesFetcher)

  const [form, setForm] = useState({ teamId: '', role: 'PARENT', maxUses: '20' })
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState('')
  const [localCodes, setLocalCodes] = useState([])
  const [disabling, setDisabling] = useState(null)
  const [copied, setCopied] = useState(null)

  const allCodes = [...(codes ?? []), ...localCodes]

  const handleCreate = async (e) => {
    e.preventDefault(); setFormErr(''); setSaving(true)
    try {
      const created = await createRegistrationCode({
        teamId: Number(form.teamId),
        role: form.role,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      })
      setLocalCodes((p) => {
        const alreadyExists = [...(codes ?? []), ...p].some((c) => c.id === created.id)
        return alreadyExists ? p : [created, ...p]
      })
    } catch (err) {
      setFormErr(err?.response?.data?.message || 'Failed to create code.')
    } finally { setSaving(false) }
  }

  const handleDisable = async (id) => {
    setDisabling(id)
    try {
      const updated = await disableRegistrationCode(id)
      setLocalCodes((p) => p.map((c) => c.id === id ? updated : c))
      // Force-update the fetched list entry
      if (codes) {
        const idx = codes.findIndex((c) => c.id === id)
        if (idx !== -1) codes[idx] = updated
      }
    } finally { setDisabling(null) }
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const active = allCodes.filter((c) => c.active)
  const inactive = allCodes.filter((c) => !c.active)

  return (
    <div className="space-y-6">
      <Section title="Generate Registration Code">
        <FormError message={formErr} />
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Team *">
              <Select value={form.teamId} onChange={(e) => setForm((f) => ({ ...f, teamId: e.target.value }))} required>
                <option value="">Select team…</option>
                {(teams ?? []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </Field>
            <Field label="Role *">
              <Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                <option value="COACH">Coach</option>
                <option value="PARENT">Parent</option>
              </Select>
            </Field>
            <Field label="Max uses">
              <Input type="number" min="1" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} placeholder="Unlimited" />
            </Field>
          </div>
          <Btn type="submit" disabled={saving || !form.teamId}>{saving ? 'Generating…' : 'Generate Code'}</Btn>
        </form>
      </Section>

      {loading && <Spinner label="Loading codes…" />}
      {error && <ErrorAlert message={error} />}

      <Section title={`Active Codes (${active.length})`}>
        {active.length === 0 && <p className="text-sm text-mig-muted">No active codes.</p>}
        <div className="divide-y divide-mig-border">
          {active.map((c) => (
            <div key={c.id} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-mig-orange text-sm tracking-wide">{c.code}</span>
                  <button onClick={() => copyCode(c.code)} className="text-xs text-mig-dim hover:text-mig-orange transition-colors">
                    {copied === c.code ? '✓ copied' : 'copy'}
                  </button>
                </div>
                <p className="text-xs text-mig-muted mt-0.5">
                  {c.teamName} · {c.role} · {c.usesCount}{c.maxUses ? `/${c.maxUses}` : ''} uses
                </p>
              </div>
              <Btn variant="ghost" size="xs" disabled={disabling === c.id} onClick={() => handleDisable(c.id)}>
                {disabling === c.id ? '…' : 'Disable'}
              </Btn>
            </div>
          ))}
        </div>
      </Section>

      {inactive.length > 0 && (
        <Section title={`Inactive Codes (${inactive.length})`}>
          <div className="divide-y divide-mig-border">
            {inactive.map((c) => (
              <div key={c.id} className="py-2 flex items-center justify-between opacity-50">
                <span className="font-mono text-sm line-through text-mig-dim">{c.code}</span>
                <span className="text-xs text-mig-dim">{c.teamName} · {c.role}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

// ── Team Codes tab ───────────────────────────────────────────────────────────
// These codes are for parents to link children to a team (separate from registration
// codes, which are for coach/parent account creation).

function TeamCodesTab() {
  const teamsFetcher = useCallback(() => listAllTeams(), [])
  const codesFetcher = useCallback(() => listTeamInviteCodes(), [])

  const { data: teams } = useFetch(teamsFetcher)
  const { data: codes, loading, error } = useFetch(codesFetcher)

  const [teamId, setTeamId] = useState('')
  const [maxUses, setMaxUses] = useState('20')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [localCodes, setLocalCodes] = useState(null)

  const allCodes = localCodes ?? codes ?? []
  const active   = allCodes.filter((c) => c.active)
  const inactive = allCodes.filter((c) => !c.active)

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaveError('')
    setSaving(true)
    try {
      const created = await createTeamInviteCode({
        teamId: Number(teamId),
        maxUses: maxUses ? Number(maxUses) : null,
      })
      setLocalCodes((prev) => {
        const current = prev ?? codes ?? []
        if (current.some((c) => c.id === created.id)) return current
        return [created, ...current]
      })
      setTeamId('')
      setMaxUses('20')
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Failed to create code.')
    } finally {
      setSaving(false)
    }
  }

  const handleDisable = async (id) => {
    try {
      const updated = await disableTeamInviteCode(id)
      setLocalCodes(allCodes.map((c) => (c.id === id ? updated : c)))
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      <Section title="Generate Team Code">
        <p className="text-sm text-mig-muted mb-4">
          Team codes let parents register their children to a specific team.
          They are separate from registration codes (which are for coach/parent accounts).
        </p>
        <FormError message={saveError} />
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Team *">
              <Select value={teamId} onChange={(e) => setTeamId(e.target.value)} required>
                <option value="">Select team…</option>
                {(teams ?? []).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Max uses">
              <Input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" />
            </Field>
          </div>
          <Btn type="submit" disabled={saving || !teamId}>{saving ? 'Generating…' : 'Generate Code'}</Btn>
        </form>
      </Section>

      {loading && <Spinner label="Loading codes…" />}
      {error && <ErrorAlert message={error} />}

      {active.length > 0 && (
        <Section title={`Active Codes (${active.length})`}>
          <div className="space-y-2">
            {active.map((c) => (
              <CodeRow key={c.id} code={c} onDisable={() => handleDisable(c.id)} />
            ))}
          </div>
        </Section>
      )}

      {inactive.length > 0 && (
        <Section title={`Inactive Codes (${inactive.length})`}>
          <div className="space-y-2 opacity-60">
            {inactive.map((c) => (
              <CodeRow key={c.id} code={c} disabled />
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

function CodeRow({ code, onDisable, disabled }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${disabled ? 'border-mig-border bg-mig-card' : 'border-mig-border bg-mig-bg'}`}>
      <div>
        <p className={`font-mono font-semibold text-sm ${disabled ? 'line-through text-mig-dim' : 'text-mig-text'}`}>
          {code.code}
        </p>
        <p className="text-xs text-mig-dim">
          {code.teamName} · {code.usesCount}/{code.maxUses ?? '∞'} uses
        </p>
      </div>
      {!disabled && (
        <div className="flex gap-2">
          <button onClick={copy}
            className="text-xs border border-mig-border rounded-lg px-2 py-1 text-mig-muted hover:text-mig-text hover:border-mig-orange/30 transition-colors">
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={onDisable}
            className="text-xs border border-mig-danger/30 text-mig-danger rounded-lg px-2 py-1 hover:bg-mig-danger/10 transition-colors">
            Disable
          </button>
        </div>
      )}
    </div>
  )
}

// ── Player Registration Requests tab ────────────────────────────────────────

const STATUS_STYLE = {
  PENDING:  'bg-mig-warning/10 text-mig-warning border border-mig-warning/20',
  APPROVED: 'bg-mig-success/10 text-mig-success border border-mig-success/20',
  REJECTED: 'bg-mig-danger/10 text-mig-danger border border-mig-danger/20',
}

function PlayerRequestsTab() {
  const fetcher = useCallback(() => listRegistrationRequests(), [])
  const { data: requests, loading, error } = useFetch(fetcher)
  const [localUpdates, setLocalUpdates] = useState({})
  const [acting, setActing] = useState(null)
  const [rejectId, setRejectId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const merge = (req) => ({ ...req, ...(localUpdates[req.id] ?? {}) })
  const all = (requests ?? []).map(merge)
  const pending = all.filter((r) => r.status === 'PENDING')
  const reviewed = all.filter((r) => r.status !== 'PENDING')

  const handleApprove = async (id) => {
    setActing(id)
    try {
      const updated = await approveRegistrationRequest(id)
      setLocalUpdates((p) => ({ ...p, [id]: updated }))
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to approve.')
    } finally { setActing(null) }
  }

  const handleReject = async () => {
    setActing(rejectId)
    try {
      const updated = await rejectRegistrationRequest(rejectId, rejectReason)
      setLocalUpdates((p) => ({ ...p, [rejectId]: updated }))
      setRejectId(null); setRejectReason('')
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to reject.')
    } finally { setActing(null) }
  }

  return (
    <div className="space-y-6">
      {loading && <Spinner label="Loading requests…" />}
      {error && <ErrorAlert message={error} />}

      <Section title={`Pending (${pending.length})`}>
        {pending.length === 0 && <p className="text-sm text-mig-muted">No pending requests.</p>}
        <div className="divide-y divide-mig-border">
          {pending.map((r) => (
            <RequestRow key={r.id} r={r} onApprove={() => handleApprove(r.id)} onReject={() => setRejectId(r.id)} acting={acting === r.id} />
          ))}
        </div>
      </Section>

      {reviewed.length > 0 && (
        <Section title={`Reviewed (${reviewed.length})`}>
          <div className="divide-y divide-mig-border">
            {reviewed.map((r) => <RequestRow key={r.id} r={r} reviewed />)}
          </div>
        </Section>
      )}

      {rejectId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-mig-surface border border-mig-border rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-semibold text-mig-text">Reject request</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason (optional)"
              rows={3}
              className="w-full bg-mig-bg border border-mig-border text-mig-text placeholder-mig-dim rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mig-danger/40 focus:border-mig-danger transition-colors"
            />
            <div className="flex gap-3 justify-end">
              <Btn variant="ghost" onClick={() => { setRejectId(null); setRejectReason('') }}>Cancel</Btn>
              <Btn variant="danger" disabled={acting} onClick={handleReject}>{acting ? 'Rejecting…' : 'Reject'}</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RequestRow({ r, onApprove, onReject, acting, reviewed }) {
  return (
    <div className="py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-sm text-mig-text">
            {r.firstName} {r.lastName}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_STYLE[r.status]}`}>{r.status}</span>
          </p>
          <p className="text-xs text-mig-muted mt-0.5">
            DOB: {r.dateOfBirth} · {r.primaryPosition}{r.jerseyNumber ? ` · #${r.jerseyNumber}` : ''}
          </p>
          <p className="text-xs text-mig-muted">
            Team: {r.teamName} · Parent: {r.parentUserName}
          </p>
          {r.rejectionReason && <p className="text-xs text-mig-danger mt-0.5">Reason: {r.rejectionReason}</p>}
        </div>
        {!reviewed && (
          <div className="flex gap-2 shrink-0">
            <Btn size="xs" disabled={acting} onClick={onApprove}>{acting ? '…' : 'Approve'}</Btn>
            <Btn size="xs" variant="ghost" disabled={acting} onClick={onReject}>Reject</Btn>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [tab, setTab] = useState(0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-mig-text">Admin Dashboard</h1>
        <p className="text-mig-muted text-sm mt-1">Manage clubs, teams, registration codes, and player requests.</p>
      </div>

      <div className="flex gap-1 border-b border-mig-border">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === i ? 'border-mig-orange text-mig-orange' : 'border-transparent text-mig-muted hover:text-mig-text'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && <ClubsTeamsTab />}
      {tab === 1 && <RegistrationCodesTab />}
      {tab === 2 && <TeamCodesTab />}
      {tab === 3 && <PlayerRequestsTab />}
    </div>
  )
}
