import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import type { Locale, TranslationKeys } from './types';

// Available translations
export const translations: Record<Locale, TranslationKeys> = {
  en,
  es,
  fr,
  // Add other languages as they become available
  de: en, // Fallback to English for now
  zh: en, // Fallback to English for now
  ja: en, // Fallback to English for now
};

// Get nested property from object using dot notation
function getNestedProperty(obj: TranslationKeys | Record<string, unknown>, path: string): string {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown) as string || path;
}

// Simple interpolation function for variables in strings
export function interpolate(text: string, variables: (string | number)[]): string {
  return text.replace(/\{(\d+)\}/g, (match, index) => {
    const variableIndex = parseInt(index, 10);
    return variables[variableIndex]?.toString() || match;
  });
}

// Get translation for a specific key
export function getTranslation(
  locale: Locale, 
  key: string, 
  variables?: (string | number)[]
): string {
  const translations_for_locale = translations[locale];
  
  if (!translations_for_locale) {
    console.warn(`Locale "${locale}" not found, falling back to English`);
    return getTranslation('en', key, variables);
  }

  const translation = getNestedProperty(translations_for_locale as unknown as Record<string, unknown>, key);
  
  if (translation === key) {
    console.warn(`Translation key "${key}" not found for locale "${locale}"`);
    
    // Fallback to English if current locale is not English
    if (locale !== 'en') {
      return getTranslation('en', key, variables);
    }
  }

  // Apply interpolation if variables are provided
  if (variables && variables.length > 0) {
    return interpolate(translation, variables);
  }

  return translation;
}

// Format date/time according to locale
export function formatDateTime(
  date: Date | string,
  locale: Locale,
  formatType: 'date' | 'time' | 'datetime' = 'datetime'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeStr = getLocaleString(locale);
  
  // Get format options from translations
  const formatOptions = translations[locale]?.time?.formats?.[formatType] || 
                       translations.en.time.formats[formatType];

  try {
    return dateObj.toLocaleString(localeStr, formatOptions);
  } catch (error) {
    console.warn(`Error formatting date for locale "${locale}":`, error);
    // Fallback to English formatting
    return dateObj.toLocaleString('en-US', translations.en.time.formats[formatType]);
  }
}

// Convert our locale code to a standard locale string
export function getLocaleString(locale: Locale): string {
  const localeMap: Record<Locale, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    zh: 'zh-CN',
    ja: 'ja-JP',
  };
  
  return localeMap[locale] || 'en-US';
}

// Format numbers according to locale
export function formatNumber(
  number: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  const localeStr = getLocaleString(locale);
  
  try {
    return new Intl.NumberFormat(localeStr, options).format(number);
  } catch (error) {
    console.warn(`Error formatting number for locale "${locale}":`, error);
    return new Intl.NumberFormat('en-US', options).format(number);
  }
}

// Detect browser locale and map to our supported locales
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'en'; // Default for SSR
  }

  const browserLocale = navigator.language.toLowerCase();
  
  // Map browser locales to our supported locales
  if (browserLocale.startsWith('es')) return 'es';
  if (browserLocale.startsWith('fr')) return 'fr';
  if (browserLocale.startsWith('de')) return 'de';
  if (browserLocale.startsWith('zh')) return 'zh';
  if (browserLocale.startsWith('ja')) return 'ja';
  
  return 'en'; // Default fallback
}
