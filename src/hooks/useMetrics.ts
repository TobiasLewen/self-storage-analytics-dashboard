import { useQuery } from '@tanstack/react-query'
import { metricsService } from '../services/metricsService'
import { metricsKeys } from '../lib/queryKeys'
import type { MonthlyMetrics } from '../data/types'

interface UseMonthlyMetricsResult {
  metrics: MonthlyMetrics[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * useMonthlyMetrics Hook with React Query
 * 
 * Fetches monthly metrics data with automatic caching and refetching.
 * Data is cached for 5 minutes and refetched on window focus or reconnect.
 */
export function useMonthlyMetrics(): UseMonthlyMetricsResult {
  const query = useQuery({
    queryKey: metricsKeys.monthly(),
    queryFn: () => metricsService.getMonthlyMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    metrics: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}
