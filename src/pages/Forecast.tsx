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
import { TrendingUp, Calendar, AlertCircle, Lightbulb } from 'lucide-react'

// Chart configurations - defined outside component to avoid recreating on each render
const FORECAST_AREA_CONFIG = [
  { dataKey: 'upperBound', stroke: 'none' as const, fill: 'hsl(var(--primary))', fillOpacity: 0.1 },
  { dataKey: 'lowerBound', stroke: 'none' as const, fill: 'hsl(var(--background))', fillOpacity: 1 },
]

const FORECAST_LINE_CONFIG = [
  { dataKey: 'actual', stroke: 'hsl(var(--primary))', dot: { fill: 'hsl(var(--primary))' } },
  { dataKey: 'forecast', stroke: '#22c55e', strokeDasharray: '5 5', dot: { fill: '#22c55e' } },
]

const SEASONAL_LINE_CONFIG = [{
  dataKey: 'seasonalIndex',
  name: 'Saisonindex',
  stroke: '#8b5cf6',
  dot: { fill: '#8b5cf6' },
}]

const SEASONAL_REFERENCE_LINE = {
  y: 1,
  stroke: 'hsl(var(--muted-foreground))',
  strokeDasharray: '3 3',
}

const FORECAST_LABELS: Record<string, string> = {
  actual: 'Ist-Umsatz',
  forecast: 'Prognose',
  upperBound: 'Obere Grenze',
  lowerBound: 'Untere Grenze',
}

const forecastYAxisFormatter = (value: number) => `${(value / 1000).toFixed(0)}k`

const forecastTooltipFormatter = (value: number, name: string) =>
  [formatCurrency(value), FORECAST_LABELS[name] || name] as [string, string]

const forecastLegendFormatter = (value: string) => FORECAST_LABELS[value] || value

const seasonalYAxisFormatter = (value: number) => `${(value * 100).toFixed(0)}%`

const seasonalTooltipFormatter = (value: number) =>
  [`${(value * 100).toFixed(1)}%`, 'Saisonindex'] as [string, string]

function ForecastSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonChart height={350} />
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
        <SkeletonChart height={280} />
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

  // Show loading state while any data is being fetched
  if (isLoading) {
    return <ForecastSkeleton />
  }

  // Check for errors and provide specific error messages
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

  // Validate that all required data is present and not empty
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

  // Calculate seasonal trends (using monthly metrics)
  const seasonalData = monthlyData.map((m, index) => ({
    ...m,
    seasonalIndex: 1 + Math.sin((index - 2) * Math.PI / 6) * 0.1,
  }))

  // Pricing recommendations based on occupancy
  const pricingRecommendations = unitSizeData.map((size) => {
    let recommendation = ''
    let type: 'increase' | 'decrease' | 'maintain' = 'maintain'

    if (size.occupancyRate > 90) {
      recommendation = `Preiserhöhung um 5-10% möglich bei ${size.size} Einheiten`
      type = 'increase'
    } else if (size.occupancyRate < 70) {
      recommendation = `Preissenkung um 5% empfohlen für ${size.size} Einheiten`
      type = 'decrease'
    } else {
      recommendation = `Preise für ${size.size} Einheiten beibehalten`
      type = 'maintain'
    }

    return { size: size.size, occupancy: size.occupancyRate, recommendation, type }
  })

  // Calculate 3-month forecast summary
  const forecastOnly = forecastData.filter((d) => d.forecast)
  const totalForecast = forecastOnly.reduce((sum, d) => sum + (d.forecast || 0), 0)

  // Find forecast start month for reference line
  const forecastStartMonth = forecastData.find((d) => d.forecast)?.month

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
            height={350}
            yAxisFormatter={forecastYAxisFormatter}
            tooltipFormatter={forecastTooltipFormatter}
            showLegend
            legendFormatter={forecastLegendFormatter}
            referenceLine={forecastReferenceLine}
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
              height={280}
              yAxisDomain={[0.85, 1.15]}
              yAxisFormatter={seasonalYAxisFormatter}
              tooltipFormatter={seasonalTooltipFormatter}
              referenceLine={SEASONAL_REFERENCE_LINE}
            />
          </CardContent>
        </Card>
      </div>

      {/* Pricing Alerts */}
      <AlertCard alerts={pricingAlerts} />
    </div>
  )
}
