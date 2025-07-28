'use client';

import { useCompanyTheme } from '@/hooks/useCompanyTheme';
import { ReactNode } from 'react';

interface ThemeLayoutProps {
  children: ReactNode;
}

export function ThemeLayout({ children }: ThemeLayoutProps) {
  // Initialize company theme
  useCompanyTheme();

  return (
    <div className="h-screen flex flex-col max-w-full overflow-hidden">
      {children}
    </div>
  );
}
