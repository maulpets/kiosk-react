import { useState, useEffect, useCallback } from 'react';
import { KioskStartupResponse } from '@/types/kioskStartup';
import { apiGetKioskEmployeeData } from '@/lib/apiAdapter';

interface UseKioskEmployeeDataOptions {
  employeeId?: string;
  autoFetch?: boolean;
  refetchInterval?: number;
}

interface UseKioskEmployeeDataReturn {
  data: KioskStartupResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useKioskEmployeeData(options: UseKioskEmployeeDataOptions = {}): UseKioskEmployeeDataReturn {
  const { employeeId, autoFetch = false, refetchInterval } = options;
  
  const [data, setData] = useState<KioskStartupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!employeeId) {
      console.warn('No employeeId provided to fetchData');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching kiosk employee data for:', employeeId);
      // Use API adapter for environment-aware API calls
      const apiData = await apiGetKioskEmployeeData({ employeeId });

      if (!apiData.success) {
        throw new Error(apiData.message || 'API returned unsuccessful response');
      }

      // Set the data from the API response
      const finalData = apiData.data as unknown as KioskStartupResponse;
      setData(finalData);
      console.log('Kiosk employee data loaded successfully', { 
        employee: finalData.basics?.firstName, 
        operationsCount: finalData.context?.operations?.length 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch kiosk employee data:', err);
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

// Helper hook for when you need to fetch employee data for a specific employee
export function useFetchKioskEmployeeData() {
  const [data, setData] = useState<KioskStartupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForEmployee = useCallback(async (employeeId: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching kiosk employee data for:', employeeId);
      // Use API adapter for environment-aware API calls
      const apiData = await apiGetKioskEmployeeData({ employeeId });

      if (!apiData.success) {
        throw new Error(apiData.message || 'API returned unsuccessful response');
      }

      // Set the data from the API response
      const finalData = apiData.data as unknown as KioskStartupResponse;
      setData(finalData);
      console.log('Kiosk employee data loaded successfully', { 
        employee: finalData.basics?.firstName, 
        operationsCount: finalData.context?.operations?.length 
      });
      return finalData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch kiosk employee data:', err);
      throw err; // Re-throw to allow caller to handle the error
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
