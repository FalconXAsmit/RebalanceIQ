import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  padded?: boolean
}

export const Card = ({
  children,
  hover = false,
  padded = true,
  className = '',
  ...props
}: CardProps) => {
  return (
    <div
      className={`
        bg-card border border-default rounded-2xl
        ${padded ? 'p-5 sm:p-6' : ''}
        ${hover ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
