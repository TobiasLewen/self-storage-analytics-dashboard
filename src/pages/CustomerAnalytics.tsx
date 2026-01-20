import { useMemo } from 'react'
import { KPICard } from '@/components/cards/KPICard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MemoizedLineChart, MemoizedPieChart } from '@/components/charts/MemoizedCharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard, SkeletonChart, SkeletonPieChart, SkeletonTable } from '@/components/ui/skeleton'
import { PageErrorState } from '@/components/ui/error-state'
import { useDashboardSummary } from '@/hooks/useDashboard'
import { useCustomerSegments } from '@/hooks/useCustomers'
import { useMonthlyMetrics } from '@/hooks/useMetrics'
import { useCustomers } from '@/hooks/useCustomers'
import { useUnits } from '@/hooks/useUnits'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Users, UserMinus, Euro, Building2 } from 'lucide-react'

const COLORS = ['#3b82f6', '#22c55e']

// Chart configurations - defined outside component
const CUSTOMER_TREND_LINE_CONFIG = [
  { dataKey: 'newCustomers', name: 'Neue Kunden', stroke: '#22c55e', dot: { fill: '#22c55e' } },
  { dataKey: 'churnedCustomers', name: 'Abgegangen', stroke: '#ef4444', dot: { fill: '#ef4444' } },
]

const pieLabelFormatter = (entry: { name: string; percent?: number }) =>
  `${entry.name}: ${((entry.percent ?? 0) * 100).toFixed(0)}%`

const pieTooltipFormatter = (value: number) => [`${value} Kunden`, ''] as [string, string]

function CustomerAnalyticsSkeleton() {
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
        <SkeletonPieChart />
      </div>
      <SkeletonTable rows={10} />
    </div>
  )
}

export function CustomerAnalytics() {
  const { summary, isLoading: summaryLoading, error: summaryError, refetch: refetchSummary } = useDashboardSummary()
  const { segments, isLoading: segmentsLoading, error: segmentsError, refetch: refetchSegments } = useCustomerSegments()
  const { metrics: monthlyData, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useMonthlyMetrics()
  const { customers: customersData, isLoading: customersLoading, error: customersError, refetch: refetchCustomers } = useCustomers()
  const { units: unitsData, isLoading: unitsLoading, error: unitsError, refetch: refetchUnits } = useUnits()

  const isLoading = summaryLoading || segmentsLoading || metricsLoading || customersLoading || unitsLoading
  const error = summaryError || segmentsError || metricsError || customersError || unitsError

  const retry = () => {
    refetchSummary()
    refetchSegments()
    refetchMetrics()
    refetchCustomers()
    refetchUnits()
  }

  if (isLoading) {
    return <CustomerAnalyticsSkeleton />
  }

  if (error || !summary || !segments || !monthlyData || !customersData || !unitsData) {
    return (
      <PageErrorState
        title="Failed to load customer data"
        message={error?.message || 'Unable to load customer analytics. Please try again.'}
        onRetry={retry}
      />
    )
  }

  // Get top customers by units rented
  const activeCustomers = customersData.filter((c) => !c.endDate)
  const customerRevenue = activeCustomers.map((customer) => {
    const customerUnits = unitsData.filter((u) => u.customerId === customer.id)
    const monthlyRevenue = customerUnits.reduce((sum, u) => sum + u.pricePerMonth, 0)
    return {
      ...customer,
      unitsCount: customerUnits.length,
      monthlyRevenue,
    }
  }).sort((a, b) => b.monthlyRevenue - a.monthlyRevenue).slice(0, 10)

  // Prepare data for new customers chart
  const customerTrendData = monthlyData.map((m) => ({
    month: m.month,
    newCustomers: m.newCustomers,
    churnedCustomers: m.churnedCustomers,
    netGrowth: m.newCustomers - m.churnedCustomers,
  }))

  // Prepare pie chart data with translated names
  const pieChartData = segments.map(s => ({ ...s, name: s.type === 'private' ? 'Privat' : 'Geschäft' }))

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Aktive Kunden"
          value={summary.totalCustomers.toString()}
          icon={Users}
          iconColor="text-blue-500"
        />
        <KPICard
          title="Churn Rate"
          value={formatPercent(summary.churnRate)}
          icon={UserMinus}
          iconColor="text-red-500"
        />
        <KPICard
          title="Ø Customer Lifetime Value"
          value={formatCurrency(summary.avgCustomerLifetimeValue)}
          icon={Euro}
          iconColor="text-green-500"
        />
        <KPICard
          title="Geschäftskunden"
          value={`${segments.find((s) => s.type === 'business')?.count || 0}`}
          icon={Building2}
          iconColor="text-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* New Customers Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Kundenentwicklung (12 Monate)</CardTitle>
          </CardHeader>
          <CardContent>
            <MemoizedLineChart
              data={customerTrendData}
              lines={CUSTOMER_TREND_LINE_CONFIG}
              xAxisKey="month"
              height={300}
              showLegend
            />
          </CardContent>
        </Card>

        {/* Customer Segmentation */}
        <Card>
          <CardHeader>
            <CardTitle>Kundensegmentierung</CardTitle>
          </CardHeader>
          <CardContent>
            <MemoizedPieChart
              data={pieChartData}
              dataKey="count"
              nameKey="name"
              height={300}
              colors={COLORS}
              labelFormatter={pieLabelFormatter}
              tooltipFormatter={pieTooltipFormatter}
            />
            <div className="mt-4 flex justify-center gap-8">
              {segments.map((segment, index) => (
                <div key={segment.type} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm">
                    {segment.type === 'private' ? 'Privat' : 'Geschäft'}:{' '}
                    {segment.count} ({segment.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Kunden nach Umsatz</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kunde</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead className="text-right">Einheiten</TableHead>
                <TableHead className="text-right">Monatl. Umsatz</TableHead>
                <TableHead>Seit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerRevenue.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={customer.type === 'business' ? 'default' : 'secondary'}
                    >
                      {customer.type === 'business' ? 'Geschäft' : 'Privat'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{customer.unitsCount}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(customer.monthlyRevenue)}
                  </TableCell>
                  <TableCell>
                    {new Date(customer.startDate).toLocaleDateString('de-DE', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
