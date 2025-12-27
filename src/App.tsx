import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MainLayout } from './components/layout/MainLayout'
import { HomePage } from './pages/HomePage'
import { EquipmentPage } from './pages/EquipmentPage'
import { EquipmentDetailPage } from './pages/EquipmentDetailPage'
import { MaintenanceKanbanPage } from './pages/MaintenanceKanbanPage'
import { MaintenanceCalendarPage } from './pages/MaintenanceCalendarPage'
import { TeamsPage } from './pages/TeamsPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes with layout */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<HomePage />} />
              <Route path="/equipment" element={<EquipmentPage />} />
              <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
              <Route path="/maintenance/kanban" element={<MaintenanceKanbanPage />} />
              <Route path="/maintenance/calendar" element={<MaintenanceCalendarPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
