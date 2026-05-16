import { useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getMatch, getPlayer, getMatchEvaluations, createEvaluation, updateEvaluation,
} from '../../api/coach'
import { useFetch } from '../../hooks/useFetch'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

const POSITIONS = [
  'GK','CB','LB','RB','LWB','RWB',
  'CDM','CM','CAM','LM','RM',
  'LW','RW','CF','ST',
]

const RATING_FIELDS = [
  { key: 'overallRating',        label: 'Overall',          group: 'main' },
  { key: 'technicalRating',      label: 'Technical',        group: 'detail' },
  { key: 'tacticalRating',       label: 'Tactical',         group: 'detail' },
  { key: 'physicalRating',       label: 'Physical',         group: 'detail' },
  { key: 'mentalityRating',      label: 'Mentality',        group: 'detail' },
  { key: 'attackingRating',      label: 'Attacking',        group: 'detail' },
  { key: 'defendingRating',      label: 'Defending',        group: 'detail' },
  { key: 'decisionMakingRating', label: 'Decision Making',  group: 'detail' },
  { key: 'workRateRating',       label: 'Work Rate',        group: 'detail' },
]

const DETAIL_KEYS = [
  'technicalRating','tacticalRating','physicalRating','mentalityRating',
  'attackingRating','defendingRating','decisionMakingRating','workRateRating',
]

