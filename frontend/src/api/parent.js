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
export const submitPlayerRegistration = (data) =>
  api.post('/api/player-registration-requests', data).then((r) => r.data.data)
export const joinTeamWithCode = (registrationCode) =>
  api.post('/api/auth/join-team', { registrationCode }).then((r) => r.data)
