export type RiskLevel = 'conservative' | 'moderate' | 'aggressive'

export interface RiskAnswers {
  horizon: string
  reaction: string
  goal: string
  comfort: number
}

export interface AllocationItem {
  name: string
  percentage: number
  color: string
}

export interface Holding {
  name: string
  symbol: string
  percentage: number
  color: string
}

export interface ChartPoint {
  date: string
  portfolio: number
  benchmark: number
}

export interface PerformanceMetrics {
  totalReturn: number
  cagr: number
  volatility: number
  maxDrawdown: number
  vsBenchmark: number
}

export interface RebalanceComparison {
  strategy: string
  finalValue: number
  return: number
}

export interface AIExplanation {
  summary: string
  whatHelped: string
  whatProtected: string
  whatRebalancing: string
}

export const mockRiskQuestions = [
  {
    id: 'horizon',
    title: 'What is your investment horizon?',
    subtitle: 'How long can you stay invested before needing the money?',
    options: [
      { value: 'short', label: 'Less than 3 years', desc: 'Short-term goals' },
      { value: 'medium', label: '3–5 years', desc: 'Medium-term planning' },
      { value: 'long', label: '5–10 years', desc: 'Long-term growth' },
      { value: 'vlong', label: '10+ years', desc: 'Very long horizon' },
    ],
  },
  {
    id: 'reaction',
    title: 'How would you react if your portfolio dropped 20%?',
    subtitle: 'Market downturns happen — this helps us understand your risk tolerance.',
    options: [
      { value: 'sell', label: 'I would sell', desc: 'Minimize losses' },
      { value: 'wait', label: 'I would wait', desc: 'Hold and observe' },
      { value: 'invest', label: 'I would invest more', desc: 'Buy the dip' },
    ],
  },
  {
    id: 'goal',
    title: 'What is your primary goal?',
    subtitle: 'Select the objective that best describes you.',
    options: [
      { value: 'preservation', label: 'Capital preservation', desc: 'Protect my principal' },
      { value: 'balanced', label: 'Balanced growth', desc: 'Mix of growth and safety' },
      { value: 'growth', label: 'Wealth growth', desc: 'Maximize long-term returns' },
    ],
  },
  {
    id: 'comfort',
    title: 'How comfortable are you with market volatility?',
    subtitle: '1 = very uneasy, 5 = completely comfortable.',
    scale: true,
  },
]

export const getRiskProfile = (answers: RiskAnswers) => {
  let score = 0
  if (answers.horizon === 'short') score += 0
  else if (answers.horizon === 'medium') score += 1
  else if (answers.horizon === 'long') score += 2
  else score += 3

  if (answers.reaction === 'sell') score += 0
  else if (answers.reaction === 'wait') score += 1
  else score += 2

  if (answers.goal === 'preservation') score += 0
  else if (answers.goal === 'balanced') score += 1
  else score += 2

  score += answers.comfort - 1

  let level: RiskLevel
  let title: string
  let desc: string

  if (score <= 4) {
    level = 'conservative'
    title = 'Conservative'
    desc = 'You prefer capital preservation with steady, predictable returns and minimal drawdowns.'
  } else if (score <= 7) {
    level = 'moderate'
    title = 'Moderate'
    desc = 'You seek a balance between growth and stability, accepting moderate volatility for better returns.'
  } else {
    level = 'aggressive'
    title = 'Aggressive'
    desc = 'You are comfortable with higher volatility in exchange for greater long-term growth potential.'
  }

  return { level, title, desc, score }
}

export const getAssetAllocation = (level: RiskLevel): AllocationItem[] => {
  if (level === 'conservative') {
    return [
      { name: 'Equity', percentage: 30, color: '#f97316' },
      { name: 'Debt', percentage: 55, color: '#0ea5e9' },
      { name: 'Gold', percentage: 15, color: '#eab308' },
    ]
  } else if (level === 'moderate') {
    return [
      { name: 'Equity', percentage: 55, color: '#f97316' },
      { name: 'Debt', percentage: 30, color: '#0ea5e9' },
      { name: 'Gold', percentage: 15, color: '#eab308' },
    ]
  } else {
    return [
      { name: 'Equity', percentage: 70, color: '#f97316' },
      { name: 'Debt', percentage: 20, color: '#0ea5e9' },
      { name: 'Gold', percentage: 10, color: '#eab308' },
    ]
  }
}

