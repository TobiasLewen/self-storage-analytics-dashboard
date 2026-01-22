import { memo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { MonthlyMetrics } from '@/data/types'

interface YearOverYearChartProps {
  data: MonthlyMetrics[]
  height?: number
  /** Accessible label describing the chart for screen readers */
  ariaLabel?: string
  /** Detailed description of the chart content */
  ariaDescription?: string
}

// Common tooltip style used across all charts
const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
}

// Common axis tick style
const axisTickStyle = { fill: 'hsl(var(--muted-foreground))' }

// Process data for YoY comparison - group by month name (Jan, Feb, etc.) across years
function processYoYData(metrics: MonthlyMetrics[]) {
  // Group by month name (without year)
  const monthGroups: Record<string, { currentYear?: number; previousYear?: number; monthName: string }> = {}
  
  // Get current year and previous year
  const currentYear = new Date().getFullYear()
  const previousYear = currentYear - 1
  
  metrics.forEach(metric => {
    // Extract month name (e.g., "Jan 24" -> "Jan")
    const monthName = metric.month.split(' ')[0]
    
    if (!monthGroups[monthName]) {
      monthGroups[monthName] = { monthName, currentYear: undefined, previousYear: undefined }
    }
    
    // Check if this metric is from current year or previous year
    if (metric.year === currentYear) {
      monthGroups[monthName].currentYear = metric.revenue
    } else if (metric.year === previousYear) {
      monthGroups[monthName].previousYear = metric.revenue
    }
  })
  
  // Convert to array and sort by month order
  const monthOrder = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
  const result = monthOrder
    .map(month => monthGroups[month])
    .filter(Boolean)
    .map(item => ({
      month: item.monthName,
      currentYear: item.currentYear || 0,
      previousYear: item.previousYear || 0,
      difference: item.currentYear && item.previousYear 
        ? Math.round(((item.currentYear - item.previousYear) / item.previousYear) * 1000) / 10 
        : 0
    }))
  
  return result
}

export const YearOverYearChart = memo(function YearOverYearChart({
  data,
  height = 300,
  ariaLabel = 'Year-over-Year Revenue Comparison Chart',
  ariaDescription = 'This chart shows revenue comparison between current year and previous year, month by month.',
}: YearOverYearChartProps) {
  const chartData = processYoYData(data)
  
  // Calculate overall growth
  const currentYearTotal = chartData.reduce((sum, item) => sum + item.currentYear, 0)
  const previousYearTotal = chartData.reduce((sum, item) => sum + item.previousYear, 0)
  const overallGrowth = previousYearTotal > 0 
    ? Math.round(((currentYearTotal - previousYearTotal) / previousYearTotal) * 1000) / 10 
    : 0

  const yAxisFormatter = (value: number) => `${(value / 1000).toFixed(0)}k`
  
  const tooltipFormatter = (value: number, name: string) => {
    if (name === 'currentYear') {
      return [formatCurrency(value), 'Aktuelles Jahr'] as [string, string]
    } else if (name === 'previousYear') {
      return [formatCurrency(value), 'Vorjahr'] as [string, string]
    } else if (name === 'difference') {
      return [`${value > 0 ? '+' : ''}${value}%`, 'Veränderung'] as [string, string]
    }
    return [formatCurrency(value), name] as [string, string]
  }

  return (
    <div
      style={{ height }}
      role="img"
      aria-label={ariaLabel}
      aria-describedby={ariaDescription ? 'yoy-chart-desc' : undefined}
    >
      {ariaDescription && (
        <p id="yoy-chart-desc" className="sr-only">{ariaDescription}</p>
      )}
      
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Jahresvergleich Umsatz</h3>
          <div className={`text-sm font-medium ${overallGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {overallGrowth >= 0 ? '▲' : '▼'} {overallGrowth > 0 ? '+' : ''}{overallGrowth}% Gesamtwachstum
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Vergleich des aktuellen Jahres mit dem Vorjahr
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="month"
            className="text-xs"
            tick={axisTickStyle}
          />
          <YAxis
            className="text-xs"
            tick={axisTickStyle}
            tickFormatter={yAxisFormatter}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={tooltipFormatter as never}
            labelFormatter={(label) => `Monat: ${label}`}
          />
          <Legend 
            formatter={(value) => {
              if (value === 'currentYear') return 'Aktuelles Jahr'
              if (value === 'previousYear') return 'Vorjahr'
              return value
            }}
          />
          <ReferenceLine y={0} stroke="hsl(var(--muted))" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="previousYear"
            name="previousYear"
            stroke="hsl(var(--muted))"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: 'hsl(var(--muted))' }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="currentYear"
            name="currentYear"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))' }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})
