import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getChild,
  getChildStats,
  getChildEvaluations,
  getChildReports,
  getChildSeasonStats,
  lookupTeamInviteCode,
  submitPlayerRegistration,
  uploadChildImage,
  setChildPublicProfile,
} from '../../api/parent'
import { useFetch } from '../../hooks/useFetch'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'
import PlayerSeasonStatsTab from '../../components/PlayerSeasonStatsTab'

const RATINGS = [
  { key: 'technicalRating',      label: 'Technical' },
  { key: 'tacticalRating',       label: 'Tactical' },
  { key: 'physicalRating',       label: 'Physical' },
  { key: 'mentalityRating',      label: 'Mentality' },
  { key: 'attackingRating',      label: 'Attacking' },
  { key: 'defendingRating',      label: 'Defending' },
  { key: 'decisionMakingRating', label: 'Decision' },
  { key: 'workRateRating',       label: 'Work Rate' },
]

function ratingColor(v) {
  if (v >= 8) return 'text-green-600'
  if (v >= 5) return 'text-blue-600'
  return 'text-red-500'
}

const STAT_COLS = [
  { key: 'opponent',      label: 'vs' },
  { key: 'minutesPlayed', label: 'Min' },
  { key: 'goals',         label: 'G' },
  { key: 'assists',       label: 'A' },
  { key: 'shots',         label: 'Shots' },
  { key: 'shotsOnTarget', label: 'SoT' },
  { key: 'saves',         label: 'Saves' },
  { key: 'cleanSheet',    label: 'CS' },
  { key: 'xg',            label: 'xG', decimal: true },
]

