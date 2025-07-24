'use client';

import React from 'react';
import { useAppContext } from '@/store/AppContext';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center space-x-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

interface PageLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, header, className }: PageLayoutProps) {
  const { state } = useAppContext();
  
  return (
    <div className={cn(
      'min-h-screen transition-colors duration-200',
      state.theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50',
      className
    )}>
      {header}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}
