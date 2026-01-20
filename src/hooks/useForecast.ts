import { useState, useEffect } from 'react'
import { forecastService } from '../services/forecastService'
import type { ForecastData, PricingAlert } from '../data/types'

interface UseForecastResult {
  forecast: ForecastData[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useForecast(): UseForecastResult {
  const [forecast, setForecast] = useState<ForecastData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchForecast = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await forecastService.getForecast()
      setForecast(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch forecast'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchForecast()
  }, [])

  return { forecast, isLoading, error, refetch: fetchForecast }
}

interface UsePricingAlertsResult {
  alerts: PricingAlert[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function usePricingAlerts(): UsePricingAlertsResult {
  const [alerts, setAlerts] = useState<PricingAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAlerts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await forecastService.getPricingAlerts()
      setAlerts(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch pricing alerts'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  return { alerts, isLoading, error, refetch: fetchAlerts }
}