export const getHoldings = (level: RiskLevel): Holding[] => {
  if (level === 'conservative') {
    return [
      { name: 'NIFTY 50 ETF', symbol: 'NIFTY50', percentage: 15, color: '#f97316' },
      { name: 'Large Cap Equity', symbol: 'LARGECAP', percentage: 10, color: '#fb923c' },
      { name: 'Bond ETF', symbol: 'BOND', percentage: 40, color: '#0ea5e9' },
      { name: 'Govt Securities', symbol: 'GSEC', percentage: 15, color: '#38bdf8' },
      { name: 'Gold ETF', symbol: 'GOLD', percentage: 15, color: '#eab308' },
      { name: 'Sovereign Gold Bond', symbol: 'SGB', percentage: 5, color: '#facc15' },
    ]
  } else if (level === 'moderate') {
    return [
      { name: 'NIFTY 50 ETF', symbol: 'NIFTY50', percentage: 25, color: '#f97316' },
      { name: 'Large Cap Equity', symbol: 'LARGECAP', percentage: 15, color: '#fb923c' },
      { name: 'Nasdaq ETF', symbol: 'NASDAQ', percentage: 15, color: '#f59e0b' },
      { name: 'Bond ETF', symbol: 'BOND', percentage: 30, color: '#0ea5e9' },
      { name: 'Gold ETF', symbol: 'GOLD', percentage: 15, color: '#eab308' },
    ]
  } else {
    return [
      { name: 'NIFTY 50 ETF', symbol: 'NIFTY50', percentage: 35, color: '#f97316' },
      { name: 'Large Cap Equity', symbol: 'LARGECAP', percentage: 20, color: '#fb923c' },
      { name: 'Nasdaq ETF', symbol: 'NASDAQ', percentage: 15, color: '#f59e0b' },
      { name: 'Bond ETF', symbol: 'BOND', percentage: 20, color: '#0ea5e9' },
      { name: 'Gold ETF', symbol: 'GOLD', percentage: 10, color: '#eab308' },
    ]
  }
}

const investmentPerMonth = 5000
const startValue = 0

export const generateHistoricalData = (years: number, rebalancing: string, benchmark: string): ChartPoint[] => {
  void benchmark
  const months = years * 12
  const data: ChartPoint[] = []
  let portfolio = startValue
  let bench = startValue

  const portfolioMonthlyReturn = 0.0095
  const benchmarkMonthlyReturn = 0.0082
  const rebalanceMonths = rebalancing === 'Monthly' ? 1 : rebalancing === 'Quarterly' ? 3 : 12

  const drift = 0.0008

  const startYear = 2026 - years
  for (let i = 0; i <= months; i++) {
    const year = Math.floor(startYear + i / 12)
    const month = String((i % 12) + 1).padStart(2, '0')
    const date = i % 12 === 0 ? `${year}` : i % 6 === 0 ? `${year}-${month}` : ''

    if (i > 0) {
      const rebalanced = i % rebalanceMonths === 0
      const noise = (Math.random() - 0.5) * 0.01
      portfolio = (portfolio + investmentPerMonth) * (1 + portfolioMonthlyReturn + noise + (rebalanced ? drift * 0.5 : drift))
      bench = (bench + investmentPerMonth) * (1 + benchmarkMonthlyReturn + noise)
    } else {
      portfolio = investmentPerMonth
      bench = investmentPerMonth
    }

    if (i % 3 === 0 || i === months) {
      data.push({
        date,
        portfolio: Math.round(portfolio),
        benchmark: Math.round(bench),
      })
    }
  }

  return data
}

export const getPerformanceMetrics = (years: number): PerformanceMetrics => {
  const factor = years / 5
  return {
    totalReturn: 42.8 * factor + 8,
    cagr: 7.4 + Math.random() * 1.5,
    volatility: 13.2 + Math.random() * 2,
    maxDrawdown: -12.6 - Math.random() * 3,
    vsBenchmark: 4.8 + Math.random() * 1.5,
  }
}

export const getRebalanceComparison = (): RebalanceComparison[] => [
  { strategy: 'Rebalanced Portfolio', finalValue: 14500, return: 45 },
  { strategy: 'Buy & Hold', finalValue: 13700, return: 37 },
]

export const getAIExplanation = (): AIExplanation => ({
  summary:
    'Your portfolio benefited from its higher equity allocation during strong market periods, while the bond and gold allocation helped reduce volatility during market declines. Quarterly rebalancing also helped maintain your intended risk level over time.',
  whatHelped: 'Equity exposure contributed most to growth, especially during the 2024 market rally.',
  whatProtected: 'Gold and debt reduced downside volatility during the 2022 market correction.',
  whatRebalancing: 'Quarterly rebalancing kept the portfolio close to its target allocation, preventing drift from equity outperformance.',
})

export const benchmarks = [
  { value: 'nifty', label: 'Nifty 50' },
  { value: 'sp500', label: 'S&P 500' },
]

export const rebalancingOptions = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Yearly', label: 'Yearly' },
]

export const periodOptions = [
  { value: 1, label: '1Y' },
  { value: 3, label: '3Y' },
  { value: 5, label: '5Y' },
  { value: 10, label: '10Y' },
]

export const loadingStages = [
  'Analyzing historical market data...',
  'Simulating portfolio rebalancing...',
  'Preparing your results...',
]
