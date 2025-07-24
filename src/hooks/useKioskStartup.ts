import { useState, useEffect, useCallback } from 'react';
import { KioskStartupResponse, ApiError } from '@/types/kiosk';

interface UseKioskStartupOptions {
  employeeId?: string;
  autoFetch?: boolean;
  refetchInterval?: number;
}

interface UseKioskStartupReturn {
  data: KioskStartupResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useKioskStartup(options: UseKioskStartupOptions = {}): UseKioskStartupReturn {
  const { employeeId, autoFetch = false, refetchInterval } = options;
  
  const [data, setData] = useState<KioskStartupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!employeeId) {
      setError('Employee ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/kiosk-startup?employeeId=${encodeURIComponent(employeeId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result: KioskStartupResponse = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch kiosk startup data:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  // Auto fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && employeeId) {
      fetchData();
    }
  }, [autoFetch, employeeId, fetchData]);

  // Set up polling if refetchInterval is provided
  useEffect(() => {
    if (!refetchInterval || !employeeId) return;

    const interval = setInterval(() => {
      fetchData();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, employeeId, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Helper hook for when you need to fetch startup data for a specific employee
export function useFetchKioskStartup() {
  const [data, setData] = useState<KioskStartupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForEmployee = useCallback(async (employeeId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/kiosk-startup?employeeId=${encodeURIComponent(employeeId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result: KioskStartupResponse = await response.json();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch kiosk startup data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchForEmployee,
  };
}
