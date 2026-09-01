import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/MetricCard'
import { Button } from '@/components/ui/Button'
import { useAppState } from '@/context/AppState'
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Shield,
  RefreshCcw,
  Target,
  ArrowRight,
  RotateCcw,
  Save,
  Layers,
  AlertTriangle,
} from 'lucide-react'
import { getPerformanceMetrics, getRebalanceComparison, getAIExplanation, benchmarks } from '@/data/mockData'

export const DashboardResults = () => {
  const { riskTitle, backtestParams, backtestRun, setScreen, reset } = useAppState()

  if (!backtestRun) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
          <Card className="text-center py-12">
            <AlertTriangle className="mx-auto mb-4 text-amber-500" size={36} />
            <h2 className="text-xl font-semibold text-primary mb-2">No results yet</h2>
            <p className="text-secondary text-sm mb-5 max-w-md mx-auto">
              Run a backtest to see results.
            </p>
            <Button onClick={() => setScreen('dashboard-backtest')}>Go to Backtest</Button>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const metrics = getPerformanceMetrics(backtestParams.years)
  const rebalance = getRebalanceComparison()
  const ai = getAIExplanation()
  const benchLabel = benchmarks.find((b) => b.value === backtestParams.benchmark)?.label || 'Nifty 50'
  const invested = backtestParams.investment * backtestParams.years * 12

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-brand-orange flex items-center justify-center text-white shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">Results</h1>
              <p className="text-secondary text-sm sm:text-base">Complete backtest summary.</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">
            <CheckCircle2 size={13} /> Backtest Ready
          </div>
        </div>

        <Card className="mb-5 bg-gradient-to-br from-brand-orange/[0.08] via-transparent to-sky-500/[0.05]">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <div className="text-sm text-secondary mb-1">Invested Total ({backtestParams.years}Y)</div>
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">₹{invested.toLocaleString('en-IN')}</div>
              <div className="text-xs text-secondary">₹{backtestParams.investment.toLocaleString('en-IN')}/mo</div>
            </div>
            <div>
              <div className="text-sm text-secondary mb-1">Final Value</div>
              <div className="text-3xl sm:text-4xl font-bold text-brand-orange mb-1">₹{rebalance[0].finalValue.toLocaleString('en-IN')}</div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold">
                <TrendingUp size={10} /> +{metrics.totalReturn.toFixed(1)}%
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
          <MetricCard label="CAGR" value={`${metrics.cagr.toFixed(1)}%`} positive icon={<TrendingUp size={14} />} className="!p-4" />
          <MetricCard label="Max DD" value={`${metrics.maxDrawdown.toFixed(1)}%`} positive={false} icon={<Shield size={14} />} className="!p-4" />
          <MetricCard label={`vs ${benchLabel}`} value={`+${metrics.vsBenchmark.toFixed(1)}%`} positive icon={<Target size={14} />} className="!p-4" />
          <MetricCard label="Rebalancing" value={backtestParams.rebalancing} positive={null} icon={<RefreshCcw size={14} />} className="!p-4" />
        </div>

        <Card className="mb-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-purple-500 to-brand-orange flex items-center justify-center text-white shadow-sm">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary mb-1">AI Summary</h3>
              <p className="text-sm sm:text-base text-secondary leading-relaxed mb-4">{ai.summary}</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  ['Risk Profile', riskTitle || '—', Layers, 'text-sky-500 bg-sky-500/10'],
                  ['Growth', 'Equity-driven', TrendingUp, 'text-success bg-success/10'],
                  ['Rebalance Edge', `+${rebalance[0].return - rebalance[1].return}%`, RefreshCcw, 'text-brand-orange bg-brand-orange/10'],
                ].map(([lbl, val, Icon, cls]) => (
                  <div key={lbl as string} className="p-3 rounded-xl bg-navy-50 dark:bg-navy-800/40 border border-default">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${cls as string}`}><Icon size={14} /></div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-secondary mb-0.5">{lbl as any}</div>
                    <div className="text-sm font-bold text-primary">{val as any}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="outline" onClick={() => setScreen('dashboard-risk')}><RotateCcw size={15} /> New Profile</Button>
          <Button variant="outline" onClick={() => alert('Saved locally (demo)')}><Save size={15} /> Save</Button>
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
    </DashboardLayout>
  )
}
