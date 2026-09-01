import type { SelectHTMLAttributes, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  fullWidth?: boolean
  children: ReactNode
}

export const Select = ({
  label,
  error,
  fullWidth,
  className = '',
  id,
  children,
  ...props
}: SelectProps) => {
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`
            w-full px-4 py-2.5 rounded-xl border bg-card text-primary text-sm appearance-none
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-default hover:border-navy-300 dark:hover:border-navy-600'}
          `}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-secondary">
          <ChevronDown size={16} />
        </div>
      </div>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  )
}
