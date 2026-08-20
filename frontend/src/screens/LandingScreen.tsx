import {
  Line,
  XAxis,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { useTheme } from '@/context/ThemeContext'
import {
  ClipboardList,
  Layers,
  TrendingUp,
  Sparkles,
  Shield,
  Brain,
  ArrowRight,
  BarChart3,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Navbar } from '@/components/navigation/Navbar'
import { useAppState } from '@/context/AppState'

const miniChartData = [
  { m: 'Jan', p: 5000, b: 5000 },
  { m: 'Mar', p: 5600, b: 5400 },
  { m: 'May', p: 6100, b: 5800 },
  { m: 'Jul', p: 7000, b: 6500 },
  { m: 'Sep', p: 8200, b: 7300 },
  { m: 'Nov', p: 9400, b: 8100 },
  { m: 'Jan2', p: 10800, b: 9200 },
  { m: 'Mar2', p: 12500, b: 10500 },
  { m: 'May2', p: 14500, b: 11800 },
]

const workflowSteps = [
  {
    num: '01',
    title: 'Risk Profile',
    desc: 'Answer a few simple questions about your goals.',
    icon: <ClipboardList size={22} />,
    color: 'bg-sky-500',
  },
  {
    num: '02',
    title: 'Portfolio',
    desc: 'Get an allocation tailored to your risk profile.',
    icon: <Layers size={22} />,
    color: 'bg-brand-orange',
  },
  {
    num: '03',
    title: 'Backtest',
    desc: 'See how the portfolio performed historically.',
    icon: <TrendingUp size={22} />,
    color: 'bg-success',
  },
  {
    num: '04',
    title: 'Explain',
    desc: 'Understand why the portfolio performed that way.',
    icon: <Sparkles size={22} />,
    color: 'bg-purple-500',
  },
]

const features = [
  {
    icon: <BarChart3 size={20} />,
    title: 'Historical Backtesting',
    desc: 'Test your portfolio against years of real market history.',
    color: 'text-brand-orange bg-brand-orange/10',
  },
  {
    icon: <Zap size={20} />,
    title: 'Smart Rebalancing',
    desc: 'See how periodic rebalancing keeps risk in check.',
    color: 'text-sky-500 bg-sky-500/10',
  },
  {
    icon: <Brain size={20} />,
    title: 'AI Explanations',
    desc: 'Plain-language breakdown of what happened and why.',
    color: 'text-purple-500 bg-purple-500/10',
  },
  {
    icon: <Shield size={20} />,
    title: 'Benchmark Comparison',
    desc: 'Compare performance with Nifty 50, S&P 500 and more.',
    color: 'text-success bg-success/10',
  },
]

export const LandingScreen = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { setScreen } = useAppState()
  const axis = isDark ? '#64748b' : '#94a3b8'

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="landing" />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 -z-10 opacity-[0.35] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 20%, ${
                isDark ? 'rgba(249,115,22,0.18)' : 'rgba(249,115,22,0.1)'
              }, transparent 50%), radial-gradient(circle at 80% 30%, ${
                isDark ? 'rgba(14,165,233,0.15)' : 'rgba(14,165,233,0.08)'
              }, transparent 55%)`,
            }}
          />
          <div className="absolute inset-0 -z-10 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-20 sm:pt-20 sm:pb-28">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="space-y-7">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-orange/25 bg-brand-orange/5 text-brand-orange text-xs sm:text-sm font-medium">
                  <Sparkles size={14} />
                  Smart, explainable portfolio backtesting
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary tracking-tight leading-[1.05]">
                  Know how your portfolio{' '}
                  <span className="bg-gradient-to-r from-brand-orange via-brand-orange-dark to-amber-500 bg-clip-text text-transparent">
                    could have performed
                  </span>{' '}
                  before you invest.
                </h1>

                <p className="text-lg sm:text-xl text-secondary max-w-xl leading-relaxed">
                  Build a portfolio based on your risk profile, test it against real market history,
                  and understand the results in plain language — for every investor.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    size="lg"
                    onClick={() => setScreen('risk-assessment')}
                    className="shadow-lg shadow-brand-orange/20"
                  >
                    Build My Portfolio
                    <ArrowRight size={18} />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      const el = document.getElementById('how')
                      el?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    See How It Works
                  </Button>
                </div>

                <div className="flex items-center gap-5 text-xs sm:text-sm text-secondary pt-2">
                  <div className="flex -space-x-2">
                    {['#0ea5e9', '#f97316', '#10b981', '#a855f7'].map((c) => (
                      <div
                        key={c}
                        className="w-7 h-7 rounded-full border-2 border-[var(--bg-card)] flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: c }}
                      >
                        {['N', 'S', 'G', 'R'][['#0ea5e9', '#f97316', '#10b981', '#a855f7'].indexOf(c)]}
                      </div>
                    ))}
                  </div>
                  <span>Built for students & first-time investors.</span>
                </div>
              </div>

              <div className="relative">
                <Card className="relative overflow-hidden p-4 sm:p-6 shadow-2xl shadow-brand-orange/5">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-danger/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-success/80" />
                    </div>
                    <span className="text-xs font-medium text-secondary">Portfolio Growth</span>
                  </div>

                  <div className="h-[220px] sm:h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={miniChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="heroPg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity={0.28} />
                            <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="m" hide />
                        <Area
                          type="monotone"
                          dataKey="p"
                          stroke="#f97316"
                          strokeWidth={3}
                          fill="url(#heroPg)"
                          animationDuration={1500}
                        />
                        <Line
                          type="monotone"
                          dataKey="b"
                          stroke={axis}
                          strokeWidth={1.8}
                          strokeDasharray="4 4"
                          dot={false}
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      {
                        label: 'Annualized',
                        value: '+12.8%',
                        tone: 'text-success',
                      },
                      {
                        label: 'Volatility',
                        value: '14.2%',
                        tone: 'text-primary',
                      },
                      {
                        label: 'vs Benchmark',
                        value: '+3.4%',
                        tone: 'text-brand-orange',
                      },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="bg-navy-50 dark:bg-navy-800/60 rounded-xl p-3 text-center"
                      >
                        <div className={`text-sm sm:text-lg font-bold ${m.tone}`}>{m.value}</div>
                        <div className="text-[10px] sm:text-xs text-secondary mt-0.5">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-default flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-orange" />
                        <span className="text-secondary">Portfolio</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-0.5"
                          style={{
                            background: axis,
                            backgroundImage: `repeating-linear-gradient(90deg, ${axis} 0 4px, transparent 4px 8px)`,
                          }}
                        />
                        <span className="text-secondary">Benchmark</span>
                      </div>
                    </div>
                    <div className="flex -space-x-1">
                      {['#f97316', '#0ea5e9', '#eab308'].map((c) => (
                        <div
                          key={c}
                          className="w-5 h-5 rounded-full border-2 border-[var(--bg-card)]"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>
                </Card>

                <div className="absolute -top-3 -right-3 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-brand-orange/20 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-6 -left-6 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 sm:py-20 border-t border-default">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <div className="inline-block text-xs sm:text-sm font-semibold text-brand-orange uppercase tracking-wider mb-3">
                Features
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight mb-3">
                Everything you need to invest with confidence
              </h2>
              <p className="text-secondary text-sm sm:text-base">
                Four key capabilities that make RebalanceIQ beginner-friendly and data-driven.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {features.map((f) => (
                <Card key={f.title} hover className="group">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-primary mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed">{f.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="py-16 sm:py-20 border-t border-default">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
              <div className="inline-block text-xs sm:text-sm font-semibold text-brand-orange uppercase tracking-wider mb-3">
                How it works
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight mb-3">
                Four simple steps to your first portfolio
              </h2>
              <p className="text-secondary text-sm sm:text-base">
                From profile to performance in under 2 minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 relative">
              <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-sky-500 via-brand-orange via-success to-purple-500 opacity-40" />

              {workflowSteps.map((step, i) => (
                <div key={step.num} className="relative">
                  <Card className="relative h-full group" hover>
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm ${step.color}`}
                      >
                        {step.icon}
                      </div>
                      <span className="text-3xl font-bold text-navy-200 dark:text-navy-700 group-hover:text-navy-300 dark:group-hover:text-navy-600 transition-colors">
                        {step.num}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-primary mb-1.5">{step.title}</h3>
                    <p className="text-sm text-secondary leading-relaxed">{step.desc}</p>
                  </Card>

                  {i < workflowSteps.length - 1 && (
                    <div className="flex lg:hidden justify-center my-1">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-navy-300 dark:from-navy-600 to-transparent" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-14 text-center">
              <Button size="lg" onClick={() => setScreen('risk-assessment')}>
                Start My Journey
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-default py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-orange to-brand-orange-dark flex items-center justify-center">
              <BarChart3 size={14} className="text-white" />
            </div>
            <span className="font-semibold text-primary">RebalanceIQ</span>
            <span className="hidden sm:inline">· Smart, explainable portfolio backtesting for every investor</span>
          </div>
          <div>Built for hackathons · Demo UI only</div>
        </div>
      </footer>
    </div>
  )
}
