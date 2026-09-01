import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { AdvisorDashboard } from '@/screens/AdvisorDashboard'
import { ClientsScreen } from '@/screens/ClientsScreen'
import { AlertsScreen } from '@/screens/AlertsScreen'
import { BatchRunsScreen } from '@/screens/BatchRunsScreen'

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<AdvisorDashboard />} />
          <Route path="/clients" element={<ClientsScreen />} />
          <Route path="/alerts" element={<AlertsScreen />} />
          <Route path="/batch-runs" element={<BatchRunsScreen />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
