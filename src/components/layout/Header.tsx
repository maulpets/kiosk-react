'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/store/AppContext';
import { useI18n } from '@/hooks/useI18n';
import { LanguageDropdown } from '@/components/ui/LanguageDropdown';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { state, setUser } = useAppContext();
  const { t, formatDate } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    setUser(null);
    router.push(ROUTES.LOGIN);
  };

  // Don't show header on setup page
  if (pathname === ROUTES.SETUP) {
    return null;
  }

  // Format date and time using i18n
  const formattedDate = formatDate(currentTime, 'date');
  const formattedTime = formatDate(currentTime, 'time');

  return (
    <header className={cn(
      'bg-card border-b border-border flex-shrink-0 shadow-sm',
      className
    )}>
      <div className="w-full max-w-full px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Left: Language Dropdown (and Dark Mode Toggle on non-login pages) */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <LanguageDropdown />
            {pathname !== ROUTES.LOGIN && <DarkModeToggle />}
          </div>
          
          {/* Center: Date and Time */}
          <div className="text-center flex-1 min-w-0 mx-4">
            <div className="text-sm md:text-lg font-medium text-foreground">
              {formattedDate}
            </div>
            <div className="text-xl md:text-3xl font-bold text-primary mt-1">
              {formattedTime}
            </div>
          </div>
          
          {/* Right: Logout Button (and Dark Mode Toggle on login page) */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {pathname === ROUTES.LOGIN && <DarkModeToggle />}
            {state.user && pathname !== ROUTES.LOGIN && (
              <button
                onClick={handleLogout}
                className="px-3 py-2 md:px-6 md:py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 transition-colors text-sm md:text-base"
              >
                {t('common.logout')}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
