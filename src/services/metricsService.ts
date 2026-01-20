import { monthlyMetrics, getDashboardSummary } from '../data/mockData'
import type { MonthlyMetrics, DashboardSummary } from '../data/types'

export const metricsService = {
  getMonthlyMetrics(): Promise<MonthlyMetrics[]> {
    // Simulate network delay for better loading state testing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(monthlyMetrics)
      }, 100)
    })
  },

  getDashboardSummary(): Promise<DashboardSummary> {
    // Simulate network delay for better loading state testing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getDashboardSummary())
      }, 100)
    })
  },
}
