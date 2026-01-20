import { useQuery } from '@tanstack/react-query'
import { customerService } from '../services/customerService'
import { customerKeys } from '../lib/queryKeys'
import type { Customer, CustomerSegment } from '../data/types'

interface UseCustomersResult {
  customers: Customer[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * useCustomers Hook with React Query
 * 
 * Fetches customer data with automatic caching and refetching.
 * Data is cached for 5 minutes and refetched on window focus or reconnect.
 */
export function useCustomers(): UseCustomersResult {
  const query = useQuery({
    queryKey: customerKeys.list(),
    queryFn: () => customerService.getCustomers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    customers: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}

interface UseCustomerSegmentsResult {
  segments: CustomerSegment[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * useCustomerSegments Hook with React Query
 * 
 * Fetches customer segment data with automatic caching and refetching.
 * Data is cached for 5 minutes and refetched on window focus or reconnect.
 */
export function useCustomerSegments(): UseCustomerSegmentsResult {
  const query = useQuery({
    queryKey: customerKeys.segments(),
    queryFn: () => customerService.getCustomerSegments(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    segments: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}
