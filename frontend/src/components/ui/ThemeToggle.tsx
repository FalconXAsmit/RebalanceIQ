import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export const ThemeToggle = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const sizePx = size === 'sm' ? 16 : size === 'lg' ? 22 : 18

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative flex items-center justify-center rounded-xl
        transition-all duration-200
        bg-navy-100 dark:bg-navy-700 hover:bg-navy-200 dark:hover:bg-navy-600
        text-navy-700 dark:text-navy-200
        focus:outline-none focus:ring-2 focus:ring-brand-orange/40
        ${size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9'}
      `}
    >
      <span
        className="transition-all duration-300"
        style={{
          transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-30deg) scale(0.8)',
          opacity: isDark ? 1 : 0,
          position: isDark ? 'relative' : 'absolute',
        }}
      >
        <Moon size={sizePx} />
      </span>
      <span
        className="transition-all duration-300"
        style={{
          transform: isDark ? 'rotate(30deg) scale(0.8)' : 'rotate(0deg) scale(1)',
          opacity: isDark ? 0 : 1,
          position: isDark ? 'absolute' : 'relative',
        }}
      >
        <Sun size={sizePx} />
      </span>
    </button>
  )
}
