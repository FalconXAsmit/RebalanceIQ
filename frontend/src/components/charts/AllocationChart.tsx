import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { AllocationItem } from '@/data/mockData'

interface AllocationChartProps {
  data: AllocationItem[]
  size?: number
  showLegend?: boolean
}

export const AllocationChart = ({ data, size = 220, showLegend = true }: AllocationChartProps) => {
  const total = data.reduce((s, d) => s + d.percentage, 0)

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={size * 0.38}
              outerRadius={size * 0.48}
              paddingAngle={3}
              dataKey="percentage"
              animationDuration={800}
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={data[idx].color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: any) => [`${val}%`, 'Allocation']}
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                color: 'var(--text-primary)',
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-secondary">Total</span>
          <span className="text-xl sm:text-2xl font-bold text-primary">{total}%</span>
        </div>
      </div>

      {showLegend && (
        <div className="flex flex-col gap-2 min-w-[180px]">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: item.color }}
                />
                <span className="text-sm font-medium text-primary">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-secondary">{item.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
