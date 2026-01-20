import { useCallback, useEffect, useState } from 'react'

interface UseDataFetchOptions {
  simulateError?: boolean
  errorRate?: number
}

interface UseDataFetchResult<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  retry: () => void
}

export function useDataFetch<T>(
  fetchFn: () => T | Promise<T>,
  options: UseDataFetchOptions = {}
): UseDataFetchResult<T> {
  const { simulateError = false, errorRate = 0 } = options
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Simulate random errors if enabled
      if (simulateError || (errorRate > 0 && Math.random() < errorRate)) {
        throw new Error('Failed to fetch data. Please try again.')
      }

      const result = await fetchFn()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [fetchFn, simulateError, errorRate])

  useEffect(() => {
    fetchData()
  }, [fetchData, retryCount])

  const retry = useCallback(() => {
    setRetryCount((c) => c + 1)
  }, [])

  return { data, isLoading, error, retry }
}
