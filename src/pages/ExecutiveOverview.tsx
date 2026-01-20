import { useCallback, useMemo } from 'react'
import { KPICard } from '@/components/cards/KPICard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MemoizedLineChart, MemoizedBarChart } from '@/components/charts/MemoizedCharts'
import { SkeletonCard, SkeletonChart } from '@/components/ui/skeleton'
import { PageErrorState } from '@/components/ui/error-state'
import { useDataFetch } from '@/hooks/useDataFetch'
import {
  getDashboardSummary,
  getUnitSizeMetrics,
  monthlyMetrics,
} from '@/data/mockData'
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

export function ExecutiveOverview() {
  const fetchData = useCallback(() => ({
    summary: getDashboardSummary(),
    unitSizeData: getUnitSizeMetrics(),
    monthlyData: monthlyMetrics,
  }), [])

  const { data, isLoading, error, retry } = useDataFetch(fetchData)

  if (isLoading) {
    return <ExecutiveOverviewSkeleton />
  }

  if (error || !data) {
    return (
      <PageErrorState
        title="Failed to load dashboard"
        message={error?.message || 'Unable to load dashboard data. Please try again.'}
        onRetry={retry}
      />
    )
  }

  const { summary, unitSizeData, monthlyData } = data

  // Memoize chart configurations to prevent unnecessary re-renders
  const revenueLineConfig = useMemo(() => [{
    dataKey: 'revenue',
    stroke: 'hsl(var(--primary))',
    dot: { fill: 'hsl(var(--primary))' },
  }], [])

  const unitSizeBarConfig = useMemo(() => [
    { dataKey: 'occupiedUnits', name: 'Belegt', fill: 'hsl(var(--primary))', stackId: 'a' },
    { dataKey: 'availableUnits', name: 'Verfügbar', fill: 'hsl(var(--muted))', stackId: 'a' },
  ], [])

  const occupancyLineConfig = useMemo(() => [{
    dataKey: 'occupancyRate',
    stroke: 'hsl(var(--primary))',
    dot: { fill: 'hsl(var(--primary))' },
  }], [])

  const revenueTooltipFormatter = useCallback(
    (value: number) => [formatCurrency(value), 'Umsatz'] as [string, string],
    []
  )

  const occupancyTooltipFormatter = useCallback(
    (value: number) => [`${value}%`, 'Belegung'] as [string, string],
    []
  )

  const revenueYAxisFormatter = useCallback(
    (value: number) => `${(value / 1000).toFixed(0)}k`,
    []
  )

  const occupancyYAxisFormatter = useCallback(
    (value: number) => `${value}%`,
    []
  )

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
              lines={revenueLineConfig}
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
              bars={unitSizeBarConfig}
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
            lines={occupancyLineConfig}
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
