import { KPICard } from '@/components/cards/KPICard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MemoizedLineChart, MemoizedPieChart } from '@/components/charts/MemoizedCharts'
import { DataTable, createSortableColumn } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard, SkeletonChart, SkeletonPieChart, SkeletonTable } from '@/components/ui/skeleton'
import { PageErrorState } from '@/components/ui/error-state'
import { ExportButton } from '@/components/reports/ExportButton'
import { useDashboardSummary } from '@/hooks/useDashboard'
import { useCustomerSegments } from '@/hooks/useCustomers'
import { useMonthlyMetrics } from '@/hooks/useMetrics'
import { useCustomers } from '@/hooks/useCustomers'
import { useUnits } from '@/hooks/useUnits'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Users, UserMinus, Euro, Building2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

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

  // Show loading state while any data is being fetched
  if (isLoading) {
    return <CustomerAnalyticsSkeleton />
  }

  // Check for errors and provide specific error messages
  if (error) {
    const errorMessages = []
    if (summaryError) errorMessages.push(`Summary: ${summaryError.message}`)
    if (segmentsError) errorMessages.push(`Segments: ${segmentsError.message}`)
    if (metricsError) errorMessages.push(`Metrics: ${metricsError.message}`)
    if (customersError) errorMessages.push(`Customers: ${customersError.message}`)
    if (unitsError) errorMessages.push(`Units: ${unitsError.message}`)
    
    console.error('Customer analytics error:', errorMessages.join(', '))
    
    return (
      <PageErrorState
        title="Failed to load customer data"
        message={errorMessages.join(' | ') || 'Unable to load customer analytics. Please try again.'}
        onRetry={retry}
      />
    )
  }

  // Validate that all required data is present and not empty
  const hasSummary = summary !== undefined
  const hasSegments = segments && segments.length > 0
  const hasMonthlyData = monthlyData && monthlyData.length > 0
  const hasCustomersData = customersData && customersData.length > 0
  const hasUnitsData = unitsData && unitsData.length > 0

  if (!hasSummary || !hasSegments || !hasMonthlyData || !hasCustomersData || !hasUnitsData) {
    const missingData = []
    if (!hasSummary) missingData.push('Dashboard summary')
    if (!hasSegments) missingData.push('Customer segments')
    if (!hasMonthlyData) missingData.push('Monthly metrics')
    if (!hasCustomersData) missingData.push('Customer data')
    if (!hasUnitsData) missingData.push('Unit data')
    
    console.error('Customer analytics missing data:', missingData.join(', '))
    
    return (
      <PageErrorState
        title="Failed to load customer data"
        message={`Missing required data: ${missingData.join(', ')}. Please try again.`}
        onRetry={retry}
      />
    )
  }

  // At this point, all data is guaranteed to be present
  const safeSummary = summary!
  const safeSegments = segments!
  const safeMonthlyData = monthlyData!
  const safeCustomersData = customersData!
  const safeUnitsData = unitsData!

  // Get top customers by units rented
  const activeCustomers = safeCustomersData.filter((c) => !c.endDate)
  const customerRevenue = activeCustomers.map((customer) => {
    const customerUnits = safeUnitsData.filter((u) => u.customerId === customer.id)
    const monthlyRevenue = customerUnits.reduce((sum, u) => sum + u.pricePerMonth, 0)
    return {
      ...customer,
      unitsCount: customerUnits.length,
      monthlyRevenue,
    }
  }).sort((a, b) => b.monthlyRevenue - a.monthlyRevenue).slice(0, 10)

  // Prepare data for new customers chart
  const customerTrendData = safeMonthlyData.map((m) => ({
    month: m.month,
    newCustomers: m.newCustomers,
    churnedCustomers: m.churnedCustomers,
    netGrowth: m.newCustomers - m.churnedCustomers,
  }))

  // Prepare pie chart data with translated names
  const pieChartData = safeSegments.map(s => ({ ...s, name: s.type === 'private' ? 'Privat' : 'Geschäft' }))

  // Define table columns
  const customerColumns: ColumnDef<typeof customerRevenue[0]>[] = [
    createSortableColumn('name', 'Kunde', ({ getValue }) => (
      <div className="font-medium">{getValue() as string}</div>
    )),
    createSortableColumn('type', 'Typ', ({ getValue }) => {
      const type = getValue() as string
      return (
        <Badge variant={type === 'business' ? 'default' : 'secondary'}>
          {type === 'business' ? 'Geschäft' : 'Privat'}
        </Badge>
      )
    }),
    createSortableColumn('unitsCount', 'Einheiten', ({ getValue }) => (
      <div className="text-right">{getValue() as number}</div>
    )),
    createSortableColumn('monthlyRevenue', 'Monatl. Umsatz', ({ getValue }) => (
      <div className="text-right font-medium">{formatCurrency(getValue() as number)}</div>
    )),
    createSortableColumn('startDate', 'Seit', ({ getValue }) => {
      const date = new Date(getValue() as string)
      return date.toLocaleDateString('de-DE', {
        month: 'short',
        year: 'numeric',
      })
    }),
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Aktive Kunden"
          value={safeSummary.totalCustomers.toString()}
          icon={Users}
          iconColor="text-blue-500"
        />
        <KPICard
          title="Churn Rate"
          value={formatPercent(safeSummary.churnRate)}
          icon={UserMinus}
          iconColor="text-red-500"
        />
        <KPICard
          title="Ø Customer Lifetime Value"
          value={formatCurrency(safeSummary.avgCustomerLifetimeValue)}
          icon={Euro}
          iconColor="text-green-500"
        />
        <KPICard
          title="Geschäftskunden"
          value={`${safeSegments.find((s) => s.type === 'business')?.count || 0}`}
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
              {safeSegments.map((segment, index) => (
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
          <div className="flex items-center justify-between">
            <CardTitle>Top Kunden nach Umsatz</CardTitle>
            <ExportButton />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={customerColumns}
            data={customerRevenue}
            searchKey="name"
            searchPlaceholder="Kunden suchen..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
