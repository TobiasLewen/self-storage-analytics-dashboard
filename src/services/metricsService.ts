import { monthlyMetrics, getDashboardSummary } from '../data/mockData'
import type { MonthlyMetrics, DashboardSummary } from '../data/types'

export const metricsService = {
  getMonthlyMetrics(): Promise<MonthlyMetrics[]> {
    return Promise.resolve(monthlyMetrics)
  },

  getDashboardSummary(): Promise<DashboardSummary> {
    return Promise.resolve(getDashboardSummary())
  },
}
