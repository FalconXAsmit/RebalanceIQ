import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from '@/context/ThemeContext'
import type { ChartPoint } from '@/data/mockData'

interface PerformanceChartProps {
  data: ChartPoint[]
  height?: number
}

const formatCurrency = (v: number) => `₹${v.toLocaleString('en-IN')}`

export const PerformanceChart = ({ data, height = 380 }: PerformanceChartProps) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const axisColor = isDark ? '#94a3b8' : '#64748b'
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'
  const tooltipText = isDark ? '#f1f5f9' : '#0f172a'

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="date"
            stroke={axisColor}
            tick={{ fontSize: 12, fill: axisColor }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            stroke={axisColor}
            tick={{ fontSize: 12, fill: axisColor }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            width={55}
          />
          <Tooltip
            contentStyle={{
              background: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 12,
              color: tooltipText,
              fontSize: 13,
              padding: '10px 14px',
              boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.08)',
            }}
            labelStyle={{ color: tooltipText, fontWeight: 600, marginBottom: 6 }}
            formatter={(value: any, name: any) => [
              formatCurrency(value),
              name === 'portfolio' ? 'RebalanceIQ Portfolio' : 'Benchmark',
            ]}
          />
          <Legend
            formatter={(val) =>
              val === 'portfolio' ? 'RebalanceIQ Portfolio' : 'Benchmark'
            }
            wrapperStyle={{ paddingTop: 16, fontSize: 13, color: tooltipText }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="portfolio"
            name="portfolio"
            stroke="#f97316"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2 }}
            animationDuration={1000}
          />
          <Line
            type="monotone"
            dataKey="benchmark"
            name="benchmark"
            stroke={isDark ? '#94a3b8' : '#64748b'}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
