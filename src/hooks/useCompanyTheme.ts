import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useAppContext } from '@/store/AppContext';
import { CompanyData } from '@/types';

export function useCompanyTheme(overrideTheme?: {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  darkMode?: 'light' | 'dark' | 'auto';
}) {
  const { state } = useAppContext();
  const { companyData } = state;
  const { theme, setTheme } = useTheme();
  
  // Track if we've already applied the initial company theme
  const hasAppliedInitialTheme = useRef(false);

  // Apply company theme when data changes or override theme is provided
  useEffect(() => {
    const themeToUse = overrideTheme || companyData?.theme;
    
    if (themeToUse) {
      // Apply CSS custom properties (always update these as they don't interfere with user preference)
      if (themeToUse.primaryColor) {
        document.documentElement.style.setProperty('--company-primary', themeToUse.primaryColor);
      }
      if (themeToUse.secondaryColor) {
        document.documentElement.style.setProperty('--company-secondary', themeToUse.secondaryColor);
      }
      if (themeToUse.accentColor) {
        document.documentElement.style.setProperty('--company-accent', themeToUse.accentColor);
      }
      if (themeToUse.fontFamily) {
        document.documentElement.style.setProperty('--company-font-family', themeToUse.fontFamily);
      }

      // Only apply dark mode preference once when company data is first loaded
      // Allow user to override after that
      if (!hasAppliedInitialTheme.current && themeToUse.darkMode) {
        if (themeToUse.darkMode === 'dark') {
          setTheme('dark');
        } else if (themeToUse.darkMode === 'light') {
          setTheme('light');
        } else if (themeToUse.darkMode === 'auto') {
          setTheme('system');
        }
        hasAppliedInitialTheme.current = true;
      }
    }
  }, [companyData, setTheme, overrideTheme]);

  // Load company data from localStorage on mount
  useEffect(() => {
    const storedCompanyData = localStorage.getItem('companyData');
    if (storedCompanyData && !companyData) {
      try {
        const parsedData: CompanyData = JSON.parse(storedCompanyData);
        // This would require adding the action to context, but for now we'll apply directly
        if (parsedData.theme) {
          const { theme: companyTheme } = parsedData;
          if (companyTheme.primaryColor) {
            document.documentElement.style.setProperty('--company-primary', companyTheme.primaryColor);
          }
          if (companyTheme.secondaryColor) {
            document.documentElement.style.setProperty('--company-secondary', companyTheme.secondaryColor);
          }
          if (companyTheme.accentColor) {
            document.documentElement.style.setProperty('--company-accent', companyTheme.accentColor);
          }
          if (companyTheme.fontFamily) {
            document.documentElement.style.setProperty('--company-font-family', companyTheme.fontFamily);
          }

          // Only apply dark mode preference on initial load, not on every render
          // This allows users to manually change theme after company setup
          if (!hasAppliedInitialTheme.current && companyTheme.darkMode) {
            if (companyTheme.darkMode === 'dark') {
              setTheme('dark');
            } else if (companyTheme.darkMode === 'light') {
              setTheme('light');
            } else if (companyTheme.darkMode === 'auto') {
              setTheme('system');
            }
            hasAppliedInitialTheme.current = true;
          }
        }
      } catch (error) {
        console.error('Failed to parse stored company data:', error);
        localStorage.removeItem('companyData');
      }
    }
  }, [companyData, setTheme]);

  return {
    companyData,
    isThemed: !!companyData?.theme,
    currentTheme: theme,
  };
}
