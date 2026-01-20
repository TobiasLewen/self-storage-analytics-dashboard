/**
 * Analytics Service
 * Business logic layer for analytics calculations and data transformations
 */

import type { UnitSizeMetrics, MonthlyMetrics, Customer, Unit } from '@/data/types'
import {
  LABELS,
  FORECAST_CONFIG,
} from '@/constants'
import {
  getPricingRecommendation,
  calculateTurnoverRate,
  calculateSeasonalIndex,
  calculateForecastValue,
  calculateConfidenceInterval,
  calculateAverage,
  compareToAverage,
  type PricingRecommendationType,
} from '@/lib/metrics'

// =============================================================================
// TYPES
// =============================================================================

export interface PricingRecommendation {
  size: string
  occupancy: number
  recommendation: string
  type: PricingRecommendationType
}

export interface CustomerTrendData {
  month: string
  newCustomers: number
  churnedCustomers: number
  netGrowth: number
}

export interface SeasonalData extends MonthlyMetrics {
  seasonalIndex: number
}

export interface ForecastDataPoint {
  month: string
  actual?: number
  forecast?: number
  upperBound?: number
  lowerBound?: number
}

export interface TopCustomer extends Customer {
  unitsCount: number
  monthlyRevenue: number
}

// =============================================================================
// UNIT ANALYTICS
// =============================================================================

/**
 * Finds the most profitable unit size by revenue per square meter
 * @param unitSizeData - Array of unit size metrics
 * @returns The most profitable unit size metrics
 */
export function findMostProfitableSize(
  unitSizeData: UnitSizeMetrics[]
): UnitSizeMetrics {
  return [...unitSizeData].sort((a, b) => b.revenuePerSqm - a.revenuePerSqm)[0]
}

/**
 * Finds the least profitable unit size by revenue per square meter
 * @param unitSizeData - Array of unit size metrics
 * @returns The least profitable unit size metrics
 */
export function findLeastProfitableSize(
  unitSizeData: UnitSizeMetrics[]
): UnitSizeMetrics {
  return [...unitSizeData].sort((a, b) => a.revenuePerSqm - b.revenuePerSqm)[0]
}

/**
 * Calculates the unit turnover rate from monthly metrics
 * @param monthlyData - Array of monthly metrics
 * @returns Turnover rate as percentage for the most recent month
 */
export function calculateUnitTurnoverRate(monthlyData: MonthlyMetrics[]): number {
  const lastMonth = monthlyData[monthlyData.length - 1]
  return calculateTurnoverRate(
    lastMonth.newCustomers,
    lastMonth.churnedCustomers,
    lastMonth.occupiedUnits
  )
}

// =============================================================================
// PRICING ANALYTICS
// =============================================================================

/**
 * Generates pricing recommendations based on unit occupancy rates
 * @param unitSizeData - Array of unit size metrics
 * @returns Array of pricing recommendations with localized messages
 */
export function generatePricingRecommendations(
  unitSizeData: UnitSizeMetrics[]
): PricingRecommendation[] {
  return unitSizeData.map((size) => {
    const type = getPricingRecommendation(size.occupancyRate)

    let recommendation: string
    switch (type) {
      case 'increase':
        recommendation = LABELS.pricing.increaseRecommendation(size.size)
        break
      case 'decrease':
        recommendation = LABELS.pricing.decreaseRecommendation(size.size)
        break
      default:
        recommendation = LABELS.pricing.maintainRecommendation(size.size)
    }

    return {
      size: size.size,
      occupancy: size.occupancyRate,
      recommendation,
      type,
    }
  })
}

// =============================================================================
// CUSTOMER ANALYTICS
// =============================================================================

/**
 * Transforms monthly metrics into customer trend data
 * @param monthlyData - Array of monthly metrics
 * @returns Array of customer trend data with net growth calculated
 */
export function transformToCustomerTrendData(
  monthlyData: MonthlyMetrics[]
): CustomerTrendData[] {
  return monthlyData.map((m) => ({
    month: m.month,
    newCustomers: m.newCustomers,
    churnedCustomers: m.churnedCustomers,
    netGrowth: m.newCustomers - m.churnedCustomers,
  }))
}

/**
 * Gets top customers by monthly revenue
 * @param customers - Array of all customers
 * @param units - Array of all units
 * @param limit - Maximum number of customers to return (default 10)
 * @returns Array of top customers with unit count and monthly revenue
 */
