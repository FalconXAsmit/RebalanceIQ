import type { RiskLevel } from '@/data/mockData'

interface RiskMeterProps {
  level: RiskLevel
}

export const RiskMeter = ({ level }: RiskMeterProps) => {
  const stages = [
    { key: 'conservative', label: 'Conservative', color: '#0ea5e9' },
    { key: 'moderate', label: 'Moderate', color: '#f97316' },
    { key: 'aggressive', label: 'Aggressive', color: '#ef4444' },
  ]
  const activeIdx = stages.findIndex((s) => s.key === level)

  return (
    <div className="w-full">
      <div className="relative">
        <div className="h-3 rounded-full flex overflow-hidden gap-1">
          {stages.map((s, i) => (
            <div
              key={s.key}
              className="flex-1 rounded-full transition-opacity duration-500"
              style={{
                background: s.color,
                opacity: i <= activeIdx ? 1 : 0.2,
              }}
            />
          ))}
        </div>
        <div
          className="absolute -top-1 transition-all duration-500 ease-out"
          style={{
            left: `calc(${(activeIdx + 0.5) * (100 / 3)}% - 10px)`,
          }}
        >
          <div className="w-5 h-5 bg-white dark:bg-navy-800 border-2 rounded-full shadow-md flex items-center justify-center"
            style={{ borderColor: stages[activeIdx].color }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: stages[activeIdx].color }} />
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-3">
        {stages.map((s, i) => (
          <div key={s.key} className="flex flex-col items-center">
            <span
              className={`text-xs sm:text-sm font-semibold transition-colors ${
                i === activeIdx ? 'text-primary' : 'text-secondary'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
