import { getForecastData, getPricingAlerts } from '../data/mockData'
import type { ForecastData, PricingAlert } from '../data/types'

export const forecastService = {
  getForecast(): Promise<ForecastData[]> {
    return Promise.resolve(getForecastData())
  },

  getPricingAlerts(): Promise<PricingAlert[]> {
    return Promise.resolve(getPricingAlerts())
  },
}
