import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { pdf } from '@react-pdf/renderer'
import { utils, writeFile } from 'xlsx'
import { FileDown, Loader2, FileText, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MonthlyReportPDF } from './MonthlyReportPDF'
import {
  getDashboardSummary,
  getUnitSizeMetrics,
  getCustomerSegments,
  monthlyMetrics,
} from '@/data/mockData'

export function ExportButton() {
  const { t, i18n } = useTranslation()
  const [isGenerating, setIsGenerating] = useState(false)

  const locale = i18n.language === 'de' ? 'de-DE' : 'en-US'

  const getPDFTranslations = () => ({
    monthlyBusinessReport: t('reports.monthlyBusinessReport'),
    reportPeriod: t('reports.reportPeriod'),
    createdAt: t('reports.createdAt'),
    kpiOverview: t('reports.kpiOverview'),
    occupancyRate: t('reports.occupancyRate'),
    monthlyRevenue: t('reports.monthlyRevenue'),
    vsPreviousMonth: t('reports.vsPreviousMonth'),
    activeCustomers: t('reports.activeCustomers'),
    availableUnits: t('reports.availableUnits'),
    avgRentalDuration: t('reports.avgRentalDuration'),
    months: t('reports.months'),
    churnRate: t('reports.churnRate'),
    unitPerformanceBySize: t('reports.unitPerformanceBySize'),
    columns: {
      size: t('reports.columns.size'),
      total: t('reports.columns.total'),
      occupied: t('reports.columns.occupied'),
      occupancy: t('reports.columns.occupancy'),
      avgPrice: t('reports.columns.avgPrice'),
      revenue: t('reports.columns.revenue'),
    },
    revenueLast3Months: t('reports.revenueLast3Months'),
    month: t('reports.month'),
    revenue: t('reports.revenue'),
    occupancy: t('reports.occupancy'),
    customerSegments: t('reports.customerSegments'),
    segment: t('reports.segment'),
    count: t('reports.count'),
    share: t('reports.share'),
    privateCustomers: t('reports.privateCustomers'),
    businessCustomers: t('reports.businessCustomers'),
    summary: t('reports.summary'),
    summaryText: t('reports.summaryText'),
    revenueIncreased: t('reports.revenueIncreased'),
    revenueDecreased: t('reports.revenueDecreased'),
    customerLifetimeValue: t('reports.customerLifetimeValue'),
    confidential: t('reports.confidential'),
    pageOf: t('reports.pageOf'),
  })

  const handleExportPDF = async () => {
    setIsGenerating(true)

    try {
      const summary = getDashboardSummary()
      const unitMetrics = getUnitSizeMetrics()
      const customerSegments = getCustomerSegments()

      const currentDate = new Date()
      const reportMonth = currentDate.toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric',
      })

      const blob = await pdf(
        <MonthlyReportPDF
          summary={summary}
          unitMetrics={unitMetrics}
          monthlyData={monthlyMetrics}
          customerSegments={customerSegments}
          reportMonth={reportMonth}
          translations={getPDFTranslations()}
          locale={locale}
        />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `StorageHub_Bericht_${currentDate.toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportCSV = () => {
    try {
      const summary = getDashboardSummary()
      const unitMetrics = getUnitSizeMetrics()
      const customerSegments = getCustomerSegments()

      const csvData = [
        ['Summary'],
        ['Total Customers', summary.totalCustomers],
        ['Monthly Revenue', summary.monthlyRevenue],
        ['Churn Rate', summary.churnRate],
        ['Avg Customer Lifetime Value', summary.avgCustomerLifetimeValue],
        [],
        ['Unit Metrics'],
        ['Size', 'Total Units', 'Occupied Units', 'Occupancy Rate', 'Avg Price', 'Revenue per SqM', 'Total Revenue'],
        ...unitMetrics.map(item => [
          item.size,
          item.totalUnits,
          item.occupiedUnits,
          item.occupancyRate,
          item.avgPrice,
          item.revenuePerSqm,
          item.totalRevenue
        ]),
        [],
        ['Customer Segments'],
        ['Type', 'Count', 'Percentage'],
        ...customerSegments.map(segment => [
          segment.type,
          segment.count,
          segment.percentage
        ])
      ]

      const ws = utils.aoa_to_sheet(csvData)
      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, 'Report')
      const currentDate = new Date()
      writeFile(wb, `StorageHub_Report_${currentDate.toISOString().split('T')[0]}.csv`)
    } catch (error) {
      console.error('Error generating CSV:', error)
    }
  }

  const handleExportExcel = () => {
    try {
      const summary = getDashboardSummary()
      const unitMetrics = getUnitSizeMetrics()
      const customerSegments = getCustomerSegments()

      const summaryData = [
        ['Summary'],
        ['Total Customers', summary.totalCustomers],
        ['Monthly Revenue', summary.monthlyRevenue],
        ['Churn Rate', summary.churnRate],
        ['Avg Customer Lifetime Value', summary.avgCustomerLifetimeValue],
      ]

      const unitData = [
        ['Unit Metrics'],
        ['Size', 'Total Units', 'Occupied Units', 'Occupancy Rate', 'Avg Price', 'Revenue per SqM', 'Total Revenue'],
        ...unitMetrics.map(item => [
          item.size,
          item.totalUnits,
          item.occupiedUnits,
          item.occupancyRate,
          item.avgPrice,
          item.revenuePerSqm,
          item.totalRevenue
        ]),
      ]

      const segmentData = [
        ['Customer Segments'],
        ['Type', 'Count', 'Percentage'],
        ...customerSegments.map(segment => [
          segment.type,
          segment.count,
          segment.percentage
        ])
      ]

      const wb = utils.book_new()
      const ws1 = utils.aoa_to_sheet(summaryData)
      const ws2 = utils.aoa_to_sheet(unitData)
      const ws3 = utils.aoa_to_sheet(segmentData)

      utils.book_append_sheet(wb, ws1, 'Summary')
      utils.book_append_sheet(wb, ws2, 'Unit Metrics')
      utils.book_append_sheet(wb, ws3, 'Customer Segments')

      const currentDate = new Date()
      writeFile(wb, `StorageHub_Report_${currentDate.toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error generating Excel:', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={isGenerating}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Export PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileText className="mr-2 h-4 w-4" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
