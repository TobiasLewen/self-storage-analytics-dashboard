/**
 * Metrics Utility Functions
 * Common calculations and business logic for analytics metrics
 */

import {
  OCCUPANCY_THRESHOLDS,
  PRICING_THRESHOLDS,
  PRICING_MULTIPLIERS,
  FORECAST_CONFIG,
} from '@/constants'

// =============================================================================
// OCCUPANCY CALCULATIONS
// =============================================================================

/**
 * Determines the occupancy status based on the occupancy rate
 * @param occupancyRate - The occupancy rate as a percentage (0-100)
 * @returns 'high' | 'medium' | 'low' based on threshold values
 * @example
 * getOccupancyStatus(90) // returns 'high'
 * getOccupancyStatus(75) // returns 'medium'
 * getOccupancyStatus(60) // returns 'low'
 */
export function getOccupancyStatus(
  occupancyRate: number
): 'high' | 'medium' | 'low' {
  if (occupancyRate >= OCCUPANCY_THRESHOLDS.high) return 'high'
  if (occupancyRate >= OCCUPANCY_THRESHOLDS.medium) return 'medium'
  return 'low'
}

/**
 * Calculates occupancy rate from occupied and total units
 * @param occupiedUnits - Number of occupied units
 * @param totalUnits - Total number of units
 * @returns Occupancy rate as a percentage (0-100)
 * @example
 * calculateOccupancyRate(85, 100) // returns 85
 */
export function calculateOccupancyRate(
  occupiedUnits: number,
  totalUnits: number
): number {
  if (totalUnits === 0) return 0
  return (occupiedUnits / totalUnits) * 100
}

// =============================================================================
// REVENUE CALCULATIONS
// =============================================================================

/**
 * Calculates revenue per square meter
 * @param totalRevenue - Total revenue amount
 * @param totalSquareMeters - Total square meters
 * @returns Revenue per square meter
 * @example
 * calculateRevenuePerSqm(10000, 500) // returns 20
 */
export function calculateRevenuePerSqm(
  totalRevenue: number,
  totalSquareMeters: number
): number {
  if (totalSquareMeters === 0) return 0
  return totalRevenue / totalSquareMeters
}

/**
 * Calculates the average value from an array of numbers
 * @param values - Array of numeric values
 * @returns Average value, or 0 if array is empty
 * @example
 * calculateAverage([10, 20, 30]) // returns 20
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

/**
 * Calculates percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change (positive or negative)
 * @example
 * calculatePercentageChange(110, 100) // returns 10
 * calculatePercentageChange(90, 100) // returns -10
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// =============================================================================
// PRICING CALCULATIONS
// =============================================================================

export type PricingRecommendationType = 'increase' | 'decrease' | 'maintain'

/**
 * Determines pricing recommendation based on occupancy rate
 * @param occupancyRate - Current occupancy rate as percentage
 * @returns Recommendation type: 'increase', 'decrease', or 'maintain'
 * @example
 * getPricingRecommendation(95) // returns 'increase'
 * getPricingRecommendation(65) // returns 'decrease'
 * getPricingRecommendation(80) // returns 'maintain'
 */
export function getPricingRecommendation(
  occupancyRate: number
): PricingRecommendationType {
  if (occupancyRate > PRICING_THRESHOLDS.increaseOpportunity) return 'increase'
  if (occupancyRate < PRICING_THRESHOLDS.decreaseNeeded) return 'decrease'
  return 'maintain'
}

/**
 * Checks if a unit is underpriced compared to market average
 * @param unitPrice - Current unit price
 * @param marketAverage - Market average price
 * @returns True if unit is underpriced
 */
export function isUnderpriced(unitPrice: number, marketAverage: number): boolean {
  return unitPrice < marketAverage * PRICING_MULTIPLIERS.underpricedThreshold
}

/**
 * Checks if underpricing is high priority (significantly below market)
 * @param unitPrice - Current unit price
 * @param marketAverage - Market average price
 * @returns True if underpricing is high priority
 */
