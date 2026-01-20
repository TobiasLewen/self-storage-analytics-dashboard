/**
 * Application Constants
 * Centralized configuration for thresholds, colors, and other magic values
 */

// =============================================================================
// CHART COLORS
// =============================================================================

/** Primary color palette for charts and visualizations */
export const CHART_COLORS = {
  primary: '#3b82f6',    // Blue
  success: '#22c55e',    // Green
  warning: '#f59e0b',    // Amber
  danger: '#ef4444',     // Red
  purple: '#8b5cf6',     // Purple
} as const

/** Ordered array of colors for multi-series charts */
export const CHART_COLOR_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  CHART_COLORS.purple,
] as const

/** Colors for customer analytics (new vs churned) */
export const CUSTOMER_TREND_COLORS = {
  newCustomers: CHART_COLORS.success,
  churnedCustomers: CHART_COLORS.danger,
} as const

/** Colors for customer segmentation pie chart */
export const CUSTOMER_SEGMENT_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.success,
] as const

// =============================================================================
// PDF REPORT COLORS
// =============================================================================

export const PDF_COLORS = {
  primary: '#3b82f6',
  text: {
    dark: '#1e293b',
    muted: '#64748b',
    light: '#94a3b8',
  },
  background: {
    light: '#f8fafc',
    white: '#ffffff',
    lightBlue: '#eff6ff',
  },
  border: '#e2e8f0',
  positive: '#16a34a',
  negative: '#dc2626',
  darkBlue: '#1e40af',
  slate: '#334155',
} as const

// =============================================================================
// OCCUPANCY THRESHOLDS
// =============================================================================

/** Occupancy rate thresholds for status indicators */
export const OCCUPANCY_THRESHOLDS = {
  /** Above this is considered high/good occupancy (green) */
  high: 85,
  /** Above this is considered medium occupancy (yellow) */
  medium: 70,
  /** Below medium is considered low occupancy (red) */
} as const

/** Occupancy thresholds for pricing recommendations */
export const PRICING_THRESHOLDS = {
  /** Above this occupancy suggests price increase opportunity */
  increaseOpportunity: 90,
  /** Below this occupancy suggests price decrease needed */
  decreaseNeeded: 70,
} as const

// =============================================================================
// PRICING MULTIPLIERS
// =============================================================================

/** Multipliers used for pricing calculations */
export const PRICING_MULTIPLIERS = {
  /** Units priced below this % of market avg are underpriced */
  underpricedThreshold: 0.85,
  /** High priority if below this % of market avg */
  highPriorityThreshold: 0.75,
  /** Units priced above this % of market avg are overpriced */
  overpricedThreshold: 1.10,
  /** Suggested price as % of market avg */
  suggestedPriceMultiplier: 0.95,
} as const

// =============================================================================
// FORECAST CONFIGURATION
// =============================================================================

export const FORECAST_CONFIG = {
  /** Number of months to forecast */
  monthsToForecast: 3,
  /** Assumed monthly growth rate (2%) */
  monthlyGrowthRate: 1.02,
  /** Lower bound multiplier for confidence interval */
  lowerBoundMultiplier: 0.92,
  /** Upper bound multiplier for confidence interval */
  upperBoundMultiplier: 1.08,
} as const

// =============================================================================
// UNIT SIZE CONFIGURATION
// =============================================================================

export interface UnitSizeConfig {
  count: number
  basePrice: number
  sqm: number
}

/** Unit size configurations with count, base price, and square meters */
export const UNIT_SIZES: Record<string, UnitSizeConfig> = {
  '5m²': { count: 40, basePrice: 49, sqm: 5 },
  '10m²': { count: 35, basePrice: 89, sqm: 10 },
  '15m²': { count: 25, basePrice: 129, sqm: 15 },
  '20m²': { count: 15, basePrice: 169, sqm: 20 },
  '30m²': { count: 10, basePrice: 239, sqm: 30 },
} as const

/** Target occupancy rates by unit size */
export const TARGET_OCCUPANCY_RATES: Record<string, number> = {
  '5m²': 0.92,
  '10m²': 0.88,
  '15m²': 0.82,
  '20m²': 0.75,
  '30m²': 0.65,
} as const

