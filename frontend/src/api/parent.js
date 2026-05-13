import api from './client'

export const listMyChildren = () => api.get('/api/players').then((r) => r.data.data)
export const getChild = (playerId) => api.get(`/api/players/${playerId}`).then((r) => r.data.data)
export const getChildStats = (playerId) => api.get(`/api/players/${playerId}/stats`).then((r) => r.data.data)
export const getChildEvaluations = (playerId) =>
  api.get(`/api/players/${playerId}/evaluations`).then((r) => r.data.data)
export const getChildReports = (playerId) =>
  api.get(`/api/players/${playerId}/reports`).then((r) => r.data.data)
export const listMyRegistrationRequests = () =>
  api.get('/api/player-registration-requests/my').then((r) => r.data.data)

/** Look up a team invite code without consuming it (shows team name before submitting). */
export const lookupTeamInviteCode = (code) =>
  api.get(`/api/team-invite-codes/lookup/${code}`).then((r) => r.data.data)

/** Register a child (or add an existing child to another team) using a team invite code. */
export const submitPlayerRegistration = (data) =>
  api.post('/api/player-registration-requests', data).then((r) => r.data.data)

export const getChildSeasonStats = (playerId) =>
  api.get(`/api/players/${playerId}/season-stats`).then((r) => r.data.data)

export const uploadChildImage = (playerId, file) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post(`/api/players/${playerId}/profile-image`, fd).then((r) => r.data.data)
}
