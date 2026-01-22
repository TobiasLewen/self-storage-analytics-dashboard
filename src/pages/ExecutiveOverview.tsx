import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { DateRange } from 'react-day-picker'
import { KPICard } from '@/components/cards/KPICard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MemoizedLineChart, MemoizedBarChart } from '@/components/charts/MemoizedCharts'
import { YearOverYearChart } from '@/components/charts/YearOverYearChart'
import { SkeletonCard, SkeletonChart } from '@/components/ui/skeleton'
import { PageErrorState } from '@/components/ui/error-state'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useDashboardSummary } from '@/hooks/useDashboard'
import { useUnitMetrics } from '@/hooks/useUnits'
import { useMonthlyMetrics } from '@/hooks/useMetrics'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Percent, Euro, Box, Clock } from 'lucide-react'

function ExecutiveOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <SkeletonCard />
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
  const { t } = useTranslation()
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - 6)
    return { from: start, to: end }
  })
  const [showYoYComparison, setShowYoYComparison] = useState(true)

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

  // Show loading state while any data is being fetched
  if (isLoading) {
    return <ExecutiveOverviewSkeleton />
  }

  // Check for errors and provide specific error messages
  if (error) {
    const errorMessages = []
    if (summaryError) errorMessages.push(`Summary: ${summaryError.message}`)
    if (unitsError) errorMessages.push(`Units: ${unitsError.message}`)
    if (metricsError) errorMessages.push(`Metrics: ${metricsError.message}`)
    
    console.error('Executive overview error:', errorMessages.join(', '))
    
    return (
      <PageErrorState
        title="Failed to load dashboard"
        message={errorMessages.join(' | ') || 'Unable to load dashboard data. Please try again.'}
        onRetry={retry}
      />
    )
  }

  // Validate that all required data is present and not empty
  const hasSummary = summary !== undefined
  const hasUnitSizeData = unitSizeData && unitSizeData.length > 0
  const hasMonthlyData = monthlyData && monthlyData.length > 0

  if (!hasSummary || !hasUnitSizeData || !hasMonthlyData) {
    const missingData = []
    if (!hasSummary) missingData.push('Dashboard summary')
    if (!hasUnitSizeData) missingData.push('Unit size data')
    if (!hasMonthlyData) missingData.push('Monthly metrics')
    
    console.error('Executive overview missing data:', missingData.join(', '))
    
    return (
      <PageErrorState
        title="Failed to load dashboard"
        message={`Missing required data: ${missingData.join(', ')}. Please try again.`}
        onRetry={retry}
      />
    )
  }

  // At this point, all data is guaranteed to be present
  const safeSummary = summary!
  const safeUnitSizeData = unitSizeData!
  const safeMonthlyData = monthlyData!

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('pages.executiveOverview.title')}</h2>
          <p className="text-muted-foreground">
            {t('pages.executiveOverview.description')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="yoy-toggle"
              checked={showYoYComparison}
              onCheckedChange={setShowYoYComparison}
            />
            <Label htmlFor="yoy-toggle" className="text-sm">
              {t('pages.executiveOverview.yearOverYearComparison')}
            </Label>
          </div>
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title={t('pages.executiveOverview.kpis.occupancyRate')}
          value={formatPercent(safeSummary.totalOccupancyRate)}
          icon={Percent}
          iconColor="text-blue-500"
        />
        <KPICard
          title={t('pages.executiveOverview.kpis.monthlyRevenue')}
          value={formatCurrency(safeSummary.monthlyRevenue)}
          change={safeSummary.revenueChangePercent}
          changeLabel={t('pages.executiveOverview.kpis.vsLastMonth')}
          icon={Euro}
          iconColor="text-green-500"
        />
        <KPICard
          title={t('pages.executiveOverview.kpis.revenueYoY')}
          value={formatCurrency(safeSummary.monthlyRevenue)}
          change={safeSummary.revenueChangeVsLastYear}
          changeLabel={t('pages.executiveOverview.kpis.vsLastYear')}
          icon={Euro}
          iconColor="text-indigo-500"
        />
        <KPICard
          title={t('pages.executiveOverview.kpis.availableUnits')}
          value={`${safeSummary.availableUnits} / ${safeSummary.totalUnits}`}
          icon={Box}
          iconColor="text-orange-500"
        />
        <KPICard
          title={t('pages.executiveOverview.kpis.avgRentalDuration')}
          value={`${safeSummary.avgRentalDuration} ${t('pages.executiveOverview.kpis.months')}`}
          icon={Clock}
          iconColor="text-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>{t('pages.executiveOverview.charts.revenueTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <MemoizedLineChart
              data={safeMonthlyData}
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
            <CardTitle>{t('pages.executiveOverview.charts.unitsBySize')}</CardTitle>
          </CardHeader>
          <CardContent>
            <MemoizedBarChart
              data={safeUnitSizeData}
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

      {/* Year-over-Year Comparison */}
      {showYoYComparison && (
        <Card>
          <CardHeader>
            <CardTitle>{t('pages.executiveOverview.charts.yearOverYearRevenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <YearOverYearChart
              data={safeMonthlyData}
              height={300}
            />
          </CardContent>
        </Card>
      )}

      {/* Occupancy Trend */}
      <Card>
        <CardHeader>
          <CardTitle>{t('pages.executiveOverview.charts.occupancyTrend')}</CardTitle>
        </CardHeader>
          <CardContent>
            <MemoizedLineChart
              data={safeMonthlyData}
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
