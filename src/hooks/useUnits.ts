import { useQuery } from '@tanstack/react-query'
import { unitService } from '../services/unitService'
import { unitKeys } from '../lib/queryKeys'
import type { Unit, UnitSizeMetrics } from '../data/types'

interface UseUnitsResult {
  units: Unit[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * useUnits Hook with React Query
 * 
 * Fetches unit data with automatic caching and refetching.
 * Data is cached for 5 minutes and refetched on window focus or reconnect.
 */
export function useUnits(): UseUnitsResult {
  const query = useQuery({
    queryKey: unitKeys.list(),
    queryFn: () => unitService.getUnits(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    units: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}

interface UseUnitMetricsResult {
  metrics: UnitSizeMetrics[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * useUnitMetrics Hook with React Query
 * 
 * Fetches unit metrics data with automatic caching and refetching.
 * Data is cached for 5 minutes and refetched on window focus or reconnect.
 */
export function useUnitMetrics(): UseUnitMetricsResult {
  const query = useQuery({
    queryKey: unitKeys.metrics(),
    queryFn: () => unitService.getUnitMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    metrics: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}
