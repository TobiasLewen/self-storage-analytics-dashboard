import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MemoizedBarChart } from '@/components/charts/MemoizedCharts'
import { DataTable, createSortableColumn } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard, SkeletonChart, SkeletonTable } from '@/components/ui/skeleton'
import { PageErrorState } from '@/components/ui/error-state'
import { ExportButton } from '@/components/reports/ExportButton'
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
import type { ColumnDef } from '@tanstack/react-table'
import type { UnitSizeMetrics } from '@/data/types'

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

  // Define table columns
  const unitPerformanceColumns: ColumnDef<UnitSizeMetrics>[] = [
    createSortableColumn('size', 'Größe', ({ getValue, row }) => {
      const index = row.index
      return (
        <Badge
          variant="outline"
          style={{ borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length] }}
        >
          {getValue() as string}
        </Badge>
      )
    }),
    createSortableColumn('totalUnits', 'Einheiten', ({ getValue }) => (
      <div className="text-right">{getValue() as number}</div>
    )),
    createSortableColumn('occupiedUnits', 'Belegt', ({ getValue }) => (
      <div className="text-right">{getValue() as number}</div>
    )),
    createSortableColumn('occupancyRate', 'Belegung', ({ getValue }) => {
      const occupancyRate = getValue() as number
      const occupancyStatus = getOccupancyStatus(occupancyRate)
      const OccupancyStatusIcon = OccupancyIcon[occupancyStatus]
      return (
        <div className="flex items-center justify-end gap-1">
          <OccupancyStatusIcon
            className={`h-4 w-4 ${OCCUPANCY_COLOR_CLASSES[occupancyStatus]}`}
            aria-hidden="true"
          />
          <span className={OCCUPANCY_COLOR_CLASSES[occupancyStatus]}>
            {formatPercent(occupancyRate)}
          </span>
        </div>
      )
    }),
    createSortableColumn('avgPrice', 'Ø Preis', ({ getValue }) => (
      <div className="text-right">{formatCurrency(getValue() as number)}</div>
    )),
    createSortableColumn('revenuePerSqm', '€/m²', ({ getValue }) => (
      <div className="text-right font-medium">{formatCurrency(getValue() as number)}</div>
    )),
    createSortableColumn('totalRevenue', 'Gesamt', ({ getValue }) => (
      <div className="text-right">{formatCurrency(getValue() as number)}</div>
    )),
    {
      accessorKey: 'trend',
      header: 'Trend',
      cell: ({ row }) => {
        const item = row.original
        const comparison = compareUnitRevenueToAverage(item.revenuePerSqm, safeUnitSizeData)
        const isAboveAvg = comparison === 'above'
        return (
          <div>
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
          </div>
        )
      },
    },
  ]

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
          <div className="flex items-center justify-between">
            <CardTitle>Umsatz pro Quadratmeter</CardTitle>
            <ExportButton />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={unitPerformanceColumns}
            data={safeUnitSizeData}
            searchKey="size"
            searchPlaceholder="Größe suchen..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
