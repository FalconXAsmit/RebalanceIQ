import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2, TrendingUp, Shield, RefreshCcw, Target, Save, RotateCcw, Layers } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/MetricCard'
import { Navbar } from '@/components/navigation/Navbar'
import { useAppState } from '@/context/AppState'
import { getPerformanceMetrics, getRebalanceComparison, getAIExplanation, benchmarks } from '@/data/mockData'

export const ResultsScreen = () => {
  const { riskTitle, backtestParams, setScreen, reset, backtestRun } = useAppState()

  if (!backtestRun) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar variant="landing" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md text-center py-10">
            <Sparkles className="mx-auto mb-4 text-secondary" size={36} />
            <h2 className="text-xl font-semibold text-primary mb-2">No results yet</h2>
            <p className="text-secondary text-sm mb-5">Run a backtest first to see your results.</p>
            <Button onClick={() => setScreen('portfolio')}>Build Portfolio</Button>
          </Card>
        </div>
      </div>
    )
  }

  const metrics = getPerformanceMetrics(backtestParams.years)
  const rebalance = getRebalanceComparison()
  const ai = getAIExplanation()
  const benchLabel = benchmarks.find((b) => b.value === backtestParams.benchmark)?.label || 'Nifty 50'
  const investedTotal = backtestParams.investment * backtestParams.years * 12

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="landing" />

      <main className="flex-1 py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setScreen('backtest')}
            className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to backtest
          </button>

          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-semibold mb-4">
              <CheckCircle2 size={13} /> Complete
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight mb-2">
              Your backtest is ready
            </h1>
            <p className="text-secondary text-sm sm:text-base">
              Here's a summary of how your portfolio would have performed.
            </p>
          </div>

          <Card className="mb-5 sm:mb-6 bg-gradient-to-br from-brand-orange/[0.08] via-transparent to-sky-500/[0.06]">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs sm:text-sm font-medium text-secondary mb-2">
                  Initial Investment (Total)
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                  ₹{investedTotal.toLocaleString('en-IN')}
                </div>
                <div className="text-xs sm:text-sm text-secondary">
                  ₹{backtestParams.investment.toLocaleString('en-IN')} / month × {backtestParams.years * 12} months
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-secondary mb-2">
                  Final Portfolio Value
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-orange mb-1">
                  ₹{rebalance[0].finalValue.toLocaleString('en-IN')}
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold">
                  <TrendingUp size={11} /> +{metrics.totalReturn.toFixed(1)}% total return
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
            <MetricCard
              label="CAGR"
              value={`${metrics.cagr.toFixed(1)}%`}
              subvalue="Annualized"
              positive={true}
              icon={<TrendingUp size={14} />}
              tooltip="Compound Annual Growth Rate"
              className="!p-4"
            />
            <MetricCard
              label="Max Drawdown"
              value={`${metrics.maxDrawdown.toFixed(1)}%`}
              subvalue="Worst drop"
              positive={false}
              icon={<Shield size={14} />}
              tooltip="Largest peak-to-trough decline"
              className="!p-4"
            />
            <MetricCard
              label="vs Benchmark"
              value={`+${metrics.vsBenchmark.toFixed(1)}%`}
              subvalue={benchLabel}
              positive={true}
              icon={<Target size={14} />}
              className="!p-4"
            />
            <MetricCard
              label="Rebalancing"
              value={backtestParams.rebalancing}
              subvalue={`${backtestParams.years}Y window`}
              positive={null}
              icon={<RefreshCcw size={14} />}
              className="!p-4"
            />
          </div>

          <Card className="mb-5 sm:mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-purple-500 to-brand-orange flex items-center justify-center text-white shadow-md">
                <Sparkles size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary mb-1">AI Summary</h3>
                <p className="text-sm sm:text-base text-secondary leading-relaxed mb-4">{ai.summary}</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Risk Profile', value: riskTitle || '—', icon: <Layers size={14} />, tone: 'text-sky-500 bg-sky-500/10' },
                    { label: 'Equity Focus', value: 'Growth-led', icon: <TrendingUp size={14} />, tone: 'text-success bg-success/10' },
                    { label: 'Smart Rebalance', value: `+${rebalance[0].return - rebalance[1].return}% edge`, icon: <RefreshCcw size={14} />, tone: 'text-brand-orange bg-brand-orange/10' },
                  ].map((p) => (
                    <div key={p.label} className="p-3 rounded-xl bg-navy-50 dark:bg-navy-800/40 border border-default">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${p.tone}`}>
                        {p.icon}
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-secondary mb-0.5">{p.label}</div>
                      <div className="text-sm font-bold text-primary">{p.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button variant="outline" onClick={() => setScreen('risk-assessment')}>
              <RotateCcw size={16} /> Change Risk Profile
            </Button>
            <Button variant="outline" onClick={() => alert('Results saved locally (demo UI)')}>
              <Save size={16} /> Save Results
            </Button>
            <Button
              onClick={() => {
                reset()
                setScreen('risk-assessment')
              }}
              className="shadow-lg shadow-brand-orange/20"
            >
              Try Another Portfolio <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
