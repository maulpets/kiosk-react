'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/store/AppContext';
import { ROUTES } from '@/constants';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { state } = useAppContext();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If setup is not complete and not on setup page, redirect to setup
    if (!state.isSetupComplete && pathname !== ROUTES.SETUP) {
      router.push(ROUTES.SETUP);
      return;
    }

    // If setup is complete but no user and not on login page, redirect to login
    if (state.isSetupComplete && !state.user && pathname !== ROUTES.LOGIN) {
      router.push(ROUTES.LOGIN);
      return;
    }

    // If user is logged in and on setup or login page, redirect to dashboard
    if (state.user && (pathname === ROUTES.SETUP || pathname === ROUTES.LOGIN)) {
      router.push(ROUTES.DASHBOARD);
      return;
    }
  }, [state.isSetupComplete, state.user, pathname, router]);

  return <>{children}</>;
}
