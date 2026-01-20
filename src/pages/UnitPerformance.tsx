import { useCallback } from 'react'
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
import { useDataFetch } from '@/hooks/useDataFetch'
import { getUnitSizeMetrics, monthlyMetrics } from '@/data/mockData'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

// Chart configurations - defined outside component
const OCCUPANCY_BAR_CONFIG = [{
  dataKey: 'occupancyRate',
  fill: COLORS[0],
  radius: [4, 4, 0, 0] as [number, number, number, number],
}]

const occupancyTooltipFormatter = (value: number) => [`${value}%`, 'Belegung'] as [string, string]
const occupancyYAxisFormatter = (value: number) => `${value}%`

function UnitPerformanceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonChart height={300} />
      <SkeletonTable rows={5} />
    </div>
  )
}

export function UnitPerformance() {
  const fetchData = useCallback(() => ({
    unitSizeData: getUnitSizeMetrics(),
    monthlyData: monthlyMetrics,
  }), [])

  const { data, isLoading, error, retry } = useDataFetch(fetchData)

  if (isLoading) {
    return <UnitPerformanceSkeleton />
  }

  if (error || !data) {
    return (
      <PageErrorState
        title="Failed to load unit data"
        message={error?.message || 'Unable to load unit performance data. Please try again.'}
        onRetry={retry}
      />
    )
  }

  const { unitSizeData, monthlyData } = data

  // Calculate most/least profitable
  const sortedByRevenue = [...unitSizeData].sort((a, b) => b.revenuePerSqm - a.revenuePerSqm)
  const mostProfitable = sortedByRevenue[0]
  const leastProfitable = sortedByRevenue[sortedByRevenue.length - 1]

  // Calculate turnover rate (simplified: new customers / total customers)
  const lastMonth = monthlyData[monthlyData.length - 1]
  const turnoverRate = ((lastMonth.newCustomers + lastMonth.churnedCustomers) / lastMonth.occupiedUnits) * 100

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
            data={unitSizeData}
            bars={OCCUPANCY_BAR_CONFIG}
            xAxisKey="size"
            height={300}
            yAxisDomain={[0, 100]}
            yAxisFormatter={occupancyYAxisFormatter}
            tooltipFormatter={occupancyTooltipFormatter}
            cellColors={COLORS}
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
              {unitSizeData.map((item, index) => {
                const avgRevenuePerSqm = unitSizeData.reduce((sum, i) => sum + i.revenuePerSqm, 0) / unitSizeData.length
                const isAboveAvg = item.revenuePerSqm > avgRevenuePerSqm

                return (
                  <TableRow key={item.size}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{ borderColor: COLORS[index % COLORS.length] }}
                      >
                        {item.size}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.totalUnits}</TableCell>
                    <TableCell className="text-right">{item.occupiedUnits}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          item.occupancyRate >= 85
                            ? 'text-green-600'
                            : item.occupancyRate >= 70
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }
                      >
                        {formatPercent(item.occupancyRate)}
                      </span>
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
                          <span className="text-xs">Über Ø</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <ArrowDownRight className="h-4 w-4" />
                          <span className="text-xs">Unter Ø</span>
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
