import { useState, useEffect, useCallback } from 'react';
import { CompanySetupResponse } from '@/types/company';
import { apiGetCompanySetup } from '@/lib/apiAdapter';

// Types for the raw mock data structure
interface RawCompanyMockData {
  companies: Record<string, {
    name: string;
    logo: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      darkMode: 'light' | 'dark' | 'auto';
      fontSize: 'small' | 'medium' | 'large';
      fontFamily: string;
    };
    defaultLanguage: string;
    dailyMessage?: string;
    weeklyMessage?: string;
    timezone: string;
    features: string[];
  }>;
  defaultConfig: {
    name: string;
    logo: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      darkMode: 'light' | 'dark' | 'auto';
      fontSize: 'small' | 'medium' | 'large';
      fontFamily: string;
    };
    defaultLanguage: string;
    dailyMessage?: string;
    weeklyMessage?: string;
    timezone: string;
    features: string[];
  };
}

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
  const [mockData, setMockData] = useState<RawCompanyMockData | null>(null);

  // Fetch mock data once
  useEffect(() => {
    const fetchMockData = async () => {
      try {
        console.log('Fetching mock data from /company-setup-mock-data.json');
        const response = await fetch('/company-setup-mock-data.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch mock data: ${response.status}`);
        }
        const data = await response.json();
        console.log('Mock data loaded successfully', { 
          companiesCount: Object.keys(data.companies || {}).length,
          hasDefaultConfig: !!data.defaultConfig 
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

      // Process mock data to create structured response
      const processedData = processMockData(mockData, companyName);
      
      // Combine API structure with processed mock data (or use just processed data if API indicates mock mode)
      const finalData: CompanySetupResponse = apiData.data.useMockData 
        ? processedData 
        : { ...processedData, ...apiData.data };

      setData(finalData);
      return finalData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error setting up company:', err);
      
      // Fallback to just processed mock data if API fails
      try {
        const processedData = processMockData(mockData, companyName);
        setData(processedData);
        setError(null); // Clear error since we have fallback data
        return processedData;
      } catch (fallbackErr) {
        console.error('Error processing fallback data:', fallbackErr);
        const fallbackError = new Error('Failed to setup company');
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
    setupCompany,
  };
}

// Helper function to process mock data and convert it to CompanySetupResponse format
function processMockData(mockData: RawCompanyMockData, companyName: string): CompanySetupResponse {
  console.log('Processing company setup mock data:', { 
    companyName,
    companiesAvailable: Object.keys(mockData.companies || {}).length 
  });
  
  // Normalize company name for lookup
  const normalizedName = companyName.toLowerCase().trim();
  
  // Get company config or use default
  const companyConfig = mockData.companies[normalizedName] || {
    ...mockData.defaultConfig,
    name: companyName.trim()
  };

  return {
    success: true,
    company: companyConfig,
    message: `Successfully configured for ${companyConfig.name}`
  };
}
