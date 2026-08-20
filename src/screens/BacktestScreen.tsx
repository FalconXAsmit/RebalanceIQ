import { useEffect, useMemo, useState } from 'react'
import {
  TrendingUp,
  BarChart2,
  ArrowLeft,
  ChevronDown,
  RefreshCcw,
  Calendar,
  Sparkles,
  ArrowRight,
  Target,
  Shield,
  MessageSquare,
  Send,
  TrendingDown,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/MetricCard'
import { Navbar } from '@/components/navigation/Navbar'
import { useAppState } from '@/context/AppState'
import { PerformanceChart } from '@/components/charts/PerformanceChart'
import { LoadingState } from '@/components/ui/LoadingState'
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

export const BacktestScreen = () => {
  const { riskLevel, backtestParams, setBacktestParams, setScreen, backtestRun } = useAppState()

  const [loading, setLoading] = useState(!backtestRun)
  const [stage, setStage] = useState(0)
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [rebalance, setRebalance] = useState<RebalanceComparison[]>([])
  const [ai, setAi] = useState<AIExplanation | null>(null)
  const [showAsk, setShowAsk] = useState(false)
  const [askInput, setAskInput] = useState('')
  const [askMsgs, setAskMsgs] = useState<{ from: 'user' | 'ai'; text: string }[]>([
    { from: 'ai', text: "Hi! Ask me anything about your backtest results — I'll explain them in plain language." },
  ])
  const [benchOpen, setBenchOpen] = useState(false)

  useEffect(() => {
    if (!loading) return
    const timers: number[] = []
    loadingStages.forEach((_, i) => {
      timers.push(window.setTimeout(() => setStage(i), 900 * i))
    })
    timers.push(
      window.setTimeout(() => {
        const cd = generateHistoricalData(backtestParams.years, backtestParams.rebalancing, backtestParams.benchmark)
        setChartData(cd)
        setMetrics(getPerformanceMetrics(backtestParams.years))
        setRebalance(getRebalanceComparison())
        setAi(getAIExplanation())
        setLoading(false)
      }, 900 * loadingStages.length + 400),
    )
    return () => timers.forEach(clearTimeout)
  }, [loading, backtestParams.years, backtestParams.rebalancing, backtestParams.benchmark])

  const rerun = () => {
    setLoading(true)
    setStage(0)
  }

  const benchmarkLabel = useMemo(
    () => benchmarks.find((b) => b.value === backtestParams.benchmark)?.label || 'Nifty 50',
    [backtestParams.benchmark],
  )

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
          text: `Great question! Based on your backtest: ${
            q.toLowerCase().includes('volatility') || q.toLowerCase().includes('risk')
              ? `Your portfolio has a volatility of around ${metrics?.volatility.toFixed(1)}%, which is typical for a ${riskLevel || 'moderate'} allocation. The debt and gold components help smooth out the ups and downs compared to a 100% equity portfolio.`
              : q.toLowerCase().includes('rebalanc')
              ? `Quarterly rebalancing contributed about +${((rebalance[0]?.return || 0) - (rebalance[1]?.return || 0)).toFixed(1)}% extra return vs buy-and-hold, and kept your asset allocation from drifting too far from your risk targets.`
              : q.toLowerCase().includes('benchmark') || q.toLowerCase().includes('nifty') || q.toLowerCase().includes('beat')
              ? `Your portfolio beat ${benchmarkLabel} by about +${metrics?.vsBenchmark.toFixed(1)}% over ${backtestParams.years} years thanks to diversified holdings and disciplined rebalancing.`
              : `Equity exposure was the main growth driver, while debt and gold provided downside protection. Rebalancing ensured your risk stayed consistent over time. Try asking about volatility, rebalancing, or the benchmark.`
          }`,
        },
      ])
    }, 500)
  }

  if (!riskLevel && !loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar variant="landing" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md text-center py-10">
            <BarChart2 className="mx-auto mb-4 text-secondary" size={36} />
            <h2 className="text-xl font-semibold text-primary mb-2">Backtest not ready</h2>
            <p className="text-secondary text-sm mb-5">Build your portfolio first before running a backtest.</p>
            <Button onClick={() => setScreen('risk-assessment')}>Get Started</Button>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar variant="landing" />
        <div className="flex-1 px-4 sm:px-6">
          <LoadingState
            stages={loadingStages}
            currentStage={stage}
            title="Running your backtest"
            subtitle={`Monthly ₹${backtestParams.investment.toLocaleString('en-IN')} · ${backtestParams.years}Y · ${backtestParams.rebalancing}`}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="landing" />

      <main className="flex-1 py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setScreen('portfolio')}
            className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary mb-5 transition-colors"
          >
            <ArrowLeft size={16} /> Back to portfolio
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold mb-3">
                <TrendingUp size={13} /> Step 4 · Backtest Ready
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight mb-1.5">
                Portfolio Backtest
              </h1>
              <p className="text-secondary text-sm sm:text-base">
                See how your strategy would have performed historically.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={rerun}>
                <RefreshCcw size={15} /> Re-Run
              </Button>
              <Button size="sm" onClick={() => setScreen('results')}>
                View Results <ArrowRight size={15} />
              </Button>
            </div>
          </div>

          <Card className="mb-5 sm:mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-semibold text-secondary mb-1.5 flex items-center gap-1.5">
                  <BarChart2 size={12} /> Investment (₹/month)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step={500}
                    min={1000}
                    value={backtestParams.investment}
                    onChange={(e) => setBacktestParams({ investment: Math.max(500, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 text-sm font-medium rounded-xl border border-default bg-card text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="text-xs font-semibold text-secondary mb-1.5 flex items-center gap-1.5">
                  <Calendar size={12} /> Period
                </label>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-navy-50 dark:bg-navy-800/50 rounded-xl">
                  {periodOptions.map((p) => {
                    const active = backtestParams.years === p.value
                    return (
                      <button
                        key={p.value}
                        onClick={() => {
                          setBacktestParams({ years: p.value })
                          rerun()
                        }}
                        className={`px-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                          active
                            ? 'bg-brand-orange text-white shadow-sm'
                            : 'text-secondary hover:text-primary hover:bg-card'
                        }`}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex-1">
                <label className="text-xs font-semibold text-secondary mb-1.5 flex items-center gap-1.5">
                  <RefreshCcw size={12} /> Rebalancing
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-navy-50 dark:bg-navy-800/50 rounded-xl">
                  {rebalancingOptions.map((r) => {
                    const active = backtestParams.rebalancing === r.value
                    return (
                      <button
                        key={r.value}
                        onClick={() => {
                          setBacktestParams({ rebalancing: r.value })
                          rerun()
                        }}
                        className={`px-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                          active
                            ? 'bg-brand-orange text-white shadow-sm'
                            : 'text-secondary hover:text-primary hover:bg-card'
                        }`}
                      >
                        {r.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex-1 relative">
                <label className="text-xs font-semibold text-secondary mb-1.5 flex items-center gap-1.5">
                  <Target size={12} /> Benchmark
                </label>
                <button
                  onClick={() => setBenchOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-default bg-card hover:border-brand-orange/40 transition-colors"
                >
                  <span className="text-sm font-medium text-primary">{benchmarkLabel}</span>
                  <ChevronDown size={16} className={`text-secondary transition-transform ${benchOpen ? 'rotate-180' : ''}`} />
                </button>
                {benchOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-card border border-default rounded-xl shadow-lg overflow-hidden">
                    {benchmarks.map((b) => (
                      <button
                        key={b.value}
                        onClick={() => {
                          setBacktestParams({ benchmark: b.value })
                          setBenchOpen(false)
                          rerun()
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors ${
                          backtestParams.benchmark === b.value ? 'text-brand-orange font-semibold' : 'text-primary'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="mb-5 sm:mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-primary">Growth of ₹{backtestParams.investment.toLocaleString('en-IN')} / month</h2>
                <p className="text-xs sm:text-sm text-secondary">RebalanceIQ Portfolio vs {benchmarkLabel}</p>
              </div>
            </div>
            <PerformanceChart data={chartData} height={360} />
          </Card>

          {metrics && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-5 sm:mb-6">
              <MetricCard
                label="Total Return"
                value={`${metrics.totalReturn >= 0 ? '+' : ''}${metrics.totalReturn.toFixed(1)}%`}
                subvalue="Over period"
                positive={metrics.totalReturn >= 0}
                icon={<TrendingUp size={14} />}
              />
              <MetricCard
                label="CAGR"
                value={`${metrics.cagr.toFixed(1)}%`}
                subvalue="Annualized"
                positive={metrics.cagr >= 0}
                icon={<BarChart2 size={14} />}
                tooltip="Compound Annual Growth Rate — the average yearly return of your investment, accounting for compounding."
              />
              <MetricCard
                label="Volatility"
                value={`${metrics.volatility.toFixed(1)}%`}
                subvalue="Standard deviation"
                positive={null}
                icon={<TrendingDown size={14} />}
                tooltip="How much returns vary month-to-month. Higher = bigger ups and downs."
              />
              <MetricCard
                label="Max Drawdown"
                value={`${metrics.maxDrawdown.toFixed(1)}%`}
                subvalue="Worst peak-to-trough"
                positive={false}
                icon={<TrendingDown size={14} />}
                tooltip="The largest percentage drop from a previous peak. Useful for understanding worst-case losses."
              />
              <MetricCard
                label="vs Benchmark"
                value={`${metrics.vsBenchmark >= 0 ? '+' : ''}${metrics.vsBenchmark.toFixed(1)}%`}
                subvalue={`vs ${benchmarkLabel}`}
                positive={metrics.vsBenchmark >= 0}
                icon={<Target size={14} />}
                tooltip="How much extra return your portfolio generated compared to the benchmark."
              />
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 mb-5 sm:mb-6">
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                  <RefreshCcw size={18} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-primary">What rebalancing changed</h3>
                  <p className="text-xs sm:text-sm text-secondary">Rebalanced portfolio vs buy & hold</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                {rebalance.map((r, i) => {
                  const isReb = i === 0
                  return (
                    <div
                      key={r.strategy}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isReb
                          ? 'border-brand-orange/40 bg-brand-orange/5'
                          : 'border-default'
                      }`}
                    >
                      <div className="text-xs font-medium text-secondary mb-1.5">{r.strategy}</div>
                      <div className="text-2xl font-bold text-primary mb-0.5">
                        ₹{r.finalValue.toLocaleString('en-IN')}
                      </div>
                      <div className={`text-sm font-semibold ${isReb ? 'text-brand-orange' : 'text-secondary'}`}>
                        +{r.return}% return
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="pt-4 border-t border-default">
                <div className="text-xs font-medium text-secondary mb-3">Rebalancing Flow</div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { label: 'Target', sub: '70 / 20 / 10', color: 'bg-success/10 text-success border-success/30' },
                    { label: 'Drift', sub: '82 / 12 / 6', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
                    { label: 'Rebalanced', sub: '70 / 20 / 10', color: 'bg-brand-orange/10 text-brand-orange border-brand-orange/30' },
                  ].map((f) => (
                    <div
                      key={f.label}
                      className={`p-3 rounded-xl border text-center ${f.color}`}
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80 mb-1">
                        {f.label}
                      </div>
                      <div className="text-sm font-bold">{f.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/[0.06] via-transparent to-brand-orange/[0.05]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-brand-orange flex items-center justify-center text-white shadow-sm">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-primary">
                      Why did your portfolio perform this way?
                    </h3>
                    <p className="text-xs sm:text-sm text-secondary">AI-generated explanation</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowAsk(true)}>
                  <MessageSquare size={14} /> Ask AI
                </Button>
              </div>

              {ai && (
                <>
                  <p className="text-sm sm:text-[15px] text-primary leading-relaxed mb-5 p-4 rounded-xl bg-card border border-default">
                    {ai.summary}
                  </p>

                  <div className="space-y-2.5">
                    {[
                      { label: 'What helped', text: ai.whatHelped, icon: <TrendingUp size={14} />, tone: 'success' },
                      { label: 'What protected you', text: ai.whatProtected, icon: <Shield size={14} />, tone: 'sky' },
                      { label: 'What rebalancing did', text: ai.whatRebalancing, icon: <RefreshCcw size={14} />, tone: 'orange' },
                    ].map((p) => (
                      <div key={p.label} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-default">
                        <div
                          className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                            p.tone === 'success'
                              ? 'bg-success/10 text-success'
                              : p.tone === 'sky'
                              ? 'bg-sky-500/10 text-sky-500'
                              : 'bg-brand-orange/10 text-brand-orange'
                          }`}
                        >
                          {p.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold uppercase tracking-wider text-secondary mb-0.5">
                            {p.label}
                          </div>
                          <div className="text-sm text-primary leading-relaxed">{p.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>

          <Card className="mb-5 sm:mb-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
                <Target size={18} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-primary">Portfolio vs Benchmark</h3>
                <p className="text-xs sm:text-sm text-secondary">Final value after {backtestParams.years} years</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
              {[
                {
                  name: 'Your Portfolio',
                  value: rebalance[0]?.finalValue || 14500,
                  return: rebalance[0]?.return || 45,
                  accent: 'from-brand-orange to-brand-orange-dark',
                  textAccent: 'text-brand-orange',
                },
                {
                  name: benchmarkLabel,
                  value: 13850,
                  return: 38.5,
                  accent: 'from-navy-500 to-navy-700',
                  textAccent: 'text-secondary',
                },
              ].map((c) => (
                <div key={c.name} className="p-5 rounded-2xl border border-default relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.accent}`} />
                  <div className="text-sm font-medium text-secondary mb-2">{c.name}</div>
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">
                    ₹{c.value.toLocaleString('en-IN')}
                  </div>
                  <div className={`text-sm font-semibold ${c.return >= 0 ? 'text-success' : 'text-danger'}`}>
                    +{c.return}% total return
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl bg-success/5 border border-success/20">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-success/15 flex items-center justify-center text-success">
                <TrendingUp size={28} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-success mb-0.5">+6.7%</div>
                <div className="text-sm text-secondary">Outperformance vs {benchmarkLabel}</div>
              </div>
              <div className="flex flex-col gap-1 text-xs sm:text-sm text-secondary w-full sm:w-auto">
                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-orange" /> Portfolio</span>
                  <span className="font-semibold text-primary">₹{rebalance[0]?.finalValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-navy-400" /> {benchmarkLabel}</span>
                  <span className="font-semibold text-secondary">₹13,850</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="text-center">
            <Button size="lg" onClick={() => setScreen('results')} className="shadow-lg shadow-brand-orange/20">
              See Full Results <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </main>

      <Modal open={showAsk} onClose={() => setShowAsk(false)} title="Ask AI about this result" size="lg">
        <div className="flex flex-col h-[420px]">
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
            {askMsgs.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.from === 'user'
                      ? 'bg-brand-orange text-white rounded-br-md'
                      : 'bg-navy-50 dark:bg-navy-800 text-primary border border-default rounded-bl-md'
                  }`}
                >
                  {m.from === 'ai' && (
                    <div className="flex items-center gap-1.5 text-xs opacity-70 mb-1">
                      <Sparkles size={11} /> RebalanceIQ AI
                    </div>
                  )}
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-default">
            <input
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendAsk()}
              placeholder="Ask about volatility, rebalancing, benchmarks..."
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-default bg-card text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange/30 placeholder:text-secondary/70"
            />
            <Button onClick={sendAsk}>
              <Send size={16} />
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
