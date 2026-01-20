/**
 * Query Keys
 * 
 * Centralized query key management for React Query.
 * This provides type safety and makes cache management easier.
 * 
 * Query keys are hierarchical arrays that represent the data being fetched.
 * Example: ['dashboard', 'summary'] represents the dashboard summary data.
 */

/**
 * Dashboard query keys
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
} as const

/**
 * Customer query keys
 */
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: () => [...customerKeys.lists()] as const,
  segments: () => [...customerKeys.all, 'segments'] as const,
} as const

/**
 * Metrics query keys
 */
export const metricsKeys = {
  all: ['metrics'] as const,
  monthly: () => [...metricsKeys.all, 'monthly'] as const,
} as const

/**
 * Unit query keys
 */
export const unitKeys = {
  all: ['units'] as const,
  lists: () => [...unitKeys.all, 'list'] as const,
  list: () => [...unitKeys.lists()] as const,
  metrics: () => [...unitKeys.all, 'metrics'] as const,
} as const

/**
 * Forecast query keys
 */
export const forecastKeys = {
  all: ['forecast'] as const,
  data: () => [...forecastKeys.all, 'data'] as const,
  alerts: () => [...forecastKeys.all, 'alerts'] as const,
} as const

/**
 * Auth query keys
 */
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
} as const
