import { ArrowLeft, ArrowRight, Info, CheckCircle2, Shield, Target, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Navbar } from '@/components/navigation/Navbar'
import { useAppState } from '@/context/AppState'
import { AllocationChart } from '@/components/charts/AllocationChart'
import { RiskMeter } from '@/components/charts/RiskMeter'

export const RiskResultScreen = () => {
  const { riskLevel, riskTitle, riskDesc, allocation, setScreen } = useAppState()

  if (!riskLevel) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar variant="landing" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md text-center py-10">
            <Info className="mx-auto mb-4 text-secondary" size={36} />
            <h2 className="text-xl font-semibold text-primary mb-2">No profile yet</h2>
            <p className="text-secondary text-sm mb-5">
              Complete the risk questionnaire first to see your profile.
            </p>
            <Button onClick={() => setScreen('risk-assessment')}>Take Assessment</Button>
          </Card>
        </div>
      </div>
    )
  }

  const summaryCards = [
    {
      icon: <TrendingUp size={16} />,
      title: 'Growth potential',
      value:
        riskLevel === 'conservative'
          ? 'Low–Moderate'
          : riskLevel === 'moderate'
          ? 'Moderate–High'
          : 'High',
      desc: 'Expected long-term return range',
      toneClass: 'text-success',
      bgClass: 'bg-success/10',
    },
    {
      icon: <Shield size={16} />,
      title: 'Volatility level',
      value: riskLevel === 'conservative' ? 'Low' : riskLevel === 'moderate' ? 'Moderate' : 'High',
      desc: 'Expected short-term ups & downs',
      toneClass: 'text-sky-500',
      bgClass: 'bg-sky-500/10',
    },
    {
      icon: <Target size={16} />,
      title: 'Time horizon',
      value: riskLevel === 'conservative' ? '3+ years' : riskLevel === 'moderate' ? '5+ years' : '10+ years',
      desc: 'Recommended minimum holding period',
      toneClass: 'text-brand-orange',
      bgClass: 'bg-brand-orange/10',
    },
  ]

  const profileColorClass =
    riskLevel === 'conservative'
      ? 'text-sky-500'
      : riskLevel === 'moderate'
      ? 'text-brand-orange'
      : 'text-danger'

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="landing" />

      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setScreen('risk-assessment')}
            className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to questionnaire
          </button>

          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold mb-4">
              <CheckCircle2 size={13} /> Step 2 complete
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight mb-2">
              Your investor profile
            </h1>
            <p className="text-secondary text-sm sm:text-base">
              Based on your answers, here's what we recommend.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4 sm:gap-5 mb-6">
            <Card className="md:col-span-2">
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                    <Target size={18} />
                  </div>
                  <span className="text-sm font-medium text-secondary">Risk Profile</span>
                </div>

                <div className="mb-6">
                  <div className={`text-3xl sm:text-4xl font-bold mb-2 ${profileColorClass}`}>
                    {riskTitle}
                  </div>
                  <p className="text-sm sm:text-base text-secondary leading-relaxed">{riskDesc}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-default">
                  <RiskMeter level={riskLevel} />
                </div>
              </div>
            </Card>

            <Card className="md:col-span-3">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
                  <Shield size={18} />
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary block">Suggested Allocation</span>
                  <span className="text-xs text-secondary">Tailored for your risk profile</span>
                </div>
              </div>

              <AllocationChart data={allocation} />

              <div className="mt-5 pt-4 border-t border-default">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-brand-orange/5 border border-brand-orange/10">
                  <Info size={16} className="text-brand-orange shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                    This allocation is designed to balance growth and risk according to your{' '}
                    <span className="font-semibold text-primary">{riskTitle.toLowerCase()}</span>{' '}
                    profile. Higher equity allocation has historically delivered better long-term returns with higher short-term volatility.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {summaryCards.map((s) => (
              <Card key={s.title} className="!p-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.bgClass}`}>
                  <span className={s.toneClass}>{s.icon}</span>
                </div>
                <div className="text-lg font-semibold text-primary mb-0.5">{s.value}</div>
                <div className="text-xs sm:text-sm font-medium text-secondary mb-1">{s.title}</div>
                <div className="text-[11px] sm:text-xs text-secondary opacity-80">{s.desc}</div>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setScreen('risk-assessment')}>
              <ArrowLeft size={16} /> Retake Questionnaire
            </Button>
            <Button onClick={() => setScreen('portfolio')} className="shadow-lg shadow-brand-orange/20">
              View Portfolio <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
