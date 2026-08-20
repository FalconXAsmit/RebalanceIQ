import { createContext, useContext, useState, type ReactNode } from 'react'
/* eslint-disable react-refresh/only-export-components */
import type { RiskAnswers, RiskLevel, AllocationItem, Holding } from '@/data/mockData'
import { getRiskProfile, getAssetAllocation, getHoldings } from '@/data/mockData'

type AppScreen =
  | 'landing'
  | 'risk-assessment'
  | 'risk-result'
  | 'portfolio'
  | 'backtest'
  | 'results'
  | 'dashboard'
  | 'dashboard-risk'
  | 'dashboard-portfolio'
  | 'dashboard-backtest'
  | 'dashboard-results'

interface AppState {
  screen: AppScreen
  riskAnswers: RiskAnswers | null
  riskLevel: RiskLevel | null
  riskTitle: string
  riskDesc: string
  allocation: AllocationItem[]
  holdings: Holding[]
  backtestParams: {
    investment: number
    years: number
    rebalancing: string
    benchmark: string
  }
  backtestRun: boolean
  setScreen: (s: AppScreen) => void
  setRiskAnswers: (a: RiskAnswers) => void
  setHoldings: (h: Holding[]) => void
  setBacktestParams: (p: Partial<AppState['backtestParams']>) => void
  runBacktest: () => void
  reset: () => void
}

const AppStateContext = createContext<AppState | undefined>(undefined)

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [screen, setScreen] = useState<AppScreen>('landing')
  const [riskAnswers, setRiskAnswersState] = useState<RiskAnswers | null>(null)
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null)
  const [riskTitle, setRiskTitle] = useState('')
  const [riskDesc, setRiskDesc] = useState('')
  const [allocation, setAllocation] = useState<AllocationItem[]>([])
  const [holdings, setHoldingsState] = useState<Holding[]>([])
  const [backtestParams, setBacktestParamsState] = useState({
    investment: 5000,
    years: 5,
    rebalancing: 'Quarterly',
    benchmark: 'nifty',
  })
  const [backtestRun, setBacktestRun] = useState(false)

  const setRiskAnswers = (a: RiskAnswers) => {
    setRiskAnswersState(a)
    const profile = getRiskProfile(a)
    setRiskLevel(profile.level)
    setRiskTitle(profile.title)
    setRiskDesc(profile.desc)
    setAllocation(getAssetAllocation(profile.level))
    setHoldingsState(getHoldings(profile.level))
  }

  const setBacktestParams = (p: Partial<AppState['backtestParams']>) => {
    setBacktestParamsState((prev) => ({ ...prev, ...p }))
  }

  const runBacktest = () => setBacktestRun(true)

  const reset = () => {
    setScreen('landing')
    setRiskAnswersState(null)
    setRiskLevel(null)
    setRiskTitle('')
    setRiskDesc('')
    setAllocation([])
    setHoldingsState([])
    setBacktestParams({ investment: 5000, years: 5, rebalancing: 'Quarterly', benchmark: 'nifty' })
    setBacktestRun(false)
  }

  return (
    <AppStateContext.Provider
      value={{
        screen,
        riskAnswers,
        riskLevel,
        riskTitle,
        riskDesc,
        allocation,
        holdings,
        backtestParams,
        backtestRun,
        setScreen,
        setRiskAnswers,
        setHoldings: setHoldingsState,
        setBacktestParams,
        runBacktest,
        reset,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export const useAppState = () => {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
