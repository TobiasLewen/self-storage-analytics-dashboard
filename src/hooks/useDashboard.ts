import { useQuery } from '@tanstack/react-query'
import { metricsService } from '../services/metricsService'
import { dashboardKeys } from '../lib/queryKeys'
import type { DashboardSummary } from '../data/types'

interface UseDashboardSummaryResult {
  summary: DashboardSummary | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * useDashboardSummary Hook with React Query
 * 
 * Fetches dashboard summary data with automatic caching and refetching.
 * Data is cached for 5 minutes and refetched on window focus or reconnect.
 */
export function useDashboardSummary(): UseDashboardSummaryResult {
  const query = useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => metricsService.getDashboardSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    summary: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}
