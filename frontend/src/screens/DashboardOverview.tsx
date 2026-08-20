import { useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/MetricCard'
import { Button } from '@/components/ui/Button'
import {
  ClipboardList,
  Layers,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BarChart2,
  RefreshCcw,
  Shield,
  Target,
} from 'lucide-react'
import { useAppState } from '@/context/AppState'
import { PerformanceChart } from '@/components/charts/PerformanceChart'
import { generateHistoricalData, getPerformanceMetrics } from '@/data/mockData'

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export const DashboardOverview = () => {
  const {
    riskTitle,
    allocation,
    backtestParams,
    backtestRun,
    setScreen,
  } = useAppState()

  const equityPct = useMemo(
    () => allocation.find((a) => a.name === 'Equity')?.percentage ?? 0,
    [allocation],
  )
  const chartData = useMemo(
    () =>
      backtestRun
        ? generateHistoricalData(backtestParams.years, backtestParams.rebalancing, backtestParams.benchmark)
        : [],
    [backtestRun, backtestParams],
  )
  const metrics = backtestRun ? getPerformanceMetrics(backtestParams.years) : null

  const cards = [
    {
      id: 'dashboard-risk' as const,
      label: 'Risk Profile',
      value: riskTitle || 'Not set',
      sub: riskTitle ? 'Tap to update' : 'Take assessment',
      icon: <ClipboardList size={18} />,
      tone: 'text-sky-500 bg-sky-500/10',
    },
    {
      id: 'dashboard-portfolio' as const,
      label: 'Portfolio',
      value: equityPct ? `${equityPct}% Equity` : 'Not set',
      sub: equityPct ? `${allocation.length} asset classes` : 'Build portfolio',
      icon: <Layers size={18} />,
      tone: 'text-brand-orange bg-brand-orange/10',
    },
    {
      id: 'dashboard-backtest' as const,
      label: 'Backtest',
      value: backtestRun ? `${backtestParams.years} Years` : 'Not run',
      sub: backtestRun ? backtestParams.rebalancing : 'Run backtest',
      icon: <TrendingUp size={18} />,
      tone: 'text-success bg-success/10',
    },
    {
      id: 'dashboard-results' as const,
      label: 'Benchmark',
      value: backtestParams.benchmark === 'sp500' ? 'S&P 500' : 'Nifty 50',
      sub: 'Compare performance',
      icon: <Target size={18} />,
      tone: 'text-purple-500 bg-purple-500/10',
    },
  ]

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-1">
                {getGreeting()} 👋
              </h1>
              <p className="text-secondary text-sm sm:text-base">
                Here's your portfolio journey.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScreen('landing')}
              className="text-xs sm:text-sm"
            >
              Back to Home
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {cards.map((c) => (
            <button
              key={c.id}
              onClick={() => setScreen(c.id)}
              className="bg-card border border-default rounded-2xl p-4 sm:p-5 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-navy-300 dark:hover:border-navy-500 group"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${c.tone}`}>
                {c.icon}
              </div>
              <div className="text-xs sm:text-sm text-secondary mb-1">{c.label}</div>
              <div className="text-lg sm:text-xl font-bold text-primary mb-1">{c.value}</div>
              <div className="text-[11px] sm:text-xs text-secondary opacity-80 group-hover:opacity-100 transition-opacity">
                {c.sub} →
              </div>
            </button>
          ))}
        </div>

        <Card className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-primary">Portfolio Performance</h2>
              <p className="text-xs sm:text-sm text-secondary">
                {backtestRun
                  ? `${backtestParams.years}Y view · ${backtestParams.rebalancing} rebalancing`
                  : 'Run a backtest to see historical performance'}
              </p>
            </div>
            {backtestRun && (
              <Button size="sm" variant="outline" onClick={() => setScreen('dashboard-backtest')}>
                Open Full View <ArrowRight size={14} />
              </Button>
            )}
          </div>

          {backtestRun && chartData.length > 0 ? (
            <PerformanceChart data={chartData} height={300} />
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-navy-100 dark:bg-navy-700 flex items-center justify-center text-secondary">
                <BarChart2 size={26} />
              </div>
              <div>
                <div className="font-semibold text-primary mb-1">No chart data yet</div>
                <div className="text-sm text-secondary mb-3 max-w-sm">
                  Complete the risk profile and run a backtest to visualize your portfolio growth.
                </div>
                <Button onClick={() => setScreen('risk-assessment')}>Start Your Journey</Button>
              </div>
            </div>
          )}
        </Card>

        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <MetricCard
              label="Total Return"
              value={`${metrics.totalReturn >= 0 ? '+' : ''}${metrics.totalReturn.toFixed(1)}%`}
              positive={metrics.totalReturn >= 0}
              icon={<TrendingUp size={14} />}
              className="!p-4"
            />
            <MetricCard
              label="CAGR"
              value={`${metrics.cagr.toFixed(1)}%`}
              positive={true}
              icon={<BarChart2 size={14} />}
              className="!p-4"
            />
            <MetricCard
              label="Volatility"
              value={`${metrics.volatility.toFixed(1)}%`}
              positive={null}
              icon={<RefreshCcw size={14} />}
              className="!p-4"
            />
            <MetricCard
              label="Max Drawdown"
              value={`${metrics.maxDrawdown.toFixed(1)}%`}
              positive={false}
              icon={<Shield size={14} />}
              className="!p-4"
            />
          </div>
        )}

        <Card className="bg-gradient-to-br from-purple-500/[0.06] via-transparent to-brand-orange/[0.05]">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-purple-500 to-brand-orange flex items-center justify-center text-white shadow-sm">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-primary mb-1">Your latest insight</h3>
              <p className="text-sm sm:text-base text-secondary leading-relaxed mb-4 max-w-2xl">
                {backtestRun
                  ? `Your ${riskTitle.toLowerCase() || 'aggressive'} portfolio has outperformed its benchmark by +${metrics?.vsBenchmark.toFixed(1) || '4.8'}% over ${backtestParams.years} years, helped by disciplined quarterly rebalancing and a diversified mix of equity, debt, and gold.`
                  : "Get started by completing the risk questionnaire — it takes under 2 minutes, and you'll get a personalized portfolio recommendation you can backtest against historical market data."}
              </p>
              <Button
                onClick={() => {
                  if (!riskTitle) setScreen('risk-assessment')
                  else if (!backtestRun) setScreen('dashboard-portfolio')
                  else setScreen('dashboard-results')
                }}
              >
                {!riskTitle
                  ? 'Take Risk Assessment'
                  : !backtestRun
                  ? 'Build My Portfolio'
                  : 'Continue your analysis'}
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
