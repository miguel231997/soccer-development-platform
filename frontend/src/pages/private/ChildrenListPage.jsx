import { useLocation, useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { listMyChildren, listMyRegistrationRequests } from '../../api/parent'
import { useFetch } from '../../hooks/useFetch'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

const STATUS_STYLE = {
  PENDING:  'bg-yellow-50 text-yellow-700',
  APPROVED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
}

export default function ChildrenListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const registeredName = location.state?.registered

  const childrenFetcher = useCallback(() => listMyChildren(), [])
  const requestsFetcher = useCallback(() => listMyRegistrationRequests(), [])

  const { data: children, loading: cLoading, error: cError } = useFetch(childrenFetcher)
  const { data: requests, loading: rLoading } = useFetch(requestsFetcher)

  const pendingRequests = (requests ?? []).filter((r) => r.status === 'PENDING')

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">My Children</h1>
        <button onClick={() => navigate('/parent/children/register')}
          className="bg-green-700 text-white text-sm px-4 py-2 rounded hover:bg-green-600">
          + Register a Child
        </button>
      </div>

      {registeredName && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
          Registration request for <strong>{registeredName}</strong> submitted. The coach will review it shortly.
        </div>
      )}

      {cLoading && <Spinner label="Loading children…" />}
      {cError && <ErrorAlert message={cError} />}

      {!cLoading && !cError && children?.length === 0 && pendingRequests.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center space-y-2">
          <p className="text-gray-600 font-medium">No children registered yet.</p>
          <p className="text-sm text-gray-400">
            Ask your club administrator for a team code and register your child above.
          </p>
        </div>
      )}

      {/* Approved children */}
      {children && children.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active Players</h2>
          <div className="grid gap-3">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => navigate(`/parent/children/${child.id}`)}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:border-green-400 hover:shadow-sm transition text-left w-full"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg shrink-0 overflow-hidden">
                  {child.profileImageUrl
                    ? <img src={child.profileImageUrl} alt="" className="w-full h-full object-cover" />
                    : `${child.firstName?.[0]}${child.lastName?.[0]}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">
                    {child.firstName} {child.lastName}
                    {child.jerseyNumber != null && (
                      <span className="ml-2 text-xs font-mono bg-green-700 text-white px-1.5 py-0.5 rounded">
                        #{child.jerseyNumber}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {child.primaryPosition}
                    {child.teams?.length > 0 && ` · ${child.teams.length} team${child.teams.length > 1 ? 's' : ''}`}
                  </p>
                </div>
                <span className="text-gray-300 text-lg">›</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Pending / reviewed requests */}
      {!rLoading && requests && requests.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Registration Requests</h2>
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
            {[...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((req) => (
              <div key={req.id} className="px-4 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-800">{req.firstName} {req.lastName}</p>
                  <p className="text-xs text-gray-400">
                    {req.teamName}
                    {req.primaryPosition && ` · ${req.primaryPosition}`}
                    {req.jerseyNumber && ` · #${req.jerseyNumber}`}
                  </p>
                  {req.rejectionReason && (
                    <p className="text-xs text-red-500 mt-0.5">Reason: {req.rejectionReason}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${STATUS_STYLE[req.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
