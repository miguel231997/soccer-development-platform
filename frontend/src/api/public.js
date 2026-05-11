import api from './client'

export const getLeaderboard = (params) =>
  api.get('/api/public/stats', { params }).then((r) => r.data.data)

export const getPublicPlayer = (playerId) =>
  api.get(`/api/public/players/${playerId}`).then((r) => r.data.data)

export const getPublicTeamStats = (teamId) =>
  api.get(`/api/public/teams/${teamId}/stats`).then((r) => r.data.data)
