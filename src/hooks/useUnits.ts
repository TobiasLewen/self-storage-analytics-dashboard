import { useState, useEffect } from 'react'
import { unitService } from '../services/unitService'
import type { Unit, UnitSizeMetrics } from '../data/types'

interface UseUnitsResult {
  units: Unit[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useUnits(): UseUnitsResult {
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUnits = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await unitService.getUnits()
      setUnits(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch units'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUnits()
  }, [])

  return { units, isLoading, error, refetch: fetchUnits }
}

interface UseUnitMetricsResult {
  metrics: UnitSizeMetrics[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useUnitMetrics(): UseUnitMetricsResult {
  const [metrics, setMetrics] = useState<UnitSizeMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMetrics = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await unitService.getUnitMetrics()
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch unit metrics'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  return { metrics, isLoading, error, refetch: fetchMetrics }
}
