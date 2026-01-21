import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Re-export new formatting utilities with different names
export {
  formatDate as formatDateWithLocale,
  formatCurrency as formatCurrencyWithLocale,
  formatPercent as formatPercentWithLocale,
  formatNumber as formatNumberWithLocale,
  useFormatting,
  getLocaleFromLanguage,
  getDateFormatOptions,
} from './formatUtils'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Legacy functions for backward compatibility
// These use hardcoded German locale - should be replaced with useFormatting hook
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('de-DE').format(value)
}
