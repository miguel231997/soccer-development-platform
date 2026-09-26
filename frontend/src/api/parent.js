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

/** Returns teams the authenticated user is a member of. */
export const listMyTeams = () => api.get('/api/teams/mine').then((r) => r.data.data)

/** Returns active players on a specific team (user must be a member). */
export const listTeamPlayersById = (teamId) =>
  api.get(`/api/teams/${teamId}/players`).then((r) => r.data.data)

/** Join an additional team using a PARENT registration code. */
export const joinTeam = (code) =>
  api.post('/api/auth/join-team', { registrationCode: code }).then((r) => r.data.data)

/** Register a child to a team the parent is already a member of. */
export const submitPlayerRegistration = (data) =>
  api.post('/api/player-registration-requests', data).then((r) => r.data.data)

export const getChildSeasonStats = (playerId) =>
  api.get(`/api/players/${playerId}/season-stats`).then((r) => r.data.data)

export const uploadChildImage = (playerId, file) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post(`/api/players/${playerId}/profile-image`, fd).then((r) => r.data.data)
}

export const setChildPublicProfile = (playerId, enabled) =>
  api.patch(`/api/players/${playerId}/public-profile`, null, { params: { enabled } }).then((r) => r.data.data)