export function isHighPriorityUnderpriced(
  unitPrice: number,
  marketAverage: number
): boolean {
  return unitPrice < marketAverage * PRICING_MULTIPLIERS.highPriorityThreshold
}

/**
 * Checks if a unit is overpriced compared to market average
 * @param unitPrice - Current unit price
 * @param marketAverage - Market average price
 * @returns True if unit is overpriced
 */
export function isOverpriced(unitPrice: number, marketAverage: number): boolean {
  return unitPrice > marketAverage * PRICING_MULTIPLIERS.overpricedThreshold
}

/**
 * Calculates suggested price based on market average
 * @param marketAverage - Market average price
 * @returns Suggested price (rounded)
 */
export function calculateSuggestedPrice(marketAverage: number): number {
  return Math.round(marketAverage * PRICING_MULTIPLIERS.suggestedPriceMultiplier)
}

// =============================================================================
// FORECAST CALCULATIONS
// =============================================================================

/**
 * Calculates forecast value with growth rate
 * @param baseValue - Starting value
 * @param monthsAhead - Number of months to forecast
 * @returns Projected value
 * @example
 * calculateForecastValue(1000, 3) // returns ~1061.21 (with 2% monthly growth)
 */
export function calculateForecastValue(
  baseValue: number,
  monthsAhead: number
): number {
  return baseValue * Math.pow(FORECAST_CONFIG.monthlyGrowthRate, monthsAhead)
}

/**
 * Calculates confidence interval bounds for a forecast value
 * @param forecastValue - The forecasted value
 * @returns Object with lowerBound and upperBound
 * @example
 * calculateConfidenceInterval(1000) // returns { lowerBound: 920, upperBound: 1080 }
 */
export function calculateConfidenceInterval(forecastValue: number): {
  lowerBound: number
  upperBound: number
} {
  return {
    lowerBound: forecastValue * FORECAST_CONFIG.lowerBoundMultiplier,
    upperBound: forecastValue * FORECAST_CONFIG.upperBoundMultiplier,
  }
}

/**
 * Calculates seasonal index using sine wave pattern
 * @param monthIndex - Month index (0-11)
 * @param amplitude - Amplitude of seasonal variation (default 0.1 = 10%)
 * @param phaseShift - Phase shift in months (default 2)
 * @returns Seasonal index (1.0 = baseline, >1 = high season, <1 = low season)
 * @example
 * calculateSeasonalIndex(6, 0.1, 2) // returns ~1.0 (near baseline in summer)
 */
export function calculateSeasonalIndex(
  monthIndex: number,
  amplitude: number = 0.1,
  phaseShift: number = 2
): number {
  return 1 + Math.sin((monthIndex - phaseShift) * Math.PI / 6) * amplitude
}

// =============================================================================
// CUSTOMER METRICS
// =============================================================================

/**
 * Calculates customer turnover rate
 * @param newCustomers - Number of new customers
 * @param churnedCustomers - Number of churned customers
 * @param totalOccupiedUnits - Total number of occupied units
 * @returns Turnover rate as percentage
 * @example
 * calculateTurnoverRate(10, 5, 100) // returns 15
 */
export function calculateTurnoverRate(
  newCustomers: number,
  churnedCustomers: number,
  totalOccupiedUnits: number
): number {
  if (totalOccupiedUnits === 0) return 0
  return ((newCustomers + churnedCustomers) / totalOccupiedUnits) * 100
}

/**
 * Calculates net customer growth
 * @param newCustomers - Number of new customers
 * @param churnedCustomers - Number of churned customers
 * @returns Net growth (can be negative)
 */
export function calculateNetGrowth(
  newCustomers: number,
  churnedCustomers: number
): number {
  return newCustomers - churnedCustomers
}

/**
 * Determines if a value is above or below average
 * @param value - Value to check
 * @param average - Average value to compare against
 * @returns 'above' | 'below' | 'equal'
 */
export function compareToAverage(
  value: number,
  average: number
): 'above' | 'below' | 'equal' {
  if (value > average) return 'above'
  if (value < average) return 'below'
  return 'equal'
}
