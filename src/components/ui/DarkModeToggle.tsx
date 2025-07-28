'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug theme changes
  useEffect(() => {
    console.log('Current theme value:', theme);
    console.log('Document classes:', document.documentElement.className);
  }, [theme]);

  // Render loading state on server and during hydration
  if (!mounted) {
    return (
      <div className="p-2 rounded-lg bg-muted w-9 h-9" />
    );
  }

  const themes = [
    {
      value: 'light',
      label: 'Light',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ),
    },
    {
      value: 'system',
      label: 'System',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  // Handle the case where theme might be undefined (system default)
  const currentThemeValue = theme || 'system';
  const currentTheme = themes.find(t => t.value === currentThemeValue) || themes[2]; // Default to system

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        {currentTheme.icon}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-32 bg-popover rounded-md shadow-lg border border-border z-50">
            <div className="py-1">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    console.log('Theme button clicked:', themeOption.value);
                    console.log('Current theme before change:', theme);
                    setTheme(themeOption.value);
                    console.log('setTheme called with:', themeOption.value);
                    setIsOpen(false);
                    
                    // Force a check after a short delay
                    setTimeout(() => {
                      console.log('Theme after change:', document.documentElement.className);
                    }, 100);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center space-x-2 cursor-pointer',
                    currentThemeValue === themeOption.value
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-popover-foreground'
                  )}
                >
                  {themeOption.icon}
                  <span>{themeOption.label}</span>
                  {currentThemeValue === themeOption.value && (
                    <span className="ml-auto text-primary">✓</span>
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