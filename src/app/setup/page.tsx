'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/store/AppContext';
import { useWebViewBridge } from '@/hooks/useWebViewBridge';
import { useCompanyDataSync } from '@/hooks/useCompanyDataSync';
import { useI18n } from '@/hooks/useI18n';
import { ROUTES } from '@/constants';
import { CompanySetupResponse } from '@/types';

export default function Setup() {
  const router = useRouter();
  const { setSetupComplete, setCompanyData, setLanguage, state } = useAppContext();
  const { sendToNative, isConnected } = useWebViewBridge();
  const { syncToNative } = useCompanyDataSync({ companyData: state.companyData });
  const { t } = useI18n();
  
  const [organizationName, setOrganizationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationName.trim()) {
      setError(t('setup.organizationLabel') + ' is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Call company setup API
      const response = await fetch('/api/company-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: organizationName.trim()
        }),
      });

      const data: CompanySetupResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to setup company');
      }

      // Store company data in app context
      setCompanyData(data.company);
      
      // Set the default language from company config
      setLanguage(data.company.defaultLanguage);

      // Sync to native app
      syncToNative(data.company);

      // Apply theme to document
      const { theme } = data.company;
      if (theme) {
        if (theme.primaryColor) {
          document.documentElement.style.setProperty('--color-company-primary', theme.primaryColor);
        }
        if (theme.secondaryColor) {
          document.documentElement.style.setProperty('--color-company-secondary', theme.secondaryColor);
        }
        if (theme.accentColor) {
          document.documentElement.style.setProperty('--color-company-accent', theme.accentColor);
        }
        if (theme.fontFamily) {
          document.documentElement.style.setProperty('--color-company-font-family', theme.fontFamily);
        }
      }

      // Dark mode is now handled by the useCompanyTheme hook and next-themes

      // Send setup data to native app if connected
      if (isConnected) {
        sendToNative('COMPANY_SETUP_COMPLETE', { 
          companyData: data.company,
          timestamp: Date.now()
        });
      }

      // Store in localStorage for persistence
      localStorage.setItem('companyData', JSON.stringify(data.company));

      // Mark setup as complete
      setSetupComplete(true);
      
      // Redirect to login
      router.push(ROUTES.LOGIN);
    } catch (error) {
      console.error('Setup failed:', error);
      setError(error instanceof Error ? error.message : 'Setup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-2xl shadow-xl p-8">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-company-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">🏢</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t('setup.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('setup.subtitle')}
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              {t('setup.examples')}
            </div>
          </div>

          {/* Setup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="organizationName" 
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t('setup.organizationLabel')}
              </label>
              <input
                type="text"
                id="organizationName"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder={t('setup.organizationPlaceholder')}
                className="w-full px-4 py-3 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-company-accent focus:border-company-accent bg-background text-foreground placeholder:text-muted-foreground"
                required
                disabled={isSubmitting}
              />
              {error && (
                <p className="mt-2 text-sm text-destructive">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !organizationName.trim()}
              className="w-full bg-company-accent text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-company-accent focus:ring-offset-2 disabled:bg-muted disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  {t('setup.setupProgress')}
                </div>
              ) : (
                t('setup.setupButton')
              )}
            </button>
          </form>

          {/* Connection Status */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-muted'
              }`} />
              <span className="text-muted-foreground">
                {isConnected ? t('setup.connectionStatus.connected') : t('setup.connectionStatus.standalone')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
