import { useSettings } from '@/contexts/SettingsContext';

/**
 * Map app language to BCP 47 language tags
 */
export function getLocaleFromLanguage(language: string): string {
  switch (language) {
    case 'de':
      return 'de-DE';
    case 'en':
      return 'en-US';
    default:
      return 'de-DE';
  }
}

/**
 * Map app date format to Intl.DateTimeFormat options
 */
export function getDateFormatOptions(dateFormat: string): Intl.DateTimeFormatOptions {
  switch (dateFormat) {
    case 'dd.MM.yyyy':
      return {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      };
    case 'MM/dd/yyyy':
      return {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      };
    case 'yyyy-MM-dd':
      return {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
    default:
      return {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      };
  }
}

/**
 * Format a date using the specified locale and date format
 */
export function formatDate(
  date: Date | string | number,
  locale: string = 'de-DE',
  dateFormat: string = 'dd.MM.yyyy'
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  // For yyyy-MM-dd format, manually format to ensure correct order
  if (dateFormat === 'yyyy-MM-dd') {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  const options = getDateFormatOptions(dateFormat);
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Format currency using the specified locale and currency
 */
export function formatCurrency(
  value: number,
  locale: string = 'de-DE',
  currency: string = 'EUR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format percentage using the specified locale
 */
export function formatPercent(
  value: number,
  locale: string = 'de-DE'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

/**
 * Format number using the specified locale
 */
export function formatNumber(
  value: number,
  locale: string = 'de-DE'
): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Hook to get formatting functions with current settings
 */
export function useFormatting() {
  const { settings } = useSettings();
  const locale = getLocaleFromLanguage(settings.language);

  return {
    formatDate: (date: Date | string | number) => 
      formatDate(date, locale, settings.dateFormat),
    formatCurrency: (value: number) => 
      formatCurrency(value, locale, settings.currencyFormat),
    formatPercent: (value: number) => 
      formatPercent(value, locale),
    formatNumber: (value: number) => 
      formatNumber(value, locale),
    locale,
    dateFormat: settings.dateFormat,
    currencyFormat: settings.currencyFormat,
  };
}
