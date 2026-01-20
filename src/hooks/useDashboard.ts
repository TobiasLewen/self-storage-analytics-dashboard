import { useState, useEffect } from 'react'
import { metricsService } from '../services/metricsService'
import type { DashboardSummary } from '../data/types'

interface UseDashboardSummaryResult {
  summary: DashboardSummary | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useDashboardSummary(): UseDashboardSummaryResult {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSummary = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await metricsService.getDashboardSummary()
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard summary'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  return { summary, isLoading, error, refetch: fetchSummary }
}
