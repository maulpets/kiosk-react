'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/store/AppContext';
import { LanguageDropdown } from '@/components/ui/LanguageDropdown';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { state, setUser } = useAppContext();
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

  // Don't show header on setup and login pages
  if (pathname === ROUTES.SETUP || pathname === ROUTES.LOGIN) {
    return null;
  }

  // Format date and time
  const dayOfWeek = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDate = currentTime.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric' 
  });
  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <header className={cn(
      'bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700',
      className
    )}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Language Dropdown */}
          <div className="flex items-center">
            <LanguageDropdown />
          </div>
          
          {/* Center: Date and Time */}
          <div className="text-center">
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              {dayOfWeek}, {monthDate}
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {timeString}
            </div>
          </div>
          
          {/* Right: Logout Button */}
          <div className="flex items-center">
            {state.user && (
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
