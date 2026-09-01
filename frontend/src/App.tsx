import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { AdvisorDashboard } from '@/screens/AdvisorDashboard'
import { ClientsScreen } from '@/screens/ClientsScreen'
import { AlertsScreen } from '@/screens/AlertsScreen'
import { BatchRunsScreen } from '@/screens/BatchRunsScreen'
import { LandingScreen } from '@/screens/LandingScreen'

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingScreen />} />
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
