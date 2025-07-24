'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import { cn } from '@/lib/utils';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

interface LanguageDropdownProps {
  className?: string;
}

export function LanguageDropdown({ className }: LanguageDropdownProps) {
  const { state, setLanguage } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === state.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Select language"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span>{currentLanguage.code.toUpperCase()}</span>
        <svg
          className={cn(
            'w-4 h-4 transition-transform',
            isOpen ? 'rotate-180' : ''
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3',
                    state.language === language.code 
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200' 
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span>{language.name}</span>
                  {state.language === language.code && (
                    <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
