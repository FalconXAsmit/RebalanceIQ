import {
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { useTheme } from '@/context/ThemeContext'
import { useId } from 'react'

interface MarketChartProps {
  data: { time: string; price: number }[]
  color: string
  height?: number
}

export const MarketChart = ({ data, color, height = 120 }: MarketChartProps) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const id = useId()
  
  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'
  const tooltipText = isDark ? '#f1f5f9' : '#0f172a'

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad_${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              background: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 8,
              color: tooltipText,
              fontSize: 12,
              padding: '6px 10px',
              boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.08)',
            }}
            itemStyle={{ color, fontWeight: 600 }}
            labelStyle={{ display: 'none' }}
            formatter={(value: any) => [`${Number(value).toLocaleString()}`, 'Price']}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#grad_${id})`}
            isAnimationActive={true}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
