import { useState, useEffect, useCallback } from 'react';
import { KioskStartupResponse } from '@/types/kioskStartup';
import { apiGetKioskStartup } from '@/lib/apiAdapter';

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
  const [mockData, setMockData] = useState<KioskStartupResponse | null>(null);

  // Fetch mock data once
  useEffect(() => {
    const fetchMockData = async () => {
      try {
        console.log('Fetching mock data from /kiosk-startup-mock-data.json');
        const response = await fetch('/kiosk-startup-mock-data.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch mock data: ${response.status}`);
        }
        const data: KioskStartupResponse = await response.json();
        console.log('Mock data loaded successfully', { 
          employee: data.basics?.firstName, 
          operationsCount: data.context?.operations?.length 
        });
        setMockData(data);
      } catch (err) {
        console.error('Error fetching mock data:', err);
        setError('Failed to load kiosk startup data');
      }
    };

    fetchMockData();
  }, []);

  const fetchData = useCallback(async () => {
    if (!employeeId) {
      setError('Employee ID is required');
      return;
    }

    if (!mockData) return;

    setLoading(true);
    setError(null);

    try {
      // Use API adapter for environment-aware API calls
      const apiData = await apiGetKioskStartup({ employeeId });

      if (!apiData.success) {
        throw new Error(apiData.message || 'API returned unsuccessful response');
      }

      // Use API data if available, otherwise fallback to mock data
      const finalData: KioskStartupResponse = apiData.data.useMockData 
        ? mockData 
        : (apiData.data as unknown as KioskStartupResponse);

      setData(finalData);
    } catch (err) {
      console.error('Error fetching kiosk startup data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Fallback to mock data if API fails
      setData(mockData);
      setError(null); // Clear error since we have fallback data
    } finally {
      setLoading(false);
    }
  }, [employeeId, mockData]);

  // Auto fetch on mount if enabled and when mockData is available
  useEffect(() => {
    if (autoFetch && employeeId && mockData) {
      fetchData();
    }
  }, [autoFetch, employeeId, mockData, fetchData]);

  // Set up polling if refetchInterval is provided
  useEffect(() => {
    if (!refetchInterval || !employeeId || !mockData) return;

    const interval = setInterval(() => {
      fetchData();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, employeeId, mockData, fetchData]);

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
  const [mockData, setMockData] = useState<KioskStartupResponse | null>(null);

  // Fetch mock data once
  useEffect(() => {
    const fetchMockData = async () => {
      try {
        console.log('Fetching mock data from /kiosk-startup-mock-data.json');
        const response = await fetch('/kiosk-startup-mock-data.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch mock data: ${response.status}`);
        }
        const data = await response.json();
        console.log('Mock data loaded successfully', { 
          employee: data.basics?.firstName, 
          operationsCount: data.context?.operations?.length 
        });
        setMockData(data);
      } catch (err) {
        console.error('Error fetching mock data:', err);
        setError('Failed to load kiosk startup data');
      }
    };

    fetchMockData();
  }, []);

  const fetchForEmployee = useCallback(async (employeeId: string) => {
    if (!mockData) {
      throw new Error('Mock data not loaded yet');
    }

    setLoading(true);
    setError(null);

    try {
      // Use API adapter for environment-aware API calls
      const apiData = await apiGetKioskStartup({ employeeId });

      if (!apiData.success) {
        throw new Error(apiData.message || 'API returned unsuccessful response');
      }

      // Use API data if available, otherwise fallback to mock data
      const finalData: KioskStartupResponse = apiData.data.useMockData 
        ? mockData 
        : (apiData.data as unknown as KioskStartupResponse);

      setData(finalData);
      return finalData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch kiosk startup data:', err);
      
      // Fallback to mock data if API fails
      setData(mockData);
      setError(null); // Clear error since we have fallback data
      return mockData;
    } finally {
      setLoading(false);
    }
  }, [mockData]);

  return {
    data,
    loading,
    error,
    fetchForEmployee,
  };
}
