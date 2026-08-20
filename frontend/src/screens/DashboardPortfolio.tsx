import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/MetricCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { AllocationChart } from '@/components/charts/AllocationChart'
import { useAppState } from '@/context/AppState'
import { Layers, RefreshCcw, Target, TrendingUp, ArrowRight, AlertTriangle } from 'lucide-react'

export const DashboardPortfolio = () => {
  const { riskLevel, riskTitle, holdings, allocation, setScreen, runBacktest } = useAppState()
  const equityPct = holdings
    .filter((h) => h.name.toLowerCase().includes('nifty') || h.name.toLowerCase().includes('equity') || h.name.toLowerCase().includes('nasdaq') || h.name.toLowerCase().includes('large'))
    .reduce((s, h) => s + h.percentage, 0)

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
              <Layers size={20} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">Portfolio</h1>
              <p className="text-secondary text-sm sm:text-base">
                {riskTitle ? `${riskTitle} allocation · ${holdings.length} holdings` : 'Build your first portfolio.'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setScreen('portfolio')}>
            Full Editor View
          </Button>
        </div>

        {!riskLevel ? (
          <Card className="text-center py-12">
            <AlertTriangle className="mx-auto mb-4 text-amber-500" size={36} />
            <h2 className="text-xl font-semibold text-primary mb-2">No risk profile yet</h2>
            <p className="text-secondary text-sm mb-5 max-w-md mx-auto">
              Complete the risk questionnaire to get your recommended portfolio.
            </p>
            <Button onClick={() => setScreen('risk-assessment')}>Take Assessment</Button>
          </Card>
        ) : (
          <>
            <div className="grid lg:grid-cols-5 gap-5 mb-5">
              <Card className="lg:col-span-3">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-semibold text-primary">Holdings</span>
                  <span className="text-xs sm:text-sm text-secondary">{holdings.length} assets</span>
                </div>
                <div className="space-y-2.5 mb-6 max-h-[360px] overflow-y-auto pr-1">
                  {holdings.map((h, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-default flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background: h.color }}
                        >
                          {h.symbol.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-primary truncate">{h.name}</div>
                          <div className="text-xs text-secondary">{h.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-primary mb-1 w-20">
                          <ProgressBar value={h.percentage} color="" />
                        </div>
                        <div className="text-xs font-semibold text-secondary">{h.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-default">
                  <AllocationChart data={allocation} size={170} />
                </div>
              </Card>

              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <div className="font-semibold text-primary mb-3 flex items-center gap-2">
                    <Target size={16} className="text-brand-orange" /> Summary
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard label="Expected Risk" value={riskTitle} positive={null} className="!p-3" />
                    <MetricCard label="Equity" value={`${equityPct}%`} positive={null} className="!p-3" />
                    <MetricCard label="Rebalancing" value="Quarterly" positive={null} icon={<RefreshCcw size={13} />} className="!p-3" />
                    <MetricCard label="Benchmark" value="Nifty 50" positive={null} icon={<TrendingUp size={13} />} className="!p-3" />
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-brand-orange/[0.08] via-transparent to-sky-500/[0.04]">
                  <h3 className="font-semibold text-primary mb-1.5">Ready to backtest?</h3>
                  <p className="text-xs sm:text-sm text-secondary mb-4">
                    See how this portfolio performed historically.
                  </p>
                  <Button
                    fullWidth
                    onClick={() => {
                      runBacktest()
                      setScreen('dashboard-backtest')
                    }}
                    className="shadow-lg shadow-brand-orange/15"
                  >
                    Run Backtest <ArrowRight size={16} />
                  </Button>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
