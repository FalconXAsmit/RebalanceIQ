import { Info } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string
  subvalue?: string
  positive?: boolean | null
  icon?: ReactNode
  tooltip?: string
  className?: string
}

export const MetricCard = ({
  label,
  value,
  subvalue,
  positive,
  icon,
  tooltip,
  className = '',
}: MetricCardProps) => {
  const [showTip, setShowTip] = useState(false)

  const valueColor =
    positive === null
      ? 'text-primary'
      : positive
      ? 'text-success'
      : 'text-danger'

  return (
    <div className={`bg-card border border-default rounded-2xl p-4 sm:p-5 ${className}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-secondary">{icon}</span>}
          <span className="text-xs sm:text-sm text-secondary font-medium">{label}</span>
        </div>
        {tooltip && (
          <button
            className="relative text-secondary hover:text-primary transition-colors"
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            onFocus={() => setShowTip(true)}
            onBlur={() => setShowTip(false)}
            aria-label={`Info: ${label}`}
          >
            <Info size={14} />
            {showTip && (
              <div className="absolute right-0 top-full mt-1 w-56 p-2.5 text-xs bg-navy-900 dark:bg-navy-700 text-white rounded-lg shadow-lg z-30 text-left">
                {tooltip}
              </div>
            )}
          </button>
        )}
      </div>
      <div className={`text-2xl sm:text-3xl font-semibold tracking-tight ${valueColor}`}>
        {value}
      </div>
      {subvalue && (
        <div className="text-xs sm:text-sm text-secondary mt-1">{subvalue}</div>
      )}
    </div>
  )
}
