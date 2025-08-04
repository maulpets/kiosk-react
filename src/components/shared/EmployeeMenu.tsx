'use client';

import { useRouter } from 'next/navigation';
import { useAppContext } from '@/store/AppContext';

export function EmployeeMenu() {
  const router = useRouter();
  const { state } = useAppContext();

  const employee = state.user;

  if (!employee) return null;

  return (
    <div className="bg-card border-b border-border px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between max-w-full">
        {/* Employee Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-company-primary to-company-accent rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {employee.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0">
            <div className="font-medium text-foreground text-sm truncate">
              {employee.name || 'Employee'}
            </div>
            <div className="text-xs text-muted-foreground">
              ID: {employee.id}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 text-foreground rounded-md transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push('/timecard')}
            className="px-3 py-1.5 text-sm bg-company-primary hover:bg-company-primary/90 text-white rounded-md transition-colors"
          >
            Time Card
          </button>
          <button
            onClick={() => {
              // Handle logout
              router.push('/login');
            }}
            className="px-3 py-1.5 text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
