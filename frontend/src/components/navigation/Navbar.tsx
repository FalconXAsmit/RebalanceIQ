import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { Menu, X, BarChart2, Info } from 'lucide-react'
import { useState } from 'react'

interface NavbarProps {
  variant?: 'landing' | 'app'
}

export const Navbar = ({ variant = 'landing' }: NavbarProps) => {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--bg)]/80 border-b border-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <button
          onClick={() => variant === 'landing' ? navigate('/') : navigate('/dashboard')}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-dark flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <BarChart2 size={18} className="text-white" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-base sm:text-lg font-bold text-primary tracking-tight">RebalanceIQ</span>
            <span className="text-[10px] sm:text-xs text-secondary hidden sm:block">
              Smart portfolio backtesting
            </span>
          </div>
        </button>

        {variant === 'landing' && (
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => {
                const el = document.getElementById('features')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors rounded-lg hover:bg-navy-50 dark:hover:bg-navy-800"
            >
              Features
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('how')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors rounded-lg hover:bg-navy-50 dark:hover:bg-navy-800 flex items-center gap-1.5"
            >
              <Info size={14} /> How it works
            </button>
          </nav>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {variant === 'landing' && (
            <>
              <Button size="sm" onClick={() => navigate('/dashboard')} className="hidden sm:inline-flex">
                Get Started
              </Button>
              <button
                className="md:hidden p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-700"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          )}
        </div>
      </div>

      {variant === 'landing' && mobileOpen && (
        <div className="md:hidden border-t border-default px-4 py-3 space-y-1 bg-[var(--bg)]">
          <button
            onClick={() => {
              setMobileOpen(false)
              const el = document.getElementById('features')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="block w-full text-left px-3 py-2 text-sm font-medium text-primary rounded-lg hover:bg-navy-50 dark:hover:bg-navy-800"
          >
            Features
          </button>
          <button
            onClick={() => {
              setMobileOpen(false)
              const el = document.getElementById('how')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="block w-full text-left px-3 py-2 text-sm font-medium text-primary rounded-lg hover:bg-navy-50 dark:hover:bg-navy-800"
          >
            How it works
          </button>
          <Button fullWidth size="sm" onClick={() => { setMobileOpen(false); navigate('/dashboard') }}>
            Get Started
          </Button>
        </div>
      )}
    </header>
  )
}
