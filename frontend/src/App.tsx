import { ThemeProvider } from '@/context/ThemeContext'
import { AppStateProvider, useAppState } from '@/context/AppState'
import { LandingScreen } from '@/screens/LandingScreen'
import { RiskAssessmentScreen } from '@/screens/RiskAssessmentScreen'
import { RiskResultScreen } from '@/screens/RiskResultScreen'
import { PortfolioScreen } from '@/screens/PortfolioScreen'
import { BacktestScreen } from '@/screens/BacktestScreen'
import { ResultsScreen } from '@/screens/ResultsScreen'
import { DashboardOverview } from '@/screens/DashboardOverview'
import { DashboardRisk } from '@/screens/DashboardRisk'
import { DashboardPortfolio } from '@/screens/DashboardPortfolio'
import { DashboardBacktest } from '@/screens/DashboardBacktest'
import { DashboardResults } from '@/screens/DashboardResults'

const AppRouter = () => {
  const { screen } = useAppState()

  switch (screen) {
    case 'landing':
      return <LandingScreen />
    case 'risk-assessment':
      return <RiskAssessmentScreen />
    case 'risk-result':
      return <RiskResultScreen />
    case 'portfolio':
      return <PortfolioScreen />
    case 'backtest':
      return <BacktestScreen />
    case 'results':
      return <ResultsScreen />
    case 'dashboard':
      return <DashboardOverview />
    case 'dashboard-risk':
      return <DashboardRisk />
    case 'dashboard-portfolio':
      return <DashboardPortfolio />
    case 'dashboard-backtest':
      return <DashboardBacktest />
    case 'dashboard-results':
      return <DashboardResults />
    default:
      return <LandingScreen />
  }
}

const App = () => {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <AppRouter />
      </AppStateProvider>
    </ThemeProvider>
  )
}

export default App
