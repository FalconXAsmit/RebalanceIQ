import { useState } from 'react'
import { Sidebar } from '@/components/navigation/Sidebar'
import { Menu } from 'lucide-react'
import type { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-30 h-16 flex items-center lg:hidden px-4 border-b border-default bg-[var(--bg)]/90 backdrop-blur-md shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-700 text-primary"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 text-center font-semibold text-primary">RebalanceIQ</div>
          <div className="w-9" />
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
