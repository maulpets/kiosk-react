'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/store/AppContext';
import { ROUTES } from '@/constants';

export default function Home() {
  const { state } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // Redirect based on app state
    if (!state.isSetupComplete) {
      router.push(ROUTES.SETUP);
    } else if (!state.user) {
      router.push(ROUTES.LOGIN);
    } else {
      router.push(ROUTES.DASHBOARD);
    }
  }, [state.isSetupComplete, state.user, router]);

  // Show loading while redirecting
  return (
    <div className="h-full w-full bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-company-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-foreground opacity-70">Loading...</p>
      </div>
    </div>
  );
}
