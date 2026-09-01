import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

export const Input = ({
  label,
  error,
  fullWidth,
  className = '',
  id,
  ...props
}: InputProps) => {
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full px-4 py-2.5 rounded-xl border bg-card text-primary text-sm
          transition-colors duration-200
          placeholder:text-navy-400 dark:placeholder:text-navy-500
          focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-default hover:border-navy-300 dark:hover:border-navy-600'}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  )
}
