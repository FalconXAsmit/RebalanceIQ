interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  height?: 'sm' | 'md' | 'lg'
  color?: string
}

export const ProgressBar = ({
  value,
  max = 100,
  label,
  height = 'md',
  color,
}: ProgressBarProps) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const heightCls = height === 'sm' ? 'h-1.5' : height === 'lg' ? 'h-3' : 'h-2'

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs sm:text-sm font-medium text-secondary">{label}</span>
          <span className="text-xs sm:text-sm font-semibold text-primary">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full bg-navy-100 dark:bg-navy-700 rounded-full overflow-hidden ${heightCls}`}>
        <div
          className={`${heightCls} rounded-full transition-all duration-700 ease-out ${
            color || 'bg-brand-orange'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
