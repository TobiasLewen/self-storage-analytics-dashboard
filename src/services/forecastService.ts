import { getForecastData, getPricingAlerts } from '../data/mockData'
import type { ForecastData, PricingAlert } from '../data/types'

export const forecastService = {
  getForecast(): Promise<ForecastData[]> {
    // Simulate network delay for better loading state testing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getForecastData())
      }, 100)
    })
  },

  getPricingAlerts(): Promise<PricingAlert[]> {
    // Simulate network delay for better loading state testing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getPricingAlerts())
      }, 100)
    })
  },
}
