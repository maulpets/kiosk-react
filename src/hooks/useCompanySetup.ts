import { useState, useEffect, useCallback } from 'react';
import { CompanySetupResponse } from '@/types/company';
import { apiGetCompanySetup } from '@/lib/apiAdapter';

interface UseCompanySetupReturn {
  data: CompanySetupResponse | null;
  loading: boolean;
  error: string | null;
  setupCompany: (companyName: string) => Promise<CompanySetupResponse>;
}

export function useCompanySetup(): UseCompanySetupReturn {
  const [data, setData] = useState<CompanySetupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockData, setMockData] = useState<CompanySetupResponse | null>(null);

  // Fetch mock data once
  useEffect(() => {
    const fetchMockData = async () => {
      try {
        console.log('Fetching mock data from /company-setup-mock-data.json');
        const response = await fetch('/company-setup-mock-data.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch mock data: ${response.status}`);
        }
        const data: CompanySetupResponse = await response.json();
        console.log('Mock data loaded successfully', { 
          success: data.success,
          companyName: data.company?.name 
        });
        setMockData(data);
      } catch (err) {
        console.error('Error fetching mock data:', err);
        setError('Failed to load company setup data');
      }
    };

    fetchMockData();
  }, []);

  const setupCompany = useCallback(async (companyName: string): Promise<CompanySetupResponse> => {
    if (!companyName.trim()) {
      throw new Error('Company name is required');
    }

    if (!mockData) {
      throw new Error('Mock data not loaded yet');
    }

    setLoading(true);
    setError(null);

    try {
      // Use API adapter for environment-aware API calls
      const apiData = await apiGetCompanySetup({ companyName });

      if (!apiData.success) {
        throw new Error(apiData.message || 'API returned unsuccessful response');
      }

      // Use API data if available, otherwise fallback to mock data
      const finalData: CompanySetupResponse = apiData.data.useMockData 
        ? mockData 
        : (apiData.data as unknown as CompanySetupResponse);

      setData(finalData);
      return finalData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error setting up company:', err);
      
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
    setupCompany,
  };
}
