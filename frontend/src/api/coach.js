import api from './client'

// Teams
export const listTeams = () => api.get('/api/teams').then((r) => r.data.data)
export const joinTeamWithCode = (registrationCode) =>
  api.post('/api/auth/join-team', { registrationCode }).then((r) => r.data.data)
export const getTeam = (teamId) => api.get(`/api/teams/${teamId}`).then((r) => r.data.data)

// Matches
export const listMatches = () => api.get('/api/matches').then((r) => r.data.data)
export const listTeamMatches = (teamId) => api.get(`/api/teams/${teamId}/matches`).then((r) => r.data.data)
export const getMatch = (matchId) => api.get(`/api/matches/${matchId}`).then((r) => r.data.data)
export const createMatch = (data) => api.post('/api/matches', data).then((r) => r.data.data)
export const finalizeMatch = (matchId) => api.post(`/api/matches/${matchId}/finalize`).then((r) => r.data.data)

// Seasons & competitions (for match creation dropdowns)
export const listSeasons = () => api.get('/api/seasons').then((r) => r.data.data)
export const listSeasonPhases = (seasonId) => api.get(`/api/seasons/${seasonId}/phases`).then((r) => r.data.data)
export const listCompetitions = (state) =>
  api.get('/api/competitions', { params: state ? { state } : {} }).then((r) => r.data.data)

// Players
export const listPlayers = () => api.get('/api/players').then((r) => r.data.data)
export const getPlayer = (playerId) => api.get(`/api/players/${playerId}`).then((r) => r.data.data)
export const uploadPlayerImage = (playerId, file) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post(`/api/players/${playerId}/profile-image`, fd).then((r) => r.data.data)
}

// Match stats
export const getMatchStats = (matchId) => api.get(`/api/matches/${matchId}/stats`).then((r) => r.data.data)
export const getPlayerStats = (playerId) => api.get(`/api/players/${playerId}/stats`).then((r) => r.data.data)
export const upsertStats = (matchId, playerId, data) =>
  api.put(`/api/matches/${matchId}/players/${playerId}/stats`, data).then((r) => r.data.data)

// Evaluations
export const getMatchEvaluations = (matchId) =>
  api.get(`/api/matches/${matchId}/evaluations`).then((r) => r.data.data)
export const getPlayerEvaluations = (playerId) =>
  api.get(`/api/players/${playerId}/evaluations`).then((r) => r.data.data)
export const createEvaluation = (matchId, playerId, data) =>
  api.post(`/api/matches/${matchId}/players/${playerId}/evaluation`, data).then((r) => r.data.data)
export const updateEvaluation = (evaluationId, data) =>
  api.put(`/api/evaluations/${evaluationId}`, data).then((r) => r.data.data)