export function getTopCustomersByRevenue(
  customers: Customer[],
  units: Unit[],
  limit: number = 10
): TopCustomer[] {
  const activeCustomers = customers.filter((c) => !c.endDate)

  return activeCustomers
    .map((customer) => {
      const customerUnits = units.filter((u) => u.customerId === customer.id)
      const monthlyRevenue = customerUnits.reduce((sum, u) => sum + u.pricePerMonth, 0)
      return {
        ...customer,
        unitsCount: customerUnits.length,
        monthlyRevenue,
      }
    })
    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
    .slice(0, limit)
}

/**
 * Translates customer segment type to localized label
 * @param type - Customer type ('private' | 'business')
 * @returns Localized label
 */
export function getCustomerTypeLabel(type: 'private' | 'business'): string {
  return LABELS.customerType[type]
}

// =============================================================================
// FORECAST ANALYTICS
// =============================================================================

/**
 * Adds seasonal index to monthly metrics
 * @param monthlyData - Array of monthly metrics
 * @returns Array of monthly data with seasonal index added
 */
export function addSeasonalIndex(monthlyData: MonthlyMetrics[]): SeasonalData[] {
  return monthlyData.map((m, index) => ({
    ...m,
    seasonalIndex: calculateSeasonalIndex(index),
  }))
}

/**
 * Generates forecast data with confidence intervals
 * @param monthlyData - Historical monthly metrics
 * @returns Array of forecast data points including historical and projected values
 */
export function generateForecastData(
  monthlyData: MonthlyMetrics[]
): ForecastDataPoint[] {
  const result: ForecastDataPoint[] = []

  // Add historical data
  monthlyData.forEach((m) => {
    result.push({
      month: m.month,
      actual: m.revenue,
    })
  })

  // Get last month's revenue for projection base
  const lastRevenue = monthlyData[monthlyData.length - 1]?.revenue || 0
  const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
  const lastMonthIndex = monthNames.indexOf(monthlyData[monthlyData.length - 1]?.month || 'Dez')

  // Generate forecast for configured number of months
  for (let i = 1; i <= FORECAST_CONFIG.monthsToForecast; i++) {
    const forecastValue = calculateForecastValue(lastRevenue, i)
    const { lowerBound, upperBound } = calculateConfidenceInterval(forecastValue)
    const monthIndex = (lastMonthIndex + i) % 12

    result.push({
      month: monthNames[monthIndex],
      forecast: Math.round(forecastValue),
      lowerBound: Math.round(lowerBound),
      upperBound: Math.round(upperBound),
    })
  }

  return result
}

/**
 * Calculates total forecasted revenue
 * @param forecastData - Array of forecast data points
 * @returns Total forecasted revenue (excluding historical data)
 */
export function calculateTotalForecast(forecastData: ForecastDataPoint[]): number {
  return forecastData
    .filter((d) => d.forecast !== undefined)
    .reduce((sum, d) => sum + (d.forecast || 0), 0)
}

/**
 * Finds the month where forecast starts
 * @param forecastData - Array of forecast data points
 * @returns Month name where forecast begins, or undefined
 */
export function findForecastStartMonth(
  forecastData: ForecastDataPoint[]
): string | undefined {
  return forecastData.find((d) => d.forecast !== undefined)?.month
}

// =============================================================================
// TABLE ANALYTICS
// =============================================================================

/**
 * Compares a unit's revenue to the average and returns status
 * @param revenuePerSqm - Unit's revenue per square meter
 * @param allUnits - All unit size metrics for average calculation
 * @returns 'above' | 'below' | 'equal'
 */
export function compareUnitRevenueToAverage(
  revenuePerSqm: number,
  allUnits: UnitSizeMetrics[]
): 'above' | 'below' | 'equal' {
  const avgRevenuePerSqm = calculateAverage(allUnits.map((u) => u.revenuePerSqm))
  return compareToAverage(revenuePerSqm, avgRevenuePerSqm)
}

/**
 * Gets the trend label based on comparison result
 * @param comparison - Result of compareToAverage
 * @returns Localized trend label
 */
export function getTrendLabel(comparison: 'above' | 'below' | 'equal'): string {
  if (comparison === 'above') return LABELS.trend.aboveAverage
  return LABELS.trend.belowAverage
}
