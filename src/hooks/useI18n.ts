import { useCallback } from 'react';
import { useAppContext } from '@/store/AppContext';
import { getTranslation, formatDateTime, formatNumber, detectBrowserLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/types';

/**
 * Hook for internationalization and localization
 * Provides translation functions and locale-aware formatting
 */
export function useI18n() {
  const { state, setLanguage } = useAppContext();
  const currentLocale = (state.language as Locale) || 'en';

  // Translation function with optional variable interpolation
  const t = useCallback((key: string, variables?: (string | number)[]): string => {
    return getTranslation(currentLocale, key, variables);
  }, [currentLocale]);

  // Format date/time according to current locale
  const formatDate = useCallback((
    date: Date | string,
    formatType: 'date' | 'time' | 'datetime' = 'datetime'
  ): string => {
    return formatDateTime(date, currentLocale, formatType);
  }, [currentLocale]);

  // Format numbers according to current locale
  const formatCurrency = useCallback((
    amount: number,
    currency = 'USD'
  ): string => {
    return formatNumber(amount, currentLocale, {
      style: 'currency',
      currency,
    });
  }, [currentLocale]);

  // Format percentages according to current locale
  const formatPercent = useCallback((
    value: number,
    decimals = 1
  ): string => {
    return formatNumber(value / 100, currentLocale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }, [currentLocale]);

  // Change language
  const changeLanguage = useCallback((newLocale: Locale) => {
    setLanguage(newLocale);
  }, [setLanguage]);

  // Auto-detect and set browser locale if not already set
  const autoDetectLocale = useCallback(() => {
    if (!state.language) {
      const detectedLocale = detectBrowserLocale();
      setLanguage(detectedLocale);
      return detectedLocale;
    }
    return currentLocale;
  }, [state.language, setLanguage, currentLocale]);

  // Get locale-specific text direction (for future RTL support)
  const getTextDirection = useCallback((): 'ltr' | 'rtl' => {
    // Most languages are LTR, add RTL languages as needed
    const rtlLanguages: Locale[] = []; // Add 'ar', 'he', etc. when supported
    return rtlLanguages.includes(currentLocale) ? 'rtl' : 'ltr';
  }, [currentLocale]);

  // Get current locale information
  const getLocaleInfo = useCallback(() => {
    return {
      locale: currentLocale,
      direction: getTextDirection(),
      isRTL: getTextDirection() === 'rtl',
    };
  }, [currentLocale, getTextDirection]);

  return {
    // Current locale
    locale: currentLocale,
    
    // Translation function
    t,
    
    // Formatting functions
    formatDate,
    formatCurrency,
    formatPercent,
    
    // Language management
    changeLanguage,
    autoDetectLocale,
    
    // Locale information
    getLocaleInfo,
    getTextDirection,
    
    // Convenience properties
    isRTL: getTextDirection() === 'rtl',
    direction: getTextDirection(),
  };
}
