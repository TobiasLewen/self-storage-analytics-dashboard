import { api } from './api'
import type { MonthlyMetrics, DashboardSummary } from '../data/types'

export const metricsService = {
  getMonthlyMetrics(): Promise<MonthlyMetrics[]> {
    return api.get<MonthlyMetrics[]>('/metrics/monthly')
  },

  getDashboardSummary(): Promise<DashboardSummary> {
    return api.get<DashboardSummary>('/dashboard/summary')
  },
}
