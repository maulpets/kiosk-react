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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">
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
      'bg-background',
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
      'bg-card border border-border rounded-lg shadow-sm',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}
