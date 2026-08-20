import { useState } from 'react'
import { ArrowLeft, ArrowRight, SlidersHorizontal, TrendingUp, Layers, Target, RefreshCcw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/MetricCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Navbar } from '@/components/navigation/Navbar'
import { useAppState } from '@/context/AppState'
import { AllocationChart } from '@/components/charts/AllocationChart'
import { Modal } from '@/components/ui/Modal'
import type { Holding } from '@/data/mockData'

export const PortfolioScreen = () => {
  const { riskLevel, riskTitle, holdings, setHoldings, allocation, setScreen, runBacktest } =
    useAppState()
  const [showAdjust, setShowAdjust] = useState(false)
  const [adjusted, setAdjusted] = useState<Holding[]>(holdings)

  if (!riskLevel) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar variant="landing" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md text-center py-10">
            <AlertTriangle className="mx-auto mb-4 text-amber-500" size={36} />
            <h2 className="text-xl font-semibold text-primary mb-2">No risk profile</h2>
            <p className="text-secondary text-sm mb-5">
              Start with the risk questionnaire to get a portfolio recommendation.
            </p>
            <Button onClick={() => setScreen('risk-assessment')}>Take Assessment</Button>
          </Card>
        </div>
      </div>
    )
  }

  const equityPct = holdings
    .filter((h) => {
      const n = h.name.toLowerCase()
      return n.includes('nifty') || n.includes('equity') || n.includes('nasdaq') || n.includes('large')
    })
    .reduce((s, h) => s + h.percentage, 0)

  const openAdjust = () => {
    setAdjusted([...holdings])
    setShowAdjust(true)
  }

  const saveAdjust = () => {
    const total = adjusted.reduce((s, h) => s + h.percentage, 0)
    if (Math.abs(total - 100) > 0.5) return
    setHoldings(adjusted)
    setShowAdjust(false)
  }

  const totalAdjPct = adjusted.reduce((s, h) => s + h.percentage, 0)
  const canSave = Math.abs(totalAdjPct - 100) <= 0.5

  const updateHoldingPct = (idx: number, p: number) => {
    const next = [...adjusted]
    next[idx] = { ...next[idx], percentage: Math.max(0, Math.min(100, p)) }
    setAdjusted(next)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="landing" />

      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setScreen('risk-result')}
            className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to risk profile
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-500 text-xs font-semibold mb-3">
                <Layers size={13} /> Step 3 · Portfolio
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight mb-1.5">
                Your recommended portfolio
              </h1>
              <p className="text-secondary text-sm sm:text-base">
                Built around your <span className="font-semibold text-primary">{riskTitle}</span> risk profile.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={openAdjust}>
              <SlidersHorizontal size={15} /> Adjust Portfolio
            </Button>
          </div>

          <div className="grid lg:grid-cols-5 gap-4 sm:gap-5 mb-6">
            <Card className="lg:col-span-3">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base sm:text-lg font-semibold text-primary">Holdings</h2>
                <span className="text-xs sm:text-sm text-secondary">{holdings.length} assets</span>
              </div>

              <div className="space-y-3 mb-6">
                {holdings.map((h, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-4 rounded-xl border border-default hover:border-navy-200 dark:hover:border-navy-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0"
                          style={{ background: h.color }}
                        >
                          {h.symbol.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm sm:text-base text-primary truncate">{h.name}</div>
                          <div className="text-xs text-secondary">{h.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-3">
                        <div className="text-base sm:text-lg font-bold text-primary">{h.percentage}%</div>
                      </div>
                    </div>
                    <ProgressBar value={h.percentage} />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-default">
                <AllocationChart data={allocation} size={180} />
              </div>
            </Card>

            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5">
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                    <Target size={18} />
                  </div>
                  <h3 className="text-sm font-semibold text-primary">Portfolio Summary</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    label="Expected Risk"
                    value={riskTitle}
                    subvalue="Based on profile"
                    positive={null}
                    className="!p-3"
                  />
                  <MetricCard
                    label="Equity Exposure"
                    value={equityPct + '%'}
                    subvalue="Stocks & ETFs"
                    positive={null}
                    className="!p-3"
                  />
                  <MetricCard
                    label="Rebalancing"
                    value="Quarterly"
                    subvalue="Recommended"
                    positive={null}
                    icon={<RefreshCcw size={14} />}
                    className="!p-3"
                  />
                  <MetricCard
                    label="Benchmark"
                    value="Nifty 50"
                    subvalue="Compare against"
                    positive={null}
                    icon={<TrendingUp size={14} />}
                    className="!p-3"
                  />
                </div>
              </Card>

              <Card className="flex-1 bg-gradient-to-br from-brand-orange/[0.08] via-transparent to-sky-500/[0.05]">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-orange flex items-center justify-center text-white shadow-sm">
                    <Target size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">Ready to backtest?</h3>
                    <p className="text-xs sm:text-sm text-secondary">
                      Let's see how this portfolio would have performed historically.
                    </p>
                  </div>
                </div>
                <Button
                  fullWidth
                  onClick={() => {
                    runBacktest()
                    setScreen('backtest')
                  }}
                  className="shadow-lg shadow-brand-orange/20"
                >
                  Run Backtest <ArrowRight size={16} />
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Modal open={showAdjust} onClose={() => setShowAdjust(false)} title="Adjust Allocation" size="lg">
        <div className="space-y-4">
          {adjusted.map((h, idx) => (
            <div key={h.symbol}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md" style={{ background: h.color }} />
                  <span className="text-sm font-medium text-primary">{h.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={h.percentage}
                    onChange={(e) => updateHoldingPct(idx, parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-sm rounded-lg border border-default bg-card text-primary text-right focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                  />
                  <span className="text-sm text-secondary w-5">%</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={h.percentage}
                onChange={(e) => updateHoldingPct(idx, parseInt(e.target.value))}
                className="w-full accent-brand-orange"
              />
            </div>
          ))}

          <div className={`flex items-center justify-between p-3 rounded-xl ${canSave ? 'bg-success/5 border border-success/20' : 'bg-danger/5 border border-danger/20'}`}>
            <span className={`text-sm font-medium ${canSave ? 'text-success' : 'text-danger'}`}>
              Total: {totalAdjPct.toFixed(1)}% {canSave ? '(balanced)' : '(must equal 100%)'}
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowAdjust(false)}>Cancel</Button>
            <Button onClick={saveAdjust} disabled={!canSave}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
