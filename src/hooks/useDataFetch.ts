import { useQuery, type UseQueryResult } from '@tanstack/react-query'

interface UseDataFetchOptions {
  simulateError?: boolean
  errorRate?: number
  queryKey?: unknown[]
  enabled?: boolean
}

interface UseDataFetchResult<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  retry: () => void
}

/**
 * useDataFetch Hook with React Query
 * 
 * This hook provides data fetching with automatic caching, refetching,
 * and deduplication using React Query.
 * 
 * @param fetchFn - Function that fetches data
 * @param options - Configuration options
 * @returns Object containing data, loading state, error, and retry function
 */
export function useDataFetch<T>(
  fetchFn: () => T | Promise<T>,
  options: UseDataFetchOptions = {}
): UseDataFetchResult<T> {
  const { simulateError = false, errorRate = 0, queryKey = ['data'], enabled = true } = options

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Simulate random errors if enabled
      if (simulateError || (errorRate > 0 && Math.random() < errorRate)) {
        throw new Error('Failed to fetch data. Please try again.')
      }

      return await fetchFn()
    },
    enabled,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    retry: query.refetch,
  }
}
