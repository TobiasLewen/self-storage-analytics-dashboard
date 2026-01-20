import { useState, useEffect } from 'react'
import { metricsService } from '../services/metricsService'
import type { MonthlyMetrics } from '../data/types'

interface UseMonthlyMetricsResult {
  metrics: MonthlyMetrics[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useMonthlyMetrics(): UseMonthlyMetricsResult {
  const [metrics, setMetrics] = useState<MonthlyMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMetrics = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await metricsService.getMonthlyMetrics()
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch monthly metrics'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  return { metrics, isLoading, error, refetch: fetchMetrics }
}
