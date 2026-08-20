import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { Navbar } from '@/components/navigation/Navbar'
import { useAppState } from '@/context/AppState'
import { mockRiskQuestions, type RiskAnswers } from '@/data/mockData'

export const RiskAssessmentScreen = () => {
  const { setScreen, setRiskAnswers } = useAppState()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<RiskAnswers>({
    horizon: '',
    reaction: '',
    goal: '',
    comfort: 3,
  })

  const q = mockRiskQuestions[step - 1]
  const total = mockRiskQuestions.length

  const canContinue =
    step === 1
      ? !!answers.horizon
      : step === 2
      ? !!answers.reaction
      : step === 3
      ? !!answers.goal
      : true

  const handleContinue = () => {
    if (step < total) {
      setStep(step + 1)
    } else {
      setRiskAnswers(answers)
      setScreen('risk-result')
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
    else setScreen('landing')
  }

  const setAnswer = <K extends keyof RiskAnswers>(key: K, val: RiskAnswers[K]) => {
    setAnswers((a) => ({ ...a, [key]: val }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="landing" />

      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-semibold mb-4">
              Step 1 · Build your investor profile
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight mb-2">
              A few questions to get started
            </h1>
            <p className="text-secondary text-sm sm:text-base">
              These help us suggest a portfolio that matches you.
            </p>
          </div>

          <Card className="mb-6">
            <StepIndicator current={step} total={total} />
          </Card>

          <Card className="mb-6">
            <div className="mb-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-primary mb-1.5">
                {q.title}
              </h2>
              {q.subtitle && (
                <p className="text-secondary text-sm sm:text-base">{q.subtitle}</p>
              )}
            </div>

            {!q.scale && q.options && (
              <div className="grid gap-3 sm:gap-3.5">
                {q.options.map((opt) => {
                  const key = q.id as keyof RiskAnswers
                  const selected = answers[key] === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setAnswer(key, opt.value as never)}
                      className={`
                        w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 group
                        ${selected
                          ? 'border-brand-orange bg-brand-orange/5 shadow-sm'
                          : 'border-default hover:border-navy-300 dark:hover:border-navy-500 hover:bg-navy-50 dark:hover:bg-navy-800/40'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div
                            className={`font-semibold text-sm sm:text-base mb-1 ${
                              selected ? 'text-brand-orange' : 'text-primary'
                            }`}
                          >
                            {opt.label}
                          </div>
                          <div className="text-xs sm:text-sm text-secondary">{opt.desc}</div>
                        </div>
                        <div
                          className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5
                            transition-all duration-200
                            ${selected
                              ? 'border-brand-orange bg-brand-orange'
                              : 'border-navy-300 dark:border-navy-500 group-hover:border-brand-orange/50'
                            }
                          `}
                        >
                          {selected && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {q.scale && (
              <div className="space-y-8">
                <div className="flex items-center justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const selected = answers.comfort === n
                    return (
                      <button
                        key={n}
                        onClick={() => setAnswer('comfort', n)}
                        className={`
                          flex-1 aspect-square rounded-2xl flex flex-col items-center justify-center gap-1
                          border-2 transition-all duration-200
                          ${selected
                            ? 'border-brand-orange bg-brand-orange text-white shadow-md shadow-brand-orange/20 scale-105'
                            : 'border-default hover:border-brand-orange/50 bg-card hover:bg-navy-50 dark:hover:bg-navy-800/30 text-secondary hover:text-primary'
                          }
                        `}
                      >
                        <span className="text-xl sm:text-2xl font-bold">{n}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-secondary">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    Very uneasy
                  </span>
                  <span className="flex items-center gap-1.5">
                    Neutral
                    <span className="w-2 h-2 rounded-full bg-brand-orange" />
                  </span>
                  <span className="flex items-center gap-1.5">
                    Completely comfortable
                    <span className="w-2 h-2 rounded-full bg-danger" />
                  </span>
                </div>
              </div>
            )}
          </Card>

          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft size={16} />
              Back
            </Button>
            <Button onClick={handleContinue} disabled={!canContinue}>
              {step === total ? 'See My Profile' : 'Continue'}
              {step === total ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
