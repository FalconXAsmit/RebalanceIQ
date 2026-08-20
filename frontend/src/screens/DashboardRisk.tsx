import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RiskMeter } from '@/components/charts/RiskMeter'
import { AllocationChart } from '@/components/charts/AllocationChart'
import { useAppState } from '@/context/AppState'
import {
  ClipboardList,
  Target,
  Shield,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

export const DashboardRisk = () => {
  const { riskLevel, riskTitle, riskDesc, allocation, setScreen } = useAppState()

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <ClipboardList size={20} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">Risk Profile</h1>
              <p className="text-secondary text-sm sm:text-base">Your investor personality snapshot.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setScreen('risk-assessment')}>
            Retake Questionnaire
          </Button>
        </div>

        {!riskLevel ? (
          <Card className="text-center py-12">
            <AlertTriangle className="mx-auto mb-4 text-amber-500" size={36} />
            <h2 className="text-xl font-semibold text-primary mb-2">Complete your risk assessment</h2>
            <p className="text-secondary text-sm mb-5 max-w-md mx-auto">
              Answer a few quick questions to unlock your personalized portfolio recommendation.
            </p>
            <Button onClick={() => setScreen('risk-assessment')}>Start Now</Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <Target size={18} className="text-brand-orange" />
                <span className="font-semibold text-primary">Your Profile</span>
              </div>
              <div
                className={`text-3xl sm:text-4xl font-bold mb-2 ${
                  riskLevel === 'conservative'
                    ? 'text-sky-500'
                    : riskLevel === 'moderate'
                    ? 'text-brand-orange'
                    : 'text-danger'
                }`}
              >
                {riskTitle}
              </div>
              <p className="text-sm text-secondary mb-6 leading-relaxed">{riskDesc}</p>
              <div className="pt-5 border-t border-default">
                <RiskMeter level={riskLevel} />
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-5">
                <Shield size={18} className="text-sky-500" />
                <span className="font-semibold text-primary">Suggested Allocation</span>
              </div>
              <AllocationChart data={allocation} size={200} />
            </Card>
          </div>
        )}

        {riskLevel && (
          <>
            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              {[
                { icon: <TrendingUp size={16} />, title: 'Growth', v: riskLevel === 'conservative' ? 'Low–Moderate' : riskLevel === 'moderate' ? 'Moderate–High' : 'High' },
                { icon: <Shield size={16} />, title: 'Volatility', v: riskLevel === 'conservative' ? 'Low' : riskLevel === 'moderate' ? 'Moderate' : 'High' },
                { icon: <Target size={16} />, title: 'Time Horizon', v: riskLevel === 'conservative' ? '3+ years' : riskLevel === 'moderate' ? '5+ years' : '10+ years' },
              ].map((s) => (
                <Card key={s.title} className="!p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                    {s.icon}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">{s.v}</div>
                    <div className="text-xs text-secondary">{s.title}</div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setScreen('dashboard-portfolio')}>
                Go to Portfolio <ArrowRight size={16} />
              </Button>
            </div>
          </>
        )}

        {!riskLevel && null}
        <div className="sr-only"><CheckCircle2 /></div>
      </div>
    </DashboardLayout>
  )
}
