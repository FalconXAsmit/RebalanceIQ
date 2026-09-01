import { Check } from 'lucide-react'

interface StepIndicatorProps {
  current: number
  total: number
  labels?: string[]
}

export const StepIndicator = ({ current, total, labels }: StepIndicatorProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-secondary">
          Step {current} of {total}
        </span>
      </div>
      <div className="w-full h-1.5 bg-navy-100 dark:bg-navy-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-orange rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      {labels && (
        <div className="grid mt-4" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
          {labels.map((label, i) => {
            const step = i + 1
            const isDone = step < current
            const isActive = step === current
            return (
              <div key={i} className="flex flex-col items-center text-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                    transition-all duration-300 mb-1.5
                    ${isDone
                      ? 'bg-brand-orange text-white'
                      : isActive
                      ? 'bg-brand-orange text-white ring-4 ring-brand-orange/20'
                      : 'bg-navy-100 dark:bg-navy-700 text-secondary'
                    }
                  `}
                >
                  {isDone ? <Check size={14} /> : step}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-medium ${
                    isActive ? 'text-primary' : 'text-secondary'
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
