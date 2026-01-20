import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MemoizedAreaChart, MemoizedLineChart } from '@/components/charts/MemoizedCharts'
import { AlertCard } from '@/components/cards/AlertCard'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard, SkeletonChart, Skeleton } from '@/components/ui/skeleton'
import { PageErrorState } from '@/components/ui/error-state'
import { useForecast } from '@/hooks/useForecast'
import { usePricingAlerts } from '@/hooks/useForecast'
import { useUnitMetrics } from '@/hooks/useUnits'
import { useMonthlyMetrics } from '@/hooks/useMetrics'
import { formatCurrency } from '@/lib/utils'
import {
  addSeasonalIndex,
  generatePricingRecommendations,
  calculateTotalForecast,
  findForecastStartMonth,
} from '@/services/analyticsService'
import {
  CHART_COLORS,
  CHART_DIMENSIONS,
  Y_AXIS_DOMAINS,
  LABELS,
} from '@/constants'
import { TrendingUp, Calendar, AlertCircle, Lightbulb } from 'lucide-react'

// Chart configurations - defined outside component to avoid recreating on each render
const FORECAST_AREA_CONFIG = [
  { dataKey: 'upperBound', stroke: 'none' as const, fill: 'hsl(var(--primary))', fillOpacity: 0.1 },
  { dataKey: 'lowerBound', stroke: 'none' as const, fill: 'hsl(var(--background))', fillOpacity: 1 },
]

const FORECAST_LINE_CONFIG = [
  { dataKey: 'actual', stroke: 'hsl(var(--primary))', dot: { fill: 'hsl(var(--primary))' } },
  { dataKey: 'forecast', stroke: CHART_COLORS.success, strokeDasharray: '5 5', dot: { fill: CHART_COLORS.success } },
]

const SEASONAL_LINE_CONFIG = [{
  dataKey: 'seasonalIndex',
  name: LABELS.chart.seasonalIndex,
  stroke: CHART_COLORS.purple,
  dot: { fill: CHART_COLORS.purple },
}]

const SEASONAL_REFERENCE_LINE = {
  y: 1,
  stroke: 'hsl(var(--muted-foreground))',
  strokeDasharray: '3 3',
}

/** Mapping for forecast chart legend labels */
const FORECAST_LABELS: Record<string, string> = {
  actual: LABELS.chart.actual,
  forecast: LABELS.chart.forecast,
  upperBound: LABELS.chart.upperBound,
  lowerBound: LABELS.chart.lowerBound,
}

const forecastYAxisFormatter = (value: number) => `${(value / 1000).toFixed(0)}k`

const forecastTooltipFormatter = (value: number, name: string) =>
  [formatCurrency(value), FORECAST_LABELS[name] || name] as [string, string]

const forecastLegendFormatter = (value: string) => FORECAST_LABELS[value] || value

const seasonalYAxisFormatter = (value: number) => `${(value * 100).toFixed(0)}%`

const seasonalTooltipFormatter = (value: number) =>
  [`${(value * 100).toFixed(1)}%`, LABELS.chart.seasonalIndex] as [string, string]

function ForecastSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonChart height={CHART_DIMENSIONS.large} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card">
          <div className="p-6 pb-2">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="p-6 pt-2 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
        <SkeletonChart height={CHART_DIMENSIONS.compact} />
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function Forecast() {
  const { forecast: forecastData, isLoading: forecastLoading, error: forecastError, refetch: refetchForecast } = useForecast()
  const { alerts: pricingAlerts, isLoading: alertsLoading, error: alertsError, refetch: refetchAlerts } = usePricingAlerts()
  const { metrics: unitSizeData, isLoading: unitsLoading, error: unitsError, refetch: refetchUnits } = useUnitMetrics()
  const { metrics: monthlyData, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useMonthlyMetrics()

  const isLoading = forecastLoading || alertsLoading || unitsLoading || metricsLoading
  const error = forecastError || alertsError || unitsError || metricsError

  const retry = () => {
    refetchForecast()
    refetchAlerts()
    refetchUnits()
    refetchMetrics()
  }

  if (isLoading) {
    return <ForecastSkeleton />
  }

  if (error) {
    const errorMessages = []
    if (forecastError) errorMessages.push(`Forecast: ${forecastError.message}`)
    if (alertsError) errorMessages.push(`Alerts: ${alertsError.message}`)
    if (unitsError) errorMessages.push(`Units: ${unitsError.message}`)
    if (metricsError) errorMessages.push(`Metrics: ${metricsError.message}`)

    console.error('Forecast page error:', errorMessages.join(', '))

    return (
      <PageErrorState
        title="Failed to load forecast"
        message={errorMessages.join(' | ') || 'Unable to load forecast data. Please try again.'}
        onRetry={retry}
      />
    )
  }

  const hasForecastData = forecastData && forecastData.length > 0
  const hasPricingAlerts = pricingAlerts && pricingAlerts.length >= 0
  const hasUnitSizeData = unitSizeData && unitSizeData.length > 0
  const hasMonthlyData = monthlyData && monthlyData.length > 0

  if (!hasForecastData || !hasPricingAlerts || !hasUnitSizeData || !hasMonthlyData) {
    const missingData = []
    if (!hasForecastData) missingData.push('Forecast data')
    if (!hasPricingAlerts) missingData.push('Pricing alerts')
    if (!hasUnitSizeData) missingData.push('Unit size data')
    if (!hasMonthlyData) missingData.push('Monthly metrics')

    console.error('Forecast page missing data:', missingData.join(', '))

    return (
      <PageErrorState
        title="Failed to load forecast"
        message={`Missing required data: ${missingData.join(', ')}. Please try again.`}
        onRetry={retry}
      />
    )
  }

  // Use service layer for business logic
  const seasonalData = addSeasonalIndex(monthlyData)
  const pricingRecommendations = generatePricingRecommendations(unitSizeData)
  const totalForecast = calculateTotalForecast(forecastData)
  const forecastStartMonth = findForecastStartMonth(forecastData)

  // Reference line depends on data, so computed inline
  const forecastReferenceLine = {
    x: forecastStartMonth,
    stroke: 'hsl(var(--muted-foreground))',
    strokeDasharray: '5 5',
    label: { value: 'Prognose Start', position: 'top', fill: 'hsl(var(--muted-foreground))' },
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">3-Monats Prognose</p>
                <p className="text-2xl font-bold">{formatCurrency(totalForecast)}</p>
                <p className="text-sm text-green-600">+6% vs. Vorjahr</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preisanpassungen</p>
                <p className="text-2xl font-bold">{pricingAlerts.length}</p>
                <p className="text-sm text-muted-foreground">empfohlen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saisonaler Trend</p>
                <p className="text-2xl font-bold">Stabil</p>
                <p className="text-sm text-muted-foreground">nächste 3 Monate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>3-Monats Umsatzprognose</CardTitle>
        </CardHeader>
        <CardContent>
          <MemoizedAreaChart
            data={forecastData}
            areas={FORECAST_AREA_CONFIG}
            lines={FORECAST_LINE_CONFIG}
            xAxisKey="month"
            height={CHART_DIMENSIONS.large}
            yAxisFormatter={forecastYAxisFormatter}
            tooltipFormatter={forecastTooltipFormatter}
            showLegend
            legendFormatter={forecastLegendFormatter}
            referenceLine={forecastReferenceLine}
            ariaLabel="Area chart showing 3-month revenue forecast with confidence intervals"
          />
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pricing Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Preisempfehlungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pricingRecommendations.map((rec) => (
                <div
                  key={rec.size}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{rec.size}</Badge>
                    <span className="text-sm">{rec.recommendation}</span>
                  </div>
                  <Badge
                    variant={
                      rec.type === 'increase'
                        ? 'success'
                        : rec.type === 'decrease'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {rec.occupancy.toFixed(0)}% belegt
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Seasonal Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Saisonale Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <MemoizedLineChart
              data={seasonalData}
              lines={SEASONAL_LINE_CONFIG}
              xAxisKey="month"
              height={CHART_DIMENSIONS.compact}
              yAxisDomain={Y_AXIS_DOMAINS.seasonalIndex}
              yAxisFormatter={seasonalYAxisFormatter}
              tooltipFormatter={seasonalTooltipFormatter}
              referenceLine={SEASONAL_REFERENCE_LINE}
              ariaLabel="Line chart showing seasonal trends over 12 months"
            />
          </CardContent>
        </Card>
      </div>

      {/* Pricing Alerts */}
      <AlertCard alerts={pricingAlerts} />
    </div>
  )
}
