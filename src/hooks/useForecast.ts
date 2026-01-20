import { useQuery } from '@tanstack/react-query'
import { forecastService } from '../services/forecastService'
import { forecastKeys } from '../lib/queryKeys'
import type { ForecastData, PricingAlert } from '../data/types'

interface UseForecastResult {
  forecast: ForecastData[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * useForecast Hook with React Query
 * 
 * Fetches forecast data with automatic caching and refetching.
 * Data is cached for 5 minutes and refetched on window focus or reconnect.
 */
export function useForecast(): UseForecastResult {
  const query = useQuery({
    queryKey: forecastKeys.data(),
    queryFn: () => forecastService.getForecast(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    forecast: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}

interface UsePricingAlertsResult {
  alerts: PricingAlert[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * usePricingAlerts Hook with React Query
 * 
 * Fetches pricing alerts data with automatic caching and refetching.
 * Data is cached for 5 minutes and refetched on window focus or reconnect.
 */
export function usePricingAlerts(): UsePricingAlertsResult {
  const query = useQuery({
    queryKey: forecastKeys.alerts(),
    queryFn: () => forecastService.getPricingAlerts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    alerts: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}
