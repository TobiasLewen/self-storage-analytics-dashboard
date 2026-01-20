import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MemoizedBarChart } from '@/components/charts/MemoizedCharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard, SkeletonChart, SkeletonTable } from '@/components/ui/skeleton'
import { PageErrorState } from '@/components/ui/error-state'
import { useUnitMetrics } from '@/hooks/useUnits'
import { useMonthlyMetrics } from '@/hooks/useMetrics'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { getOccupancyStatus } from '@/lib/metrics'
import {
  findMostProfitableSize,
  findLeastProfitableSize,
  calculateUnitTurnoverRate,
  compareUnitRevenueToAverage,
  getTrendLabel,
} from '@/services/analyticsService'
import {
  CHART_COLOR_PALETTE,
  CHART_DIMENSIONS,
  Y_AXIS_DOMAINS,
  LABELS,
} from '@/constants'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

// Chart configurations - defined outside component
const OCCUPANCY_BAR_CONFIG = [{
  dataKey: 'occupancyRate',
  fill: CHART_COLOR_PALETTE[0],
  radius: [4, 4, 0, 0] as [number, number, number, number],
}]

const occupancyTooltipFormatter = (value: number) => [`${value}%`, LABELS.chart.occupancy] as [string, string]
const occupancyYAxisFormatter = (value: number) => `${value}%`

/** Occupancy status icon mapping */
const OccupancyIcon = {
  high: CheckCircle2,
  medium: AlertCircle,
  low: XCircle,
} as const

/** Occupancy status color class mapping */
const OCCUPANCY_COLOR_CLASSES = {
  high: 'text-green-600',
  medium: 'text-yellow-600',
  low: 'text-red-600',
} as const

function UnitPerformanceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonChart height={CHART_DIMENSIONS.default} />
      <SkeletonTable rows={5} />
    </div>
  )
}

export function UnitPerformance() {
  const { metrics: unitSizeData, isLoading: unitsLoading, error: unitsError, refetch: refetchUnits } = useUnitMetrics()
  const { metrics: monthlyData, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useMonthlyMetrics()

  const isLoading = unitsLoading || metricsLoading
  const error = unitsError || metricsError

  const retry = () => {
    refetchUnits()
    refetchMetrics()
  }

  if (isLoading) {
    return <UnitPerformanceSkeleton />
  }

  if (error) {
    const errorMessages = []
    if (unitsError) errorMessages.push(`Units: ${unitsError.message}`)
    if (metricsError) errorMessages.push(`Metrics: ${metricsError.message}`)

    console.error('Unit performance error:', errorMessages.join(', '))

    return (
      <PageErrorState
        title="Failed to load unit data"
        message={errorMessages.join(' | ') || 'Unable to load unit performance data. Please try again.'}
        onRetry={retry}
      />
    )
  }

  const hasUnitSizeData = unitSizeData && unitSizeData.length > 0
  const hasMonthlyData = monthlyData && monthlyData.length > 0

  if (!hasUnitSizeData || !hasMonthlyData) {
    const missingData = []
    if (!hasUnitSizeData) missingData.push('Unit size data')
    if (!hasMonthlyData) missingData.push('Monthly metrics')

    console.error('Unit performance missing data:', missingData.join(', '))

    return (
      <PageErrorState
        title="Failed to load unit data"
        message={`Missing required data: ${missingData.join(', ')}. Please try again.`}
        onRetry={retry}
      />
    )
  }

  const safeUnitSizeData = unitSizeData!
  const safeMonthlyData = monthlyData!

  // Use service layer for business logic
  const mostProfitable = findMostProfitableSize(safeUnitSizeData)
  const leastProfitable = findLeastProfitableSize(safeUnitSizeData)
  const turnoverRate = calculateUnitTurnoverRate(safeMonthlyData)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profitabelste Größe</p>
                <p className="text-2xl font-bold">{mostProfitable.size}</p>
                <p className="text-sm text-green-600">
                  {formatCurrency(mostProfitable.revenuePerSqm)}/m²
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Am wenigsten profitabel</p>
                <p className="text-2xl font-bold">{leastProfitable.size}</p>
                <p className="text-sm text-red-600">
                  {formatCurrency(leastProfitable.revenuePerSqm)}/m²
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Minus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Einheiten-Fluktuation</p>
                <p className="text-2xl font-bold">{turnoverRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">pro Monat</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy by Size Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Belegungsrate nach Größe</CardTitle>
        </CardHeader>
        <CardContent>
          <MemoizedBarChart
            data={safeUnitSizeData}
            bars={OCCUPANCY_BAR_CONFIG}
            xAxisKey="size"
            height={CHART_DIMENSIONS.default}
            yAxisDomain={Y_AXIS_DOMAINS.percentage}
            yAxisFormatter={occupancyYAxisFormatter}
            tooltipFormatter={occupancyTooltipFormatter}
            cellColors={[...CHART_COLOR_PALETTE]}
            ariaLabel="Bar chart showing occupancy rate by unit size"
          />
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Umsatz pro Quadratmeter</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Größe</TableHead>
                <TableHead className="text-right">Einheiten</TableHead>
                <TableHead className="text-right">Belegt</TableHead>
                <TableHead className="text-right">Belegung</TableHead>
                <TableHead className="text-right">Ø Preis</TableHead>
                <TableHead className="text-right">€/m²</TableHead>
                <TableHead className="text-right">Gesamt</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeUnitSizeData.map((item, index) => {
                const occupancyStatus = getOccupancyStatus(item.occupancyRate)
                const OccupancyStatusIcon = OccupancyIcon[occupancyStatus]
                const comparison = compareUnitRevenueToAverage(item.revenuePerSqm, safeUnitSizeData)
                const isAboveAvg = comparison === 'above'

                return (
                  <TableRow key={item.size}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{ borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length] }}
                      >
                        {item.size}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.totalUnits}</TableCell>
                    <TableCell className="text-right">{item.occupiedUnits}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <OccupancyStatusIcon
                          className={`h-4 w-4 ${OCCUPANCY_COLOR_CLASSES[occupancyStatus]}`}
                          aria-hidden="true"
                        />
                        <span className={OCCUPANCY_COLOR_CLASSES[occupancyStatus]}>
                          {formatPercent(item.occupancyRate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.avgPrice)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.revenuePerSqm)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.totalRevenue)}
                    </TableCell>
                    <TableCell>
                      {isAboveAvg ? (
                        <div className="flex items-center text-green-600">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="text-xs">{getTrendLabel('above')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <ArrowDownRight className="h-4 w-4" />
                          <span className="text-xs">{getTrendLabel('below')}</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