function computeOverall(form) {
  const vals = DETAIL_KEYS.map((k) => Number(form[k]) || 0)
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

function emptyForm() {
  return {
    positionPlayed: '',
    technicalRating: 5, tacticalRating: 5, physicalRating: 5,
    mentalityRating: 5, attackingRating: 5, defendingRating: 5,
    decisionMakingRating: 5, workRateRating: 5,
    parentVisibleNotes: '',
    coachOnlyNotes: '',
  }
}

function fromExisting(ev) {
  if (!ev) return emptyForm()
  return {
    positionPlayed: ev.positionPlayed ?? '',
    technicalRating: ev.technicalRating ?? 5,
    tacticalRating: ev.tacticalRating ?? 5,
    physicalRating: ev.physicalRating ?? 5,
    mentalityRating: ev.mentalityRating ?? 5,
    attackingRating: ev.attackingRating ?? 5,
    defendingRating: ev.defendingRating ?? 5,
    decisionMakingRating: ev.decisionMakingRating ?? 5,
    workRateRating: ev.workRateRating ?? 5,
    parentVisibleNotes: ev.parentVisibleNotes ?? '',
    coachOnlyNotes: ev.coachOnlyNotes ?? '',
  }
}

export default function PlayerEvaluationPage() {
  const { matchId, playerId } = useParams()
  const { user } = useAuth()

  const fetcher = useCallback(
    () => Promise.all([getMatch(matchId), getPlayer(playerId), getMatchEvaluations(matchId)])
         .then(([match, player, evals]) => {
           // Match by both playerId AND own=true so we load only the current coach's own eval
           const existing = (evals ?? []).find(
             (e) => e.playerId === Number(playerId) && e.own
           ) ?? null
           return { match, player, existing }
         }),
    [matchId, playerId],
  )

  const { data, loading, error } = useFetch(fetcher, [matchId, playerId])

  if (loading) return <Spinner label="Loading evaluation…" />
  if (error)   return <ErrorAlert message={error} />

  return (
    <EvaluationForm
      matchId={matchId}
      playerId={playerId}
      match={data.match}
      player={data.player}
      existing={data.existing}
    />
  )
}

function EvaluationForm({ matchId, playerId, match, player, existing }) {
  const [form, setForm] = useState(() => fromExisting(existing))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setSaved(false)
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleRating = (key, val) => {
    setSaved(false)
    setForm((f) => ({ ...f, [key]: Number(val) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)

    const overall = computeOverall(form)
    const payload = {
      positionPlayed: form.positionPlayed || null,
      parentVisibleNotes: form.parentVisibleNotes || null,
      coachOnlyNotes: form.coachOnlyNotes || null,
      overallRating: overall,
      ...Object.fromEntries(
        RATING_FIELDS.filter((f) => f.group === 'detail').map(({ key }) => [key, Number(form[key])]),
      ),
    }

    try {
      if (existing) {
        await updateEvaluation(existing.id, payload)
      } else {
        await createEvaluation(matchId, playerId, payload)
      }
      setSaved(true)
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const date = match.matchDateTime
    ? new Date(match.matchDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  const overall = computeOverall(form)
  const overallColor = overall >= 8 ? 'text-mig-success' : overall >= 5 ? 'text-blue-400' : 'text-mig-danger'

  const inputCls = "w-full bg-mig-bg border border-mig-border text-mig-text placeholder-mig-dim rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mig-orange/40 focus:border-mig-orange transition-colors"

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back / context */}
      <div>
        <Link to={`/matches/${matchId}`} className="text-xs text-mig-muted hover:text-mig-orange transition-colors font-medium uppercase tracking-wide">← Match</Link>
        <h1 className="text-xl font-bold text-mig-text mt-1">
          {existing ? 'Edit' : 'New'} Evaluation
        </h1>
        <p className="text-sm text-mig-muted mt-0.5">
          {player.firstName} {player.lastName} · {match.teamName} vs {match.opponent}
          {date && ` · ${date}`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Position played */}
        <div className="bg-mig-surface border border-mig-border rounded-lg p-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-mig-muted">Position played</span>
            <select
              name="positionPlayed"
              value={form.positionPlayed}
              onChange={handleChange}
              className={`${inputCls} max-w-xs`}
            >
              <option value="">— select —</option>
              {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
        </div>

        {/* Detailed ratings */}
        <div className="bg-mig-surface border border-mig-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-mig-text">Detailed Ratings</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-mig-dim">Overall (auto)</span>
              <span className={`text-2xl font-bold ${overallColor}`}>
                {overall}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {RATING_FIELDS.filter((f) => f.group === 'detail').map(({ key, label }) => (
              <RatingSlider key={key} label={label} fieldKey={key} value={form[key]} onChange={handleRating} />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-mig-surface border border-mig-border rounded-lg p-4 space-y-4">
          <h2 className="text-sm font-semibold text-mig-text">Notes</h2>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-mig-muted">Parent-visible notes</span>
            <span className="text-xs text-mig-dim">Visible to the player's parents.</span>
            <textarea
              name="parentVisibleNotes"
              value={form.parentVisibleNotes}
              onChange={handleChange}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Positive feedback, areas the parent can support at home…"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-mig-muted">Coach-only notes</span>
            <span className="text-xs text-mig-warning bg-mig-warning/10 border border-mig-warning/20 px-2 py-0.5 rounded inline-block w-fit">Not visible to parents</span>
            <textarea
              name="coachOnlyNotes"
              value={form.coachOnlyNotes}
              onChange={handleChange}
              rows={3}
              className="w-full bg-mig-warning/5 border border-mig-warning/20 text-mig-text placeholder-mig-dim rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mig-warning/30 focus:border-mig-warning/40 transition-colors resize-none"
              placeholder="Internal coaching analysis, tactical notes…"
            />
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-mig-orange hover:bg-mig-orange-dark text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : existing ? 'Update Evaluation' : 'Save Evaluation'}
          </button>
          {saved && <span className="text-sm text-mig-success font-medium">Saved successfully.</span>}
          {error && <span className="text-sm text-mig-danger font-medium">{error}</span>}
        </div>
      </form>
    </div>
  )
}

function RatingSlider({ label, fieldKey, value, onChange, accent }) {
  const ratingVal = Number(value)
  const color = ratingVal >= 8 ? 'text-mig-success' : ratingVal >= 5 ? 'text-blue-400' : 'text-mig-danger'

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium ${accent ? 'text-mig-text' : 'text-mig-muted'}`}>{label}</span>
        <span className={`text-lg font-bold ${color}`}>{ratingVal}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={ratingVal}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        className="w-full accent-orange-500"
      />
      <div className="flex justify-between text-xs text-mig-dim">
        <span>1</span><span>5</span><span>10</span>
      </div>
    </div>
  )
}
