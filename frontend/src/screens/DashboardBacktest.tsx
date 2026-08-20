import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/MetricCard'
import { Button } from '@/components/ui/Button'
import { PerformanceChart } from '@/components/charts/PerformanceChart'
import { LoadingState } from '@/components/ui/LoadingState'
import { useAppState } from '@/context/AppState'
import {
  TrendingUp,
  BarChart2,
  RefreshCcw,
  Calendar,
  Target,
  ChevronDown,
  Sparkles,
  Shield,
  ArrowRight,
  MessageSquare,
  Send,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import {
  generateHistoricalData,
  getPerformanceMetrics,
  getRebalanceComparison,
  getAIExplanation,
  benchmarks,
  rebalancingOptions,
  periodOptions,
  loadingStages,
  type ChartPoint,
  type PerformanceMetrics,
  type RebalanceComparison,
  type AIExplanation,
} from '@/data/mockData'

export const DashboardBacktest = () => {
  const { backtestParams, setBacktestParams, backtestRun, runBacktest, setScreen } = useAppState()
  const [loading, setLoading] = useState(!backtestRun)
  const [stage, setStage] = useState(0)
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [rebalance, setRebalance] = useState<RebalanceComparison[]>([])
  const [ai, setAi] = useState<AIExplanation | null>(null)
  const [benchOpen, setBenchOpen] = useState(false)
  const [showAsk, setShowAsk] = useState(false)
  const [askInput, setAskInput] = useState('')
  const [askMsgs, setAskMsgs] = useState<{ from: 'user' | 'ai'; text: string }[]>([
    { from: 'ai', text: 'Ask anything about your results!' },
  ])

  const benchLabel = useMemo(
    () => benchmarks.find((b) => b.value === backtestParams.benchmark)?.label || 'Nifty 50',
    [backtestParams.benchmark],
  )

  useEffect(() => {
    if (!loading) return
    const timers: number[] = []
    loadingStages.forEach((_, i) => timers.push(window.setTimeout(() => setStage(i), 800 * i)))
    timers.push(
      window.setTimeout(() => {
        setChartData(generateHistoricalData(backtestParams.years, backtestParams.rebalancing, backtestParams.benchmark))
        setMetrics(getPerformanceMetrics(backtestParams.years))
        setRebalance(getRebalanceComparison())
        setAi(getAIExplanation())
        runBacktest()
        setLoading(false)
      }, 800 * loadingStages.length + 400),
    )
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const rerun = () => {
    setLoading(true)
    setStage(0)
  }

  const sendAsk = () => {
    const q = askInput.trim()
    if (!q) return
    setAskMsgs((m) => [...m, { from: 'user', text: q }])
    setAskInput('')
    setTimeout(() => {
      setAskMsgs((m) => [
        ...m,
        {
          from: 'ai',
          text: `Based on your backtest: equity drove growth, debt+gold protected on downside, and rebalancing kept risk consistent. Overall +${metrics?.vsBenchmark.toFixed(1) || '4.8'}% vs ${benchLabel}.`,
        },
      ])
    }, 500)
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">Backtest</h1>
              <p className="text-secondary text-sm sm:text-base">Historical performance of your strategy.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={rerun}>
              <RefreshCcw size={15} /> Re-Run
            </Button>
            <Button size="sm" onClick={() => setScreen('dashboard-results')}>
              Results <ArrowRight size={15} />
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <LoadingState stages={loadingStages} currentStage={stage} />
          </Card>
        ) : (
          <>
            <Card className="mb-5">
              <div className="grid lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-secondary mb-1.5 block">Monthly Investment</label>
                  <input
                    type="number"
                    value={backtestParams.investment}
                    onChange={(e) => setBacktestParams({ investment: Math.max(500, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 rounded-xl border border-default bg-card text-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-secondary mb-1.5 block flex items-center gap-1.5"><Calendar size={12} /> Period</label>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-navy-50 dark:bg-navy-800/50 rounded-xl">
                    {periodOptions.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => { setBacktestParams({ years: p.value }); rerun() }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold ${backtestParams.years === p.value ? 'bg-brand-orange text-white' : 'text-secondary hover:text-primary'}`}
                      >{p.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-secondary mb-1.5 block"><RefreshCcw size={12} className="inline mr-1" />Rebalancing</label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-navy-50 dark:bg-navy-800/50 rounded-xl">
                    {rebalancingOptions.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => { setBacktestParams({ rebalancing: r.value }); rerun() }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold ${backtestParams.rebalancing === r.value ? 'bg-brand-orange text-white' : 'text-secondary hover:text-primary'}`}
                      >{r.label}</button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <label className="text-xs font-semibold text-secondary mb-1.5 block"><Target size={12} className="inline mr-1" />Benchmark</label>
                  <button
                    onClick={() => setBenchOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-default bg-card text-sm"
                  >
                    <span className="font-medium text-primary">{benchLabel}</span>
                    <ChevronDown size={14} className={`transition ${benchOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {benchOpen && (
                    <div className="absolute right-0 left-0 z-20 mt-1 bg-card border border-default rounded-xl shadow-lg overflow-hidden">
                      {benchmarks.map((b) => (
                        <button
                          key={b.value}
                          onClick={() => { setBacktestParams({ benchmark: b.value }); setBenchOpen(false); rerun() }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-navy-50 dark:hover:bg-navy-800"
                        >{b.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="mb-5">
              <h2 className="text-base sm:text-lg font-semibold text-primary mb-4">Growth Chart</h2>
              <PerformanceChart data={chartData} height={340} />
            </Card>

            {metrics && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
                <MetricCard label="Total Return" value={`+${metrics.totalReturn.toFixed(1)}%`} positive icon={<TrendingUp size={14} />} className="!p-3" />
                <MetricCard label="CAGR" value={`${metrics.cagr.toFixed(1)}%`} positive icon={<BarChart2 size={14} />} tooltip="Annualized return" className="!p-3" />
                <MetricCard label="Volatility" value={`${metrics.volatility.toFixed(1)}%`} positive={null} className="!p-3" />
                <MetricCard label="Max DD" value={`${metrics.maxDrawdown.toFixed(1)}%`} positive={false} className="!p-3" />
                <MetricCard label="vs Benchmark" value={`+${metrics.vsBenchmark.toFixed(1)}%`} positive icon={<Target size={14} />} className="!p-3" />
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-5 mb-5">
              <Card>
                <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                  <RefreshCcw size={18} className="text-brand-orange" /> Rebalancing Impact
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  {rebalance.map((r, i) => (
                    <div key={r.strategy} className={`p-4 rounded-xl border ${i === 0 ? 'border-brand-orange/40 bg-brand-orange/5' : 'border-default'}`}>
                      <div className="text-xs text-secondary mb-1">{r.strategy}</div>
                      <div className="text-xl font-bold text-primary mb-0.5">₹{r.finalValue.toLocaleString('en-IN')}</div>
                      <div className={`text-xs font-semibold ${i === 0 ? 'text-brand-orange' : 'text-secondary'}`}>+{r.return}%</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/[0.06] to-brand-orange/[0.05]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-primary flex items-center gap-2">
                    <Sparkles size={18} className="text-brand-orange" /> AI Explanation
                  </h3>
                  <Button size="sm" variant="outline" onClick={() => setShowAsk(true)}>
                    <MessageSquare size={13} /> Ask
                  </Button>
                </div>
                {ai && (
                  <>
                    <p className="text-sm text-primary leading-relaxed mb-3 p-3 rounded-xl bg-card border border-default">{ai.summary}</p>
                    <div className="space-y-2">
                      {[
                        ['What helped', ai.whatHelped, 'text-success bg-success/10', TrendingUp],
                        ['Protected', ai.whatProtected, 'text-sky-500 bg-sky-500/10', Shield],
                        ['Rebalancing', ai.whatRebalancing, 'text-brand-orange bg-brand-orange/10', RefreshCcw],
                      ].map(([lbl, txt, cls, Icon]) => (
                        <div key={lbl as string} className="flex gap-3 p-3 rounded-xl bg-card border border-default items-start">
                          <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${cls as string}`}>
                            <Icon size={14} />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-secondary">{lbl}</div>
                            <div className="text-sm text-primary">{txt}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </div>

            <Card>
              <h3 className="font-semibold text-primary mb-4 flex items-center gap-2"><Target size={18} className="text-sky-500" /> vs {benchLabel}</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-xl border border-default relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-orange to-brand-orange-dark" />
                  <div className="text-sm text-secondary mb-1">Your Portfolio</div>
                  <div className="text-3xl font-bold text-primary mb-1">₹{rebalance[0]?.finalValue.toLocaleString('en-IN')}</div>
                  <div className="text-sm text-success font-semibold">+{rebalance[0]?.return}%</div>
                </div>
                <div className="p-4 rounded-xl border border-default relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-navy-500" />
                  <div className="text-sm text-secondary mb-1">{benchLabel}</div>
                  <div className="text-3xl font-bold text-primary mb-1">₹13,850</div>
                  <div className="text-sm text-success font-semibold">+38.5%</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-success/5 border border-success/20">
                <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center"><TrendingUp size={24} /></div>
                <div><div className="text-2xl font-bold text-success">+6.7%</div><div className="text-sm text-secondary">Outperformance vs {benchLabel}</div></div>
              </div>
            </Card>
          </>
        )}

        <Modal open={showAsk} onClose={() => setShowAsk(false)} title="Ask AI" size="lg">
          <div className="flex flex-col h-80">
            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {askMsgs.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${m.from === 'user' ? 'bg-brand-orange text-white' : 'bg-navy-50 dark:bg-navy-800 text-primary border border-default'}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-3 border-t border-default">
              <input
                value={askInput}
                onChange={(e) => setAskInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendAsk()}
                placeholder="Ask about your backtest..."
                className="flex-1 px-3 py-2 rounded-xl border border-default bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
              />
              <Button onClick={sendAsk}><Send size={15} /></Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
