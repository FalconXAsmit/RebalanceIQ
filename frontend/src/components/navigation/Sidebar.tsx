import { useAppState } from '@/context/AppState'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
  LayoutDashboard,
  ClipboardList,
  Layers,
  TrendingUp,
  Sparkles,
  Settings,
  X,
  BarChart2,
} from 'lucide-react'
import type { ReactNode } from 'react'

type Screen =
  | 'dashboard'
  | 'dashboard-risk'
  | 'dashboard-portfolio'
  | 'dashboard-backtest'
  | 'dashboard-results'

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

interface NavItem {
  id: Screen
  label: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'dashboard-risk', label: 'Risk Profile', icon: <ClipboardList size={18} /> },
  { id: 'dashboard-portfolio', label: 'Portfolio', icon: <Layers size={18} /> },
  { id: 'dashboard-backtest', label: 'Backtest', icon: <TrendingUp size={18} /> },
  { id: 'dashboard-results', label: 'Results', icon: <Sparkles size={18} /> },
]

export const Sidebar = ({ mobileOpen, onMobileClose }: SidebarProps) => {
  const { screen, setScreen } = useAppState()

  const handleNav = (id: Screen) => {
    setScreen(id)
    onMobileClose()
  }

  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="h-16 flex items-center justify-between px-4 border-b border-default shrink-0">
        <button
          onClick={() => setScreen('dashboard')}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-dark flex items-center justify-center shadow-sm">
            <BarChart2 size={18} className="text-white" />
          </div>
          <span className="text-base font-bold text-primary tracking-tight">RebalanceIQ</span>
        </button>
        <button
          onClick={onMobileClose}
          className="lg:hidden p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-700 text-secondary"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-secondary">
          Journey
        </div>
        {navItems.map((item) => {
          const isActive = screen === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'text-secondary hover:bg-navy-50 dark:hover:bg-navy-700 hover:text-primary'
                }
              `}
            >
              <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
              )}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-default p-3 space-y-1 shrink-0">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-navy-50 dark:bg-navy-800/50">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-secondary" />
            <span className="text-sm font-medium text-secondary">Theme</span>
          </div>
          <ThemeToggle size="sm" />
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col w-64 h-screen shrink-0 border-r border-default bg-card sticky top-0">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-card border-r border-default shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
