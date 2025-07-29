import { useState, useEffect, useCallback } from 'react';
import { KioskStartupResponse } from '@/types/kiosk';
import { apiGetKioskStartup } from '@/lib/apiAdapter';

// Types for the raw mock data structure (from exampleStartUp.json)
interface RawMockDataBasics {
  filekey: number;
  lastName: string;
  firstName: string;
  middle: string;
  idnum: string;
  badge: number;
  homeWg: {
    description: string;
    workPositionWgName: string;
    workPositionWgCode: string;
    workPositionName: string;
    workPositionAbb: string;
    levels: Array<{
      wgLevel: number;
      wgNum: number;
      caption: string;
    }>;
  };
}

interface RawMockData {
  basics: RawMockDataBasics;
  personalInfo?: unknown;
  profileInfo?: unknown;
  company?: unknown;
  time?: unknown;
  workGroups?: unknown;
  application?: unknown;
  operator?: unknown;
  schStyles?: unknown[];
  context?: {
    operations?: Array<{
      operation: number;
      description: string;
      caption: string;
      fkeyguid: string;
      hint: string;
      icon: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
}

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
  const [mockData, setMockData] = useState<RawMockData | null>(null);

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

      // Process mock data to create structured response
      const processedData = processMockData(mockData, employeeId);
      
      // Combine API structure with processed mock data (or use just processed data if API indicates mock mode)
      const finalData: KioskStartupResponse = apiData.data.useMockData 
        ? processedData 
        : { ...processedData, ...apiData.data };

      setData(finalData);
    } catch (err) {
      console.error('Error fetching kiosk startup data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Fallback to just processed mock data if API fails
      try {
        const processedData = processMockData(mockData, employeeId);
        setData(processedData);
        setError(null); // Clear error since we have fallback data
      } catch (fallbackErr) {
        console.error('Error processing fallback data:', fallbackErr);
        setError('Failed to load kiosk startup data');
      }
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
  const [mockData, setMockData] = useState<RawMockData | null>(null);

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

      // Process mock data to create structured response
      const processedData = processMockData(mockData, employeeId);
      
      // Combine API structure with processed mock data (or use just processed data if API indicates mock mode)
      const finalData: KioskStartupResponse = apiData.data.useMockData 
        ? processedData 
        : { ...processedData, ...apiData.data };

      setData(finalData);
      return finalData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch kiosk startup data:', err);
      
      // Fallback to just processed mock data if API fails
      try {
        const processedData = processMockData(mockData, employeeId);
        setData(processedData);
        setError(null); // Clear error since we have fallback data
        return processedData;
      } catch (fallbackErr) {
        console.error('Error processing fallback data:', fallbackErr);
        const fallbackError = new Error('Failed to load kiosk startup data');
        setError(fallbackError.message);
        throw fallbackError;
      }
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

// Helper function to process mock data and convert it to KioskStartupResponse format
function processMockData(mockData: RawMockData, employeeId: string): KioskStartupResponse {
  console.log('Processing kiosk startup mock data:', { 
    employee: mockData.basics?.firstName, 
    employeeId,
    operationsCount: mockData.context?.operations?.length 
  });
  
  // Return the mock data in the expected structure, updating the employee ID
  const processedData: KioskStartupResponse = {
    ...mockData,
    basics: {
      ...mockData.basics,
      idnum: employeeId, // Use the provided employee ID
    },
    personalInfo: mockData.personalInfo as KioskStartupResponse['personalInfo'],
    profileInfo: mockData.profileInfo as KioskStartupResponse['profileInfo'],
    company: mockData.company as KioskStartupResponse['company'],
    time: mockData.time as KioskStartupResponse['time'],
    workGroups: mockData.workGroups as KioskStartupResponse['workGroups'],
    application: mockData.application as KioskStartupResponse['application'],
    operator: mockData.operator as KioskStartupResponse['operator'],
    schStyles: mockData.schStyles as KioskStartupResponse['schStyles'],
    context: mockData.context as KioskStartupResponse['context'],
  };

  return processedData;
}
