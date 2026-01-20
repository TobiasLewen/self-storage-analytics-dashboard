import { useMemo } from 'react'
import { KPICard } from '@/components/cards/KPICard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MemoizedLineChart, MemoizedBarChart } from '@/components/charts/MemoizedCharts'
import { SkeletonCard, SkeletonChart } from '@/components/ui/skeleton'
import { PageErrorState } from '@/components/ui/error-state'
import { useDashboardSummary } from '@/hooks/useDashboard'
import { useUnitMetrics } from '@/hooks/useUnits'
import { useMonthlyMetrics } from '@/hooks/useMetrics'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Percent, Euro, Box, Clock } from 'lucide-react'

function ExecutiveOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonChart height={300} />
        <SkeletonChart height={300} />
      </div>
      <SkeletonChart height={250} />
    </div>
  )
}

// Chart configurations - defined outside component to avoid recreating on each render
const REVENUE_LINE_CONFIG = [{
  dataKey: 'revenue',
  stroke: 'hsl(var(--primary))',
  dot: { fill: 'hsl(var(--primary))' },
}]

const UNIT_SIZE_BAR_CONFIG = [
  { dataKey: 'occupiedUnits', name: 'Belegt', fill: 'hsl(var(--primary))', stackId: 'a' },
  { dataKey: 'availableUnits', name: 'Verfügbar', fill: 'hsl(var(--muted))', stackId: 'a' },
]

const OCCUPANCY_LINE_CONFIG = [{
  dataKey: 'occupancyRate',
  stroke: 'hsl(var(--primary))',
  dot: { fill: 'hsl(var(--primary))' },
}]

const revenueTooltipFormatter = (value: number) => [formatCurrency(value), 'Umsatz'] as [string, string]
const occupancyTooltipFormatter = (value: number) => [`${value}%`, 'Belegung'] as [string, string]
const revenueYAxisFormatter = (value: number) => `${(value / 1000).toFixed(0)}k`
const occupancyYAxisFormatter = (value: number) => `${value}%`

export function ExecutiveOverview() {
  const { summary, isLoading: summaryLoading, error: summaryError, refetch: refetchSummary } = useDashboardSummary()
  const { metrics: unitSizeData, isLoading: unitsLoading, error: unitsError, refetch: refetchUnits } = useUnitMetrics()
  const { metrics: monthlyData, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useMonthlyMetrics()

  const isLoading = summaryLoading || unitsLoading || metricsLoading
  const error = summaryError || unitsError || metricsError

  const retry = () => {
    refetchSummary()
    refetchUnits()
    refetchMetrics()
  }

  if (isLoading) {
    return <ExecutiveOverviewSkeleton />
  }

  if (error || !summary || !unitSizeData || !monthlyData) {
    return (
      <PageErrorState
        title="Failed to load dashboard"
        message={error?.message || 'Unable to load dashboard data. Please try again.'}
        onRetry={retry}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Belegungsrate"
          value={formatPercent(summary.totalOccupancyRate)}
          icon={Percent}
          iconColor="text-blue-500"
        />
        <KPICard
          title="Monatlicher Umsatz"
          value={formatCurrency(summary.monthlyRevenue)}
          change={summary.revenueChangePercent}
          changeLabel="vs. Vormonat"
          icon={Euro}
          iconColor="text-green-500"
        />
        <KPICard
          title="Verfügbare Einheiten"
          value={`${summary.availableUnits} / ${summary.totalUnits}`}
          icon={Box}
          iconColor="text-orange-500"
        />
        <KPICard
          title="Ø Mietdauer"
          value={`${summary.avgRentalDuration} Monate`}
          icon={Clock}
          iconColor="text-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Umsatzentwicklung (12 Monate)</CardTitle>
          </CardHeader>
          <CardContent>
            <MemoizedLineChart
              data={monthlyData}
              lines={REVENUE_LINE_CONFIG}
              xAxisKey="month"
              height={300}
              yAxisFormatter={revenueYAxisFormatter}
              tooltipFormatter={revenueTooltipFormatter}
            />
          </CardContent>
        </Card>

        {/* Units by Size */}
        <Card>
          <CardHeader>
            <CardTitle>Einheiten nach Größe</CardTitle>
          </CardHeader>
          <CardContent>
            <MemoizedBarChart
              data={unitSizeData}
              bars={UNIT_SIZE_BAR_CONFIG}
              xAxisKey="size"
              height={300}
              layout="vertical"
              yAxisWidth={50}
              showLegend
            />
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Belegungsrate (12 Monate)</CardTitle>
        </CardHeader>
        <CardContent>
          <MemoizedLineChart
            data={monthlyData}
            lines={OCCUPANCY_LINE_CONFIG}
            xAxisKey="month"
            height={250}
            yAxisDomain={[70, 100]}
            yAxisFormatter={occupancyYAxisFormatter}
            tooltipFormatter={occupancyTooltipFormatter}
          />
        </CardContent>
      </Card>
    </div>
  )
}
