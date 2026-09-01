import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

interface LoadingStateProps {
  stages: string[]
  currentStage: number
  title?: string
  subtitle?: string
  icon?: ReactNode
}

export const LoadingState = ({
  stages,
  currentStage,
  title = 'Running backtest',
  subtitle,
}: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] py-16 px-4">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-brand-orange/10 flex items-center justify-center">
          <Loader2 size={40} className="text-brand-orange animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-brand-orange/10 animate-ping opacity-40" />
      </div>
      <h3 className="text-xl sm:text-2xl font-semibold text-primary mb-2">{title}</h3>
      {subtitle && <p className="text-secondary text-sm sm:text-base mb-8">{subtitle}</p>}
      <div className="w-full max-w-sm space-y-3">
        {stages.map((s, i) => {
          const isActive = i === currentStage
          const isDone = i < currentStage
          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${
                isActive
                  ? 'border-brand-orange/40 bg-brand-orange/5'
                  : isDone
                  ? 'border-success/30 bg-success/5'
                  : 'border-default bg-card opacity-60'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isActive
                    ? 'bg-brand-orange text-white'
                    : isDone
                    ? 'bg-success text-white'
                    : 'bg-navy-100 dark:bg-navy-700 text-secondary'
                }`}
              >
                {isActive ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : isDone ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className="text-xs font-semibold">{i + 1}</span>
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isActive || isDone ? 'text-primary' : 'text-secondary'
                }`}
              >
                {s}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const SimpleLoader = ({ label }: { label?: string }) => (
  <div className="flex items-center justify-center gap-2 py-8 text-secondary">
    <Loader2 size={18} className="animate-spin text-brand-orange" />
    {label && <span className="text-sm">{label}</span>}
  </div>
)
