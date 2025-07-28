'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';
import type { Locale } from '@/lib/i18n/types';

export default function I18nTestPage() {
  const { t, locale, changeLanguage, formatDate } = useI18n();
  
  const testDate = new Date();
  const languages: { code: Locale; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Internationalization Test Page
        </h1>
        
        {/* Language Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Current Language: {locale}
          </h2>
          <div className="flex gap-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  locale === lang.code
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Translation Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Common Translations */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Common Translations
            </h3>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {t('common.loading')}</p>
              <p><strong>Error:</strong> {t('common.error')}</p>
              <p><strong>Cancel:</strong> {t('common.cancel')}</p>
              <p><strong>Confirm:</strong> {t('common.confirm')}</p>
              <p><strong>Welcome:</strong> {t('common.welcome')}</p>
              <p><strong>Logout:</strong> {t('common.logout')}</p>
            </div>
          </div>

          {/* Setup Translations */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Setup Translations
            </h3>
            <div className="space-y-2">
              <p><strong>Title:</strong> {t('setup.title')}</p>
              <p><strong>Subtitle:</strong> {t('setup.subtitle')}</p>
              <p><strong>Organization Label:</strong> {t('setup.organizationLabel')}</p>
              <p><strong>Setup Button:</strong> {t('setup.setupButton')}</p>
            </div>
          </div>

          {/* Operations Translations */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Operations Translations
            </h3>
            <div className="space-y-2">
              <p><strong>Punch In:</strong> {t('operations.punchIn')}</p>
              <p><strong>Punch Out:</strong> {t('operations.punchOut')}</p>
              <p><strong>Transfer:</strong> {t('operations.transfer')}</p>
              <p><strong>View Timecard:</strong> {t('operations.viewTimecard')}</p>
            </div>
          </div>

          {/* Date/Time Formatting */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Date/Time Formatting
            </h3>
            <div className="space-y-2">
              <p><strong>Date:</strong> {formatDate(testDate, 'date')}</p>
              <p><strong>Time:</strong> {formatDate(testDate, 'time')}</p>
              <p><strong>DateTime:</strong> {formatDate(testDate, 'datetime')}</p>
            </div>
          </div>
        </div>

        {/* Variable Interpolation Example */}
        <div className="mt-8 bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Variable Interpolation
          </h3>
          <div className="space-y-2">
            <p>
              <strong>Search Placeholder:</strong> {t('transfer.searchPlaceholder', ['locations'])}
            </p>
            <p>
              <strong>No Results:</strong> {t('transfer.noResults', ['locations', 'office'])}
            </p>
            <p>
              <strong>Confirm Punch:</strong> {t('punch.confirmTitle', ['Punch In'])}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            {t('common.back')} to App
          </Link>
        </div>
      </div>
    </div>
  );
}
