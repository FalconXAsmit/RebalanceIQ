import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-brand-orange hover:bg-brand-orange-dark text-white shadow-sm hover:shadow-md',
  secondary:
    'bg-navy-900 dark:bg-navy-100 text-white dark:text-navy-900 hover:bg-navy-800 dark:hover:bg-navy-200 shadow-sm',
  ghost:
    'bg-transparent hover:bg-navy-100 dark:hover:bg-navy-700 text-primary',
  outline:
    'border border-default bg-card hover:bg-navy-50 dark:hover:bg-navy-700 text-primary border-default',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:ring-offset-2 focus:ring-offset-transparent
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
        ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