export default function ChildDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('matches')
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [joinOpen, setJoinOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const [publicProfile, setPublicProfile] = useState(null)
  const [togglingPublic, setTogglingPublic] = useState(false)
  const photoInputId = `photo-${id}`

  const handleTogglePublic = async () => {
    setTogglingPublic(true)
    try {
      const updated = await setChildPublicProfile(id, !isPublic)
      setPublicProfile(updated.publicProfileEnabled)
    } catch { /* silent */ }
    finally { setTogglingPublic(false) }
  }

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploadErr(''); setUploading(true)
    try {
      const updated = await uploadChildImage(id, file)
      setImageUrl(updated.profileImageUrl)
    } catch (err) {
      setUploadErr(err?.response?.data?.message || 'Upload failed.')
    } finally { setUploading(false) }
  }

  const childFetcher      = useCallback(() => getChild(id),            [id])
  const statsFetcher      = useCallback(() => getChildStats(id),       [id])
  const evalsFetcher      = useCallback(() => getChildEvaluations(id), [id])
  const reportsFetcher    = useCallback(() => getChildReports(id),     [id])
  const seasonStatsFetcher = useCallback(() => getChildSeasonStats(id), [id])

  const { data: child,       loading: cLoading,  error: cError }  = useFetch(childFetcher)
  const { data: stats,       loading: sLoading,  error: sError }  = useFetch(statsFetcher)
  const { data: evals,       loading: eLoading,  error: eError }  = useFetch(evalsFetcher)
  const { data: reports,     loading: rLoading,  error: rError }  = useFetch(reportsFetcher)
  const { data: seasonStats, loading: ssLoading, error: ssError } = useFetch(seasonStatsFetcher)

  const isPublic = publicProfile ?? child?.publicProfileEnabled ?? false

  const teams = child?.teams ?? []
  const activeTeamId = selectedTeamId ?? teams[0]?.teamId ?? null

  const statsForTeam = (stats ?? []).filter((s) => !activeTeamId || s.teamId === activeTeamId)
  const evalsForTeam = (evals ?? []).filter((e) => !activeTeamId || e.teamId === activeTeamId)

  const dob = child?.dateOfBirth
    ? new Date(child.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : null

  if (cLoading) return <Spinner label="Loading…" />
  if (cError)   return <ErrorAlert message={cError} />

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/parent/children')}
        className="text-sm text-gray-500 hover:text-gray-700">← My Children</button>

      {/* Profile card */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex gap-5 items-start">
        <div className="shrink-0">
          <label
            htmlFor={photoInputId}
            title="Change photo"
            className={`relative block ${uploading ? 'cursor-wait' : 'cursor-pointer'}`}
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400">
              {(imageUrl ?? child?.profileImageUrl)
                ? <img src={imageUrl ?? child.profileImageUrl} alt="" className="w-full h-full object-cover" />
                : <PersonIcon />}
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-700 rounded-full flex items-center justify-center shadow hover:bg-green-600 transition">
              {uploading
                ? <span className="text-white text-xs leading-none">…</span>
                : <CameraIcon />}
            </div>
            <input id={photoInputId} type="file" accept="image/jpeg,image/png,image/webp"
              className="sr-only" disabled={uploading} onChange={handleImagePick} />
          </label>
          {uploadErr && <p className="mt-1 text-xs text-red-600 whitespace-nowrap">{uploadErr}</p>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-800">{child?.firstName} {child?.lastName}</h1>
            {child?.jerseyNumber != null && (
              <span className="text-sm font-mono bg-green-700 text-white px-2 py-0.5 rounded">
                #{child.jerseyNumber}
              </span>
            )}
            <button
              onClick={handleTogglePublic}
              disabled={togglingPublic || cLoading}
              title={isPublic ? 'Public profile — click to make private' : 'Private profile — click to make public'}
              className={`text-xs px-2 py-0.5 rounded border transition ${
                isPublic
                  ? 'border-green-500 text-green-700 bg-green-50 hover:bg-green-100'
                  : 'border-gray-300 text-gray-500 bg-gray-50 hover:bg-gray-100'
              } disabled:opacity-50`}
            >
              {togglingPublic ? '…' : isPublic ? 'Public' : 'Private'}
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
            {child?.primaryPosition && <Pair label="Position" value={child.primaryPosition} />}
            {child?.secondaryPosition && <Pair label="Alt position" value={child.secondaryPosition} />}
            {child?.strongFoot && <Pair label="Strong foot" value={child.strongFoot} />}
            {dob && <Pair label="Date of birth" value={dob} />}
          </div>
        </div>
        <button
          onClick={() => setJoinOpen(true)}
          className="shrink-0 text-sm border border-green-700 text-green-700 px-3 py-1.5 rounded hover:bg-green-50">
          + Join Another Team
        </button>
      </div>

      {/* Join Another Team modal */}
      {joinOpen && child && (
        <JoinAnotherTeamForm
          playerId={child.id}
          playerName={`${child.firstName} ${child.lastName}`}
          onClose={() => setJoinOpen(false)}
          onSuccess={() => { setJoinOpen(false); navigate('/parent/children') }}
        />
      )}

      {/* Team tabs */}
      {teams.length > 1 && (
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
          {teams.map((t) => (
            <button key={t.teamId}
              onClick={() => setSelectedTeamId(t.teamId)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition ${
                (activeTeamId === t.teamId)
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.teamName}
            </button>
          ))}
          <button
            onClick={() => setSelectedTeamId(null)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition ${
              activeTeamId === null
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            All Teams
          </button>
        </div>
      )}

      {/* Content tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { id: 'matches', label: `Matches (${statsForTeam.length})` },
          { id: 'stats',   label: 'Stats' },
          { id: 'evals',   label: `Evaluations (${evalsForTeam.length})` },
          { id: 'reports', label: `Reports (${(reports ?? []).filter((r) => r.approvedForParent).length})` },
        ].map(({ id: tabId, label }) => (
          <button key={tabId} onClick={() => setTab(tabId)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === tabId
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'matches' && (
        <StatsTab stats={statsForTeam} loading={sLoading} error={sError} />
      )}
      {tab === 'stats' && (
        <PlayerSeasonStatsTab data={seasonStats} loading={ssLoading} error={ssError} />
      )}
      {tab === 'evals' && (
        <EvalsTab evals={evalsForTeam} loading={eLoading} error={eError} />
      )}
      {tab === 'reports' && (
        <ReportsTab reports={reports} loading={rLoading} error={rError} />
      )}
    </div>
  )
}

// ─── Join Another Team ────────────────────────────────────────────────────────

function JoinAnotherTeamForm({ playerId, playerName, onClose, onSuccess }) {
  const [step, setStep] = useState('code')
  const [code, setCode] = useState('')
  const [teamInfo, setTeamInfo] = useState(null)
  const [codeLoading, setCodeLoading] = useState(false)
  const [codeError, setCodeError] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [jerseyNumber, setJerseyNumber] = useState('')

  const handleCodeLookup = async (e) => {
    e.preventDefault()
    setCodeError('')
    setCodeLoading(true)
    try {
      const info = await lookupTeamInviteCode(code.trim())
      setTeamInfo({ ...info, code: code.trim() })
      setStep('confirm')
    } catch (err) {
      setCodeError(err?.response?.data?.message || 'Invalid or inactive team code.')
    } finally {
      setCodeLoading(false)
    }
  }

  const handleConfirm = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSaving(true)
    try {
      await submitPlayerRegistration({
        teamInviteCode: teamInfo.code,
        existingPlayerId: playerId,
        jerseyNumber: jerseyNumber ? Number(jerseyNumber) : null,
      })
      onSuccess()
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Failed to submit. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-gray-800">Join Another Team</h2>
            <p className="text-sm text-gray-500">{playerName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {step === 'code' && (
          <>
            <p className="text-sm text-gray-500">
              Enter the team code provided by the new team's administrator.
            </p>
            {codeError && <p className="text-red-600 text-sm">{codeError}</p>}
            <form onSubmit={handleCodeLookup} className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. A1B2C3D4"
                required
                className="flex-1 border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button type="submit" disabled={codeLoading || !code.trim()}
                className="bg-green-700 text-white text-sm px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50">
                {codeLoading ? '…' : 'Next'}
              </button>
            </form>
          </>
        )}

        {step === 'confirm' && teamInfo && (
          <form onSubmit={handleConfirm} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-sm text-green-800">
              Team: <strong>{teamInfo.teamName}</strong>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jersey number on this team (optional)</label>
              <input type="number" min="1" max="99" value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            {submitError && <p className="text-red-600 text-sm">{submitError}</p>}
            <p className="text-xs text-gray-400">
              A registration request will be sent to the coach for review.
            </p>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-green-700 text-white text-sm px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50">
                {saving ? 'Submitting…' : 'Send Request'}
              </button>
              <button type="button" onClick={() => setStep('code')}
                className="text-sm text-gray-500 hover:text-gray-700">Back</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Stats tab ────────────────────────────────────────────────────────────────

function StatsTab({ stats, loading, error }) {
  if (loading) return <Spinner label="Loading stats…" />
  if (error)   return <ErrorAlert message={error} />
  if (!stats || stats.length === 0)
    return <Empty>No match statistics recorded yet.</Empty>

  const sorted = [...stats].sort((a, b) => new Date(b.matchDateTime) - new Date(a.matchDateTime))

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              {STAT_COLS.map((c) => (
                <th key={c.key} className="px-3 py-2 text-left font-medium">{c.label}</th>
              ))}
              <th className="px-3 py-2 text-left font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                {STAT_COLS.map((c) => (
                  <td key={c.key} className="px-3 py-2 text-gray-700">
                    {c.key === 'cleanSheet'
                      ? (s.cleanSheet ? '✓' : '—')
                      : c.decimal
                        ? Number(s[c.key] ?? 0).toFixed(2)
                        : (s[c.key] ?? '—')}
                  </td>
                ))}
                <td className="px-3 py-2 text-gray-400 text-xs">
                  {s.matchDateTime
                    ? new Date(s.matchDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Evaluations tab ──────────────────────────────────────────────────────────

const RATING_KEYS = [
  'overallRating', 'technicalRating', 'tacticalRating', 'physicalRating',
  'mentalityRating', 'attackingRating', 'defendingRating', 'decisionMakingRating', 'workRateRating',
]

function avgRatings(evList) {
  const result = {}
  RATING_KEYS.forEach((k) => {
    const vals = evList.map((e) => e[k]).filter((v) => v != null)
    if (vals.length > 0) result[k] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  })
  return result
}

function EvalsTab({ evals, loading, error }) {
  if (loading) return <Spinner label="Loading evaluations…" />
  if (error)   return <ErrorAlert message={error} />
  if (!evals || evals.length === 0)
    return <Empty>No evaluations available yet.</Empty>

  // Group by matchId, sorted newest first
  const groups = []
  const seen = new Map()
  const sorted = [...evals].sort((a, b) => new Date(b.matchDateTime ?? 0) - new Date(a.matchDateTime ?? 0))
  sorted.forEach((ev) => {
    if (!seen.has(ev.matchId)) { seen.set(ev.matchId, []); groups.push(ev.matchId) }
    seen.get(ev.matchId).push(ev)
  })

  return (
    <div className="space-y-6">
      {groups.map((matchId) => {
        const group = seen.get(matchId)
        const first = group[0]
        const multi = group.length > 1
        const avg = multi ? avgRatings(group) : null

        return (
          <div key={matchId} className="space-y-3">
            {/* Match header */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-700">
                vs {first.opponent}
                {first.matchDateTime && (
                  <span className="ml-2 font-normal text-gray-400">
                    {new Date(first.matchDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </p>
              {multi && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                  {group.length} coach evaluations
                </span>
              )}
            </div>

            {/* Averaged card — only when multiple coaches */}
            {multi && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Coach Average</p>
                <RatingsGrid ratings={avg} />
              </div>
            )}

            {/* Individual coach cards */}
            {group.map((ev) => <EvalCard key={ev.id} ev={ev} showCoach={multi} />)}
          </div>
        )
      })}
    </div>
  )
}

function RatingsGrid({ ratings }) {
  const entries = RATINGS.filter(({ key }) => ratings[key] != null)
  if (entries.length === 0) return null
  return (
    <div className="grid grid-cols-4 sm:grid-cols-9 gap-2">
      {entries.map(({ key, label }) => (
        <div key={key} className="text-center">
          <p className={`text-base font-bold ${ratingColor(Math.round(ratings[key]))}`}>
            {Number.isInteger(ratings[key]) ? ratings[key] : ratings[key].toFixed(1)}
          </p>
          <p className="text-xs text-gray-400 leading-tight">{label}</p>
        </div>
      ))}
    </div>
  )
}

function EvalCard({ ev, showCoach }) {
  const date = ev.matchDateTime
    ? new Date(ev.matchDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null
  const visible = RATINGS.filter(({ key }) => ev[key] != null)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          {!showCoach && <p className="font-medium text-gray-800">vs {ev.opponent}</p>}
          <p className="text-xs text-gray-400 mt-0.5">
            {showCoach
              ? <span className="font-medium text-gray-600">{ev.coachName ?? 'Coach'}</span>
              : date}
            {ev.positionPlayed && ` · played ${ev.positionPlayed}`}
          </p>
        </div>
        {ev.overallRating != null && (
          <div className="text-center">
            <p className={`text-2xl font-bold ${ratingColor(ev.overallRating)}`}>{ev.overallRating}</p>
            <p className="text-xs text-gray-400">Overall</p>
          </div>
        )}
      </div>
      {visible.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {visible.map(({ key, label }) => (
            <div key={key} className="text-center">
              <p className={`text-base font-bold ${ratingColor(ev[key])}`}>{ev[key]}</p>
              <p className="text-xs text-gray-400 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      )}
      {ev.parentVisibleNotes && (
        <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
          <p className="text-xs font-medium text-gray-400 mb-1">Coach notes</p>
          {ev.parentVisibleNotes}
        </div>
      )}
    </div>
  )
}

// ─── Reports tab ─────────────────────────────────────────────────────────────

function ReportsTab({ reports, loading, error }) {
  if (loading) return <Spinner label="Loading reports…" />
  if (error)   return <ErrorAlert message={error} />
  const approved = (reports ?? []).filter((r) => r.approvedForParent)
  if (approved.length === 0) return <Empty>No approved development reports yet.</Empty>

  return (
    <div className="space-y-4">
      {[...approved]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((r) => <ReportCard key={r.id} report={r} />)}
    </div>
  )
}

function ReportCard({ report }) {
  const [open, setOpen] = useState(false)
  const date = report.createdAt
    ? new Date(report.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition">
        <div>
          <p className="font-medium text-gray-800">{report.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {report.seasonName && `${report.seasonName} · `}{date}
          </p>
        </div>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {[
            { key: 'strengths',      label: 'Strengths' },
            { key: 'areasToImprove', label: 'Areas to Improve' },
            { key: 'trainingFocus',  label: 'Training Focus' },
            { key: 'parentSummary',  label: 'Summary' },
          ].map(({ key, label }) =>
            report[key] ? (
              <div key={key}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{report[key]}</p>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function Pair({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-1 text-sm">
      <span className="text-gray-400">{label}:</span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
  )
}

function Empty({ children }) {
  return <div className="text-center py-10 text-gray-400 text-sm">{children}</div>
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
      <path d="M12 15.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM19.2 3.2H16l-1.44-2.16A1.2 1.2 0 0 0 13.56 0h-3.12a1.2 1.2 0 0 0-1 .56L8 3.2H4.8A2.4 2.4 0 0 0 2.4 5.6v12A2.4 2.4 0 0 0 4.8 20h14.4a2.4 2.4 0 0 0 2.4-2.4V5.6a2.4 2.4 0 0 0-2.4-2.4z"/>
    </svg>
  )
}
