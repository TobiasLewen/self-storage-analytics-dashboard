import { QueryClient } from '@tanstack/react-query'

/**
 * Query Client Configuration
 * 
 * Best practices for caching and refetching:
 * - staleTime: Data is considered fresh for 5 minutes, reducing unnecessary refetches
 * - gcTime: Cache is kept for 10 minutes after becoming inactive
 * - retry: Failed requests are retried up to 3 times with exponential backoff
 * - refetchOnWindowFocus: Refetch when window regains focus (keeps data fresh)
 * - refetchOnReconnect: Refetch when network reconnects
 * - refetchOnMount: Refetch when component mounts if data is stale
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Cache is kept for 10 minutes after becoming inactive
      gcTime: 10 * 60 * 1000,
      
      // Retry failed requests up to 3 times
      retry: 3,
      
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch when window regains focus
      refetchOnWindowFocus: true,
      
      // Refetch when network reconnects
      refetchOnReconnect: true,
      
      // Refetch when component mounts if data is stale
      refetchOnMount: 'always',
    },
    mutations: {
      // Retry failed mutations up to 2 times
      retry: 2,
      
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})