// =============================================================================
// CHART DIMENSIONS
// =============================================================================

export const CHART_DIMENSIONS = {
  /** Default chart height */
  default: 300,
  /** Large chart height (e.g., forecast) */
  large: 350,
  /** Small chart height */
  small: 250,
  /** Compact chart height */
  compact: 280,
} as const

/** Y-axis domain configurations */
export const Y_AXIS_DOMAINS = {
  /** Percentage (0-100) */
  percentage: [0, 100] as [number, number],
  /** Occupancy trend (70-100) */
  occupancyTrend: [70, 100] as [number, number],
  /** Seasonal index (85%-115%) */
  seasonalIndex: [0.85, 1.15] as [number, number],
} as const

// =============================================================================
// MOCK DATA CONFIGURATION
// =============================================================================

export const MOCK_DATA_CONFIG = {
  /** Total number of customers to generate */
  totalCustomers: 85,
  /** Probability a customer is active */
  activeCustomerProbability: 0.88,
  /** Probability a customer is business (vs private) */
  businessCustomerProbability: 0.35,
  /** Base occupancy range start */
  baseOccupancyMin: 82,
  /** Base occupancy range (added to min) */
  baseOccupancyRange: 8,
  /** Maximum occupancy cap */
  maxOccupancyCap: 95,
  /** New customers range per month */
  newCustomersRange: { min: 5, max: 15 },
  /** Churned customers range per month */
  churnedCustomersRange: { min: 2, max: 8 },
  /** Average monthly revenue per private customer */
  avgRevenuePerPrivateCustomer: 95,
  /** Average monthly revenue per business customer */
  avgRevenuePerBusinessCustomer: 145,
  /** Max pricing alerts to show */
  maxPricingAlerts: 8,
} as const

// =============================================================================
// UI LABELS (German)
// =============================================================================

export const LABELS = {
  chart: {
    occupancy: 'Belegung',
    revenue: 'Umsatz',
    occupied: 'Belegt',
    available: 'Verfügbar',
    newCustomers: 'Neue Kunden',
    churnedCustomers: 'Abgegangen',
    seasonalIndex: 'Saisonindex',
    actual: 'Ist-Umsatz',
    forecast: 'Prognose',
    upperBound: 'Obere Grenze',
    lowerBound: 'Untere Grenze',
  },
  customerType: {
    private: 'Privat',
    business: 'Geschäft',
  },
  trend: {
    aboveAverage: 'Über Ø',
    belowAverage: 'Unter Ø',
  },
  pricing: {
    increaseRecommendation: (size: string) =>
      `Preiserhöhung um 5-10% möglich bei ${size} Einheiten`,
    decreaseRecommendation: (size: string) =>
      `Preissenkung um 5% empfohlen für ${size} Einheiten`,
    maintainRecommendation: (size: string) =>
      `Preise für ${size} Einheiten beibehalten`,
  },
  priority: {
    high: 'Hoch',
    medium: 'Mittel',
    low: 'Niedrig',
  },
} as const

// =============================================================================
// PDF REPORT DIMENSIONS
// =============================================================================

export const PDF_DIMENSIONS = {
  page: {
    padding: 40,
    fontSize: 10,
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    logoFontSize: 24,
    subtitleFontSize: 14,
    titleFontSize: 18,
    dateFontSize: 10,
  },
  section: {
    marginBottom: 25,
    titleFontSize: 14,
    titlePaddingBottom: 5,
  },
  kpiCard: {
    width: '48%',
    padding: 12,
    marginBottom: 10,
    labelFontSize: 9,
    labelMarginBottom: 4,
    valueFontSize: 16,
    changeFontSize: 9,
  },
  table: {
    headerPadding: 8,
    headerBorderRadius: 4,
    headerCellFontSize: 9,
    rowPadding: 8,
    cellFontSize: 9,
  },
  summary: {
    padding: 15,
    borderRadius: 6,
    titleFontSize: 11,
    titleMarginBottom: 8,
    textFontSize: 10,
    lineHeight: 1.5,
  },
  footer: {
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 10,
    fontSize: 8,
  },
  twoColumnGap: 20,
} as const
