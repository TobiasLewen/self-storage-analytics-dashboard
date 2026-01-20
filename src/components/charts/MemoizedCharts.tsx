import { memo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts'

// Common tooltip style used across all charts
const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
}

// Common axis tick style
const axisTickStyle = { fill: 'hsl(var(--muted-foreground))' }

// Generic data type for chart data - eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartData = any[]

// ============================================================================
// LINE CHART WRAPPER
// ============================================================================

interface LineConfig {
  dataKey: string
  name?: string
  stroke: string
  strokeWidth?: number
  strokeDasharray?: string
  dot?: { fill: string } | boolean
}

interface MemoizedLineChartProps {
  data: ChartData
  lines: LineConfig[]
  xAxisKey: string
  height?: number
  yAxisDomain?: [number, number]
  yAxisFormatter?: (value: number) => string
  tooltipFormatter?: (value: number, name: string) => [string, string]
  showLegend?: boolean
  legendFormatter?: (value: string) => string
  referenceLine?: { y: number; stroke: string; strokeDasharray?: string }
  /** Accessible label describing the chart for screen readers */
  ariaLabel?: string
  /** Detailed description of the chart content */
  ariaDescription?: string
}

export const MemoizedLineChart = memo(function MemoizedLineChart({
  data,
  lines,
  xAxisKey,
  height = 300,
  yAxisDomain,
  yAxisFormatter,
  tooltipFormatter,
  showLegend = false,
  legendFormatter,
  referenceLine,
  ariaLabel,
  ariaDescription,
}: MemoizedLineChartProps) {
  return (
    <div
      style={{ height }}
      role="img"
      aria-label={ariaLabel}
      aria-describedby={ariaDescription ? 'chart-desc' : undefined}
    >
      {ariaDescription && (
        <p id="chart-desc" className="sr-only">{ariaDescription}</p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey={xAxisKey}
            className="text-xs"
            tick={axisTickStyle}
          />
          <YAxis
            className="text-xs"
            tick={axisTickStyle}
            domain={yAxisDomain}
            tickFormatter={yAxisFormatter}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={tooltipFormatter as never}
          />
          {showLegend && <Legend formatter={legendFormatter} />}
          {referenceLine && (
            <ReferenceLine
              y={referenceLine.y}
              stroke={referenceLine.stroke}
              strokeDasharray={referenceLine.strokeDasharray}
            />
          )}
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth ?? 2}
              strokeDasharray={line.strokeDasharray}
              dot={line.dot ?? { fill: line.stroke }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})

// ============================================================================
// BAR CHART WRAPPER
// ============================================================================

interface BarConfig {
  dataKey: string
  name?: string
  fill: string
  stackId?: string
  radius?: [number, number, number, number]
}

interface MemoizedBarChartProps {
  data: ChartData
  bars: BarConfig[]
  xAxisKey: string
  height?: number
  layout?: 'horizontal' | 'vertical'
  yAxisDomain?: [number, number]
  yAxisFormatter?: (value: number) => string
  yAxisWidth?: number
  tooltipFormatter?: (value: number, name: string) => [string, string]
  showLegend?: boolean
  cellColors?: string[]
  /** Accessible label describing the chart for screen readers */
  ariaLabel?: string
  /** Detailed description of the chart content */
  ariaDescription?: string
}

export const MemoizedBarChart = memo(function MemoizedBarChart({
  data,
  bars,
  xAxisKey,
  height = 300,
  layout = 'horizontal',
  yAxisDomain,
  yAxisFormatter,
  yAxisWidth,
  tooltipFormatter,
  showLegend = false,
  cellColors,
  ariaLabel,
  ariaDescription,
}: MemoizedBarChartProps) {
  return (
    <div
      style={{ height }}
      role="img"
      aria-label={ariaLabel}
      aria-describedby={ariaDescription ? 'bar-chart-desc' : undefined}
    >
      {ariaDescription && (
        <p id="bar-chart-desc" className="sr-only">{ariaDescription}</p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={layout}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          {layout === 'vertical' ? (
            <>
              <XAxis type="number" className="text-xs" tick={axisTickStyle} />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                className="text-xs"
                tick={axisTickStyle}
                width={yAxisWidth}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={xAxisKey} className="text-xs" tick={axisTickStyle} />
              <YAxis
                className="text-xs"
                tick={axisTickStyle}
                domain={yAxisDomain}
                tickFormatter={yAxisFormatter}
              />
            </>
          )}
          <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter as never} />
          {showLegend && <Legend />}
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.fill}
              stackId={bar.stackId}
              radius={bar.radius}
            >
              {cellColors &&
                data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={cellColors[index % cellColors.length]} />
                ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
})

// ============================================================================
// AREA CHART WRAPPER
// ============================================================================

interface AreaConfig {
  dataKey: string
  name?: string
  stroke: string | 'none'
  fill: string
  fillOpacity?: number
  strokeWidth?: number
  strokeDasharray?: string
  dot?: { fill: string } | boolean
  type?: 'monotone' | 'linear'
}

interface MemoizedAreaChartProps {
  data: ChartData
  areas: AreaConfig[]
  lines?: LineConfig[]
  xAxisKey: string
  height?: number
  yAxisFormatter?: (value: number) => string
  tooltipFormatter?: (value: number, name: string) => [string, string]
  showLegend?: boolean
  legendFormatter?: (value: string) => string
  referenceLine?: {
    x?: string
    stroke: string
    strokeDasharray?: string
    label?: { value: string; position: string; fill: string }
  }
  /** Accessible label describing the chart for screen readers */
  ariaLabel?: string
  /** Detailed description of the chart content */
  ariaDescription?: string
}

export const MemoizedAreaChart = memo(function MemoizedAreaChart({
  data,
  areas,
  lines,
  xAxisKey,
  height = 350,
  yAxisFormatter,
  tooltipFormatter,
  showLegend = false,
  legendFormatter,
  referenceLine,
  ariaLabel,
  ariaDescription,
}: MemoizedAreaChartProps) {
  return (
    <div
      style={{ height }}
      role="img"
      aria-label={ariaLabel}
      aria-describedby={ariaDescription ? 'area-chart-desc' : undefined}
    >
      {ariaDescription && (
        <p id="area-chart-desc" className="sr-only">{ariaDescription}</p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey={xAxisKey} className="text-xs" tick={axisTickStyle} />
          <YAxis className="text-xs" tick={axisTickStyle} tickFormatter={yAxisFormatter} />
          <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter as never} />
          {showLegend && <Legend formatter={legendFormatter} />}
          {referenceLine && (
            <ReferenceLine
              x={referenceLine.x}
              stroke={referenceLine.stroke}
              strokeDasharray={referenceLine.strokeDasharray}
              label={referenceLine.label as never}
            />
          )}
          {areas.map((area) => (
            <Area
              key={area.dataKey}
              type={area.type ?? 'monotone'}
              dataKey={area.dataKey}
              name={area.name}
              stroke={area.stroke}
              fill={area.fill}
              fillOpacity={area.fillOpacity ?? 1}
              strokeWidth={area.strokeWidth}
              strokeDasharray={area.strokeDasharray}
            />
          ))}
          {lines?.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth ?? 2}
              strokeDasharray={line.strokeDasharray}
              dot={line.dot ?? { fill: line.stroke }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
})

// ============================================================================
// PIE CHART WRAPPER
// ============================================================================

interface MemoizedPieChartProps {
  data: ChartData
  dataKey: string
  nameKey: string
  height?: number
  innerRadius?: number
  outerRadius?: number
  paddingAngle?: number
  colors: string[]
  labelFormatter?: (entry: { name: string; percent?: number }) => string
  tooltipFormatter?: (value: number) => [string, string]
  /** Accessible label describing the chart for screen readers */
  ariaLabel?: string
  /** Detailed description of the chart content */
  ariaDescription?: string
}

export const MemoizedPieChart = memo(function MemoizedPieChart({
  data,
  dataKey,
  nameKey,
  height = 300,
  innerRadius = 60,
  outerRadius = 100,
  paddingAngle = 5,
  colors,
  labelFormatter,
  tooltipFormatter,
  ariaLabel,
  ariaDescription,
}: MemoizedPieChartProps) {
  return (
    <div
      style={{ height }}
      role="img"
      aria-label={ariaLabel}
      aria-describedby={ariaDescription ? 'pie-chart-desc' : undefined}
    >
      {ariaDescription && (
        <p id="pie-chart-desc" className="sr-only">{ariaDescription}</p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            dataKey={dataKey}
            nameKey={nameKey}
            label={labelFormatter as never}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter as never} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
})
