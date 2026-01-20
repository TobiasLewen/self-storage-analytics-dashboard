import { api } from './api'
import type { ForecastData, PricingAlert } from '../data/types'

export const forecastService = {
  getForecast(): Promise<ForecastData[]> {
    return api.get<ForecastData[]>('/forecast')
  },

  getPricingAlerts(): Promise<PricingAlert[]> {
    return api.get<PricingAlert[]>('/alerts/pricing')
  },
}
