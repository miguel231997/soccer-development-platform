import api from './client'

// Clubs
export const listClubs = () => api.get('/api/clubs').then((r) => r.data.data)
export const createClub = (data) => api.post('/api/clubs', data).then((r) => r.data.data)

// Teams
export const listAllTeams = () => api.get('/api/teams').then((r) => r.data.data)
export const createTeam = (data) => api.post('/api/teams', data).then((r) => r.data.data)

// Registration codes
export const listRegistrationCodes = () =>
  api.get('/api/admin/registration-codes').then((r) => r.data.data)
export const createRegistrationCode = (data) =>
  api.post('/api/admin/registration-codes', data).then((r) => r.data.data)
export const disableRegistrationCode = (id) =>
  api.put(`/api/admin/registration-codes/${id}/disable`).then((r) => r.data.data)

// Player registration requests (also used by coaches)
export const listRegistrationRequests = () =>
  api.get('/api/player-registration-requests/manage').then((r) => r.data.data)
export const approveRegistrationRequest = (id) =>
  api.post(`/api/player-registration-requests/${id}/approve`).then((r) => r.data.data)
export const rejectRegistrationRequest = (id, reason) =>
  api.post(`/api/player-registration-requests/${id}/reject`, { reason }).then((r) => r.data.data)
