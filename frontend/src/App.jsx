import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleBasedRoute from './components/RoleBasedRoute'

import HomePage from './pages/public/HomePage'
import PublicStatsPage from './pages/public/PublicStatsPage'
import PublicTeamStatsPage from './pages/public/PublicTeamStatsPage'
import PublicPlayerProfilePage from './pages/public/PublicPlayerProfilePage'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import DashboardPage from './pages/private/DashboardPage'
import TeamsPage from './pages/private/TeamsPage'
import TeamDetailPage from './pages/private/TeamDetailPage'
import PlayerDetailPage from './pages/private/PlayerDetailPage'
import MatchListPage from './pages/private/MatchListPage'
import MatchDetailPage from './pages/private/MatchDetailPage'
import MatchStatsEntryPage from './pages/private/MatchStatsEntryPage'
import PlayerEvaluationPage from './pages/private/PlayerEvaluationPage'
import PlayersPage from './pages/private/PlayersPage'
import DevelopmentReportPage from './pages/private/DevelopmentReportPage'
import ParentDashboardPage from './pages/private/ParentDashboardPage'
import ChildrenListPage from './pages/private/ChildrenListPage'
import RegisterChildPage from './pages/private/RegisterChildPage'
import ChildDetailPage from './pages/private/ChildDetailPage'
import AdminDashboardPage from './pages/private/AdminDashboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/stats" element={<PublicStatsPage />} />
            <Route path="/stats/teams/:teamId" element={<PublicTeamStatsPage />} />
            <Route path="/players/:playerId/profile" element={<PublicPlayerProfilePage />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Private — any authenticated user */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/teams" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
            <Route path="/players" element={<ProtectedRoute><PlayersPage /></ProtectedRoute>} />
            <Route path="/teams/:teamId" element={<ProtectedRoute><TeamDetailPage /></ProtectedRoute>} />
            <Route path="/players/:playerId" element={<ProtectedRoute><PlayerDetailPage /></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><MatchListPage /></ProtectedRoute>} />
            <Route path="/matches/:matchId" element={<ProtectedRoute><MatchDetailPage /></ProtectedRoute>} />
            <Route path="/matches/:matchId/stats" element={<ProtectedRoute><MatchStatsEntryPage /></ProtectedRoute>} />
            <Route path="/matches/:matchId/players/:playerId/evaluation" element={<ProtectedRoute><PlayerEvaluationPage /></ProtectedRoute>} />
            <Route path="/players/:playerId/report" element={<ProtectedRoute><DevelopmentReportPage /></ProtectedRoute>} />

            {/* Role-restricted */}
            <Route
              path="/parent"
              element={
                <RoleBasedRoute roles={['ROLE_PARENT', 'ROLE_ADMIN']}>
                  <ParentDashboardPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/parent/children"
              element={
                <RoleBasedRoute roles={['ROLE_PARENT', 'ROLE_ADMIN']}>
                  <ChildrenListPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/parent/children/register"
              element={
                <RoleBasedRoute roles={['ROLE_PARENT', 'ROLE_ADMIN']}>
                  <RegisterChildPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/parent/children/:id"
              element={
                <RoleBasedRoute roles={['ROLE_PARENT', 'ROLE_ADMIN']}>
                  <ChildDetailPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <RoleBasedRoute roles={['ROLE_ADMIN']}>
                  <AdminDashboardPage />
                </RoleBasedRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}
